import { currentEatYear } from '$lib/utils/dates';
import { db } from '../db';

/**
 * Sequential, human-readable document numbers, e.g. `QUO-2026-0001`.
 *
 * The year comes from the EAT calendar so numbering rolls over with the business
 * year rather than UTC. Concurrent inserts are expected to be rare for a single
 * operator; the unique constraint on each number is the final safety net.
 */
function buildNumber(prefix: string, latest: string | null): string {
	const base = `${prefix}-${currentEatYear()}-`;
	const sequence = latest ? Number(latest.slice(base.length)) + 1 : 1;
	return `${base}${String(sequence).padStart(4, '0')}`;
}

export async function nextQuoteNumber(): Promise<string> {
	const base = `QUO-${currentEatYear()}-`;
	const latest = await db.quote.findFirst({
		where: { quoteNumber: { startsWith: base } },
		orderBy: { quoteNumber: 'desc' },
		select: { quoteNumber: true }
	});
	return buildNumber('QUO', latest?.quoteNumber ?? null);
}

export async function nextInvoiceNumber(): Promise<string> {
	const base = `INV-${currentEatYear()}-`;
	const latest = await db.invoice.findFirst({
		where: { invoiceNumber: { startsWith: base } },
		orderBy: { invoiceNumber: 'desc' },
		select: { invoiceNumber: true }
	});
	return buildNumber('INV', latest?.invoiceNumber ?? null);
}

export async function nextBookingNumber(): Promise<string> {
	const base = `BKG-${currentEatYear()}-`;
	const latest = await db.booking.findFirst({
		where: { bookingNumber: { startsWith: base } },
		orderBy: { bookingNumber: 'desc' },
		select: { bookingNumber: true }
	});
	return buildNumber('BKG', latest?.bookingNumber ?? null);
}
