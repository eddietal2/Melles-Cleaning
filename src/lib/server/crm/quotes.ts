import type { QuoteInput, QuoteLineItemInput } from '$lib/schemas/quote';
import type { QuoteStatus } from '$lib/server/generated/prisma/enums';
import { computeTotals } from '../pricing/engine';
import { db } from '../db';
import { createBooking } from './bookings';
import { nextQuoteNumber } from './numbering';
import type { BookingInput } from '$lib/schemas/booking';

export async function listQuotes(status?: QuoteStatus) {
	return db.quote.findMany({
		where: status ? { status } : undefined,
		orderBy: { createdAt: 'desc' },
		include: {
			client: true,
			_count: { select: { lineItems: true } },
			booking: { select: { id: true, bookingNumber: true } }
		}
	});
}

export async function getQuote(id: string) {
	return db.quote.findUnique({
		where: { id },
		include: {
			client: true,
			lineItems: { orderBy: { sortOrder: 'asc' } },
			booking: { select: { id: true, bookingNumber: true } }
		}
	});
}

function lineItemData(items: QuoteLineItemInput[]) {
	return items.map((item, index) => ({
		description: item.description,
		quantity: item.quantity,
		unitPriceTzs: item.unitPriceTzs,
		lineTotalTzs: item.quantity * item.unitPriceTzs,
		sortOrder: index
	}));
}

export async function createQuote(input: QuoteInput, items: QuoteLineItemInput[]) {
	const totals = computeTotals(items, input.discountTzs);
	const quoteNumber = await nextQuoteNumber();

	return db.quote.create({
		data: {
			clientId: input.clientId,
			quoteNumber,
			subtotalTzs: totals.subtotalTzs,
			discountTzs: totals.discountTzs,
			totalTzs: totals.totalTzs,
			validUntil: input.validUntil ? new Date(`${input.validUntil}T00:00:00+03:00`) : null,
			notes: input.notes ?? null,
			lineItems: { create: lineItemData(items) }
		}
	});
}

/** Replaces the whole line-item set so totals always match the current form. */
export async function updateQuote(id: string, input: QuoteInput, items: QuoteLineItemInput[]) {
	const totals = computeTotals(items, input.discountTzs);

	return db.$transaction(async (tx) => {
		await tx.quoteLineItem.deleteMany({ where: { quoteId: id } });

		return tx.quote.update({
			where: { id },
			data: {
				clientId: input.clientId,
				subtotalTzs: totals.subtotalTzs,
				discountTzs: totals.discountTzs,
				totalTzs: totals.totalTzs,
				validUntil: input.validUntil ? new Date(`${input.validUntil}T00:00:00+03:00`) : null,
				notes: input.notes ?? null,
				lineItems: { create: lineItemData(items) }
			}
		});
	});
}

export async function setQuoteStatus(id: string, status: QuoteStatus) {
	await db.quote.update({
		where: { id },
		data: { status, sentAt: status === 'SENT' ? new Date() : undefined }
	});
}

export async function deleteQuote(id: string) {
	await db.quote.delete({ where: { id } });
}

/** Sets a flat discount and recalculates totals from the existing line items. */
export async function setQuoteDiscount(id: string, discountTzs: number) {
	const quote = await db.quote.findUnique({ where: { id }, include: { lineItems: true } });
	if (!quote) return null;

	const totals = computeTotals(quote.lineItems, discountTzs);

	return db.quote.update({
		where: { id },
		data: {
			subtotalTzs: totals.subtotalTzs,
			discountTzs: totals.discountTzs,
			totalTzs: totals.totalTzs
		}
	});
}

/**
 * Converts an accepted quote into a scheduled booking. The booking inherits the
 * quote total; the quote is marked accepted and linked for traceability.
 */
export async function convertQuoteToBooking(quoteId: string, input: BookingInput) {
	const quote = await db.quote.findUnique({
		where: { id: quoteId },
		include: { booking: true }
	});

	if (!quote || quote.booking) {
		return null;
	}

	const booking = await createBooking(
		{ ...input, clientId: quote.clientId, quotedTotalTzs: quote.totalTzs },
		{ quoteId }
	);

	await db.quote.update({ where: { id: quoteId }, data: { status: 'ACCEPTED' } });

	return booking;
}
