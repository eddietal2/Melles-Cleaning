import type { InvoiceInput, InvoiceLineItemInput } from '$lib/schemas/invoice';
import type { InvoiceStatus } from '$lib/server/generated/prisma/enums';
import { addDays } from '$lib/utils/dates';
import { computeTotals, totalPaid } from '../pricing/engine';
import { db } from '../db';
import { nextInvoiceNumber } from './numbering';

interface StatusInput {
	status: InvoiceStatus;
	totalTzs: number;
	paidTzs: number;
	dueDate: Date | null;
}

/**
 * Single source of truth for invoice status. Manual DRAFT and VOID states are
 * preserved; everything else is derived from payments and the due date.
 */
export function deriveInvoiceStatus({ status, totalTzs, paidTzs, dueDate }: StatusInput): InvoiceStatus {
	if (status === 'VOID') return 'VOID';
	if (totalTzs > 0 && paidTzs >= totalTzs) return 'PAID';
	if (paidTzs > 0) return 'PARTIAL';
	if (status === 'DRAFT') return 'DRAFT';
	if (dueDate && dueDate.getTime() < Date.now()) return 'OVERDUE';
	return 'ISSUED';
}

export async function listInvoices(status?: InvoiceStatus) {
	return db.invoice.findMany({
		where: status ? { status } : undefined,
		orderBy: { createdAt: 'desc' },
		include: {
			client: true,
			booking: { select: { id: true, bookingNumber: true } },
			payments: { select: { amountTzs: true } },
			_count: { select: { lineItems: true } }
		}
	});
}

export async function getInvoice(id: string) {
	return db.invoice.findUnique({
		where: { id },
		include: {
			client: { include: { contacts: true } },
			booking: { include: { service: true } },
			lineItems: { orderBy: { sortOrder: 'asc' } },
			payments: {
				orderBy: { receivedAt: 'desc' },
				include: { receivedBy: { select: { name: true } } }
			}
		}
	});
}

function lineItemData(items: InvoiceLineItemInput[]) {
	return items.map((item, index) => ({
		description: item.description,
		quantity: item.quantity,
		unitPriceTzs: item.unitPriceTzs,
		lineTotalTzs: item.quantity * item.unitPriceTzs,
		sortOrder: index
	}));
}

export async function createInvoice(input: InvoiceInput, items: InvoiceLineItemInput[]) {
	const totals = computeTotals(items, input.discountTzs);
	const invoiceNumber = await nextInvoiceNumber();

	return db.invoice.create({
		data: {
			clientId: input.clientId,
			bookingId: input.bookingId ?? null,
			invoiceNumber,
			subtotalTzs: totals.subtotalTzs,
			discountTzs: totals.discountTzs,
			totalTzs: totals.totalTzs,
			dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00+03:00`) : addDays(new Date(), 14),
			lineItems: { create: lineItemData(items) }
		}
	});
}

/** Replaces invoice line items and recalculates totals from the submitted form. */
export async function updateInvoice(id: string, input: InvoiceInput, items: InvoiceLineItemInput[]) {
	const totals = computeTotals(items, input.discountTzs);

	return db.$transaction(async (tx) => {
		await tx.invoiceLineItem.deleteMany({ where: { invoiceId: id } });

		return tx.invoice.update({
			where: { id },
			data: {
				clientId: input.clientId,
				bookingId: input.bookingId ?? null,
				subtotalTzs: totals.subtotalTzs,
				discountTzs: totals.discountTzs,
				totalTzs: totals.totalTzs,
				dueDate: input.dueDate ? new Date(`${input.dueDate}T00:00:00+03:00`) : null,
				lineItems: { create: lineItemData(items) }
			}
		});
	});
}

/** Generates a single-line invoice straight from a completed booking. */
export async function createInvoiceFromBooking(bookingId: string, dueInDays = 14) {
	const booking = await db.booking.findUnique({
		where: { id: bookingId },
		include: { service: true, invoice: true }
	});

	if (!booking || booking.invoice) {
		return null;
	}

	const invoiceNumber = await nextInvoiceNumber();
	const amount = booking.quotedTotalTzs;

	return db.invoice.create({
		data: {
			clientId: booking.clientId,
			bookingId: booking.id,
			invoiceNumber,
			subtotalTzs: amount,
			discountTzs: 0,
			totalTzs: amount,
			dueDate: addDays(new Date(), dueInDays),
			lineItems: {
				create: [
					{
						description: `${booking.service.name} — ${booking.bookingNumber}`,
						quantity: 1,
						unitPriceTzs: amount,
						lineTotalTzs: amount,
						sortOrder: 0
					}
				]
			}
		}
	});
}

export async function issueInvoice(id: string) {
	const invoice = await db.invoice.update({
		where: { id },
		data: { status: 'ISSUED', issuedAt: new Date() },
		select: { id: true, bookingId: true }
	});

	if (invoice.bookingId) {
		await db.booking
			.update({ where: { id: invoice.bookingId }, data: { status: 'INVOICED' } })
			.catch(() => undefined);
	}
}

export async function voidInvoice(id: string) {
	await db.invoice.update({ where: { id }, data: { status: 'VOID' } });
}

/**
 * Recomputes an invoice's status from its payments and syncs the linked booking,
 * so recording a payment is the only step needed to move a job to Paid.
 */
export async function recomputeInvoiceStatus(invoiceId: string): Promise<InvoiceStatus | null> {
	const invoice = await db.invoice.findUnique({
		where: { id: invoiceId },
		include: { payments: true, booking: { select: { status: true } } }
	});

	if (!invoice) return null;

	const status = deriveInvoiceStatus({
		status: invoice.status,
		totalTzs: invoice.totalTzs,
		paidTzs: totalPaid(invoice.payments),
		dueDate: invoice.dueDate
	});

	await db.invoice.update({
		where: { id: invoiceId },
		data: { status, paidAt: status === 'PAID' ? (invoice.paidAt ?? new Date()) : null }
	});

	if (invoice.bookingId) {
		if (status === 'PAID') {
			await db.booking
				.update({ where: { id: invoice.bookingId }, data: { status: 'PAID' } })
				.catch(() => undefined);
		} else if (invoice.booking?.status === 'PAID') {
			await db.booking
				.update({ where: { id: invoice.bookingId }, data: { status: 'INVOICED' } })
				.catch(() => undefined);
		}
	}

	return status;
}

/** Outstanding balance on an invoice including its payments. */
export function invoiceBalance(invoice: { totalTzs: number; payments: { amountTzs: number }[] }): number {
	return Math.max(invoice.totalTzs - totalPaid(invoice.payments), 0);
}
