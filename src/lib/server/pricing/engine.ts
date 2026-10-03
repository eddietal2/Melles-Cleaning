/**
 * Pricing engine. All amounts are integer Tanzanian Shillings (TZS); every total
 * is recomputed server-side so a client can never dictate the final figure.
 */

export interface LineItemInput {
	description: string;
	quantity: number;
	unitPriceTzs: number;
}

export interface DocumentTotals {
	subtotalTzs: number;
	discountTzs: number;
	totalTzs: number;
}

/** Rounds a single line to whole TZS. */
export function computeLineTotalTzs(quantity: number, unitPriceTzs: number): number {
	const safeQuantity = Number.isFinite(quantity) ? quantity : 0;
	const safeUnitPrice = Number.isFinite(unitPriceTzs) ? unitPriceTzs : 0;
	return Math.round(safeQuantity * safeUnitPrice);
}

/** Keeps a discount within `[0, subtotal]`. */
export function clampDiscount(subtotalTzs: number, discountTzs: number): number {
	if (!Number.isFinite(discountTzs) || discountTzs <= 0) return 0;
	return Math.min(Math.round(discountTzs), Math.max(subtotalTzs, 0));
}

/** Sums line items and applies a flat discount. */
export function computeTotals(items: LineItemInput[], discountTzs = 0): DocumentTotals {
	const subtotalTzs = items.reduce(
		(sum, item) => sum + computeLineTotalTzs(item.quantity, item.unitPriceTzs),
		0
	);
	const discount = clampDiscount(subtotalTzs, discountTzs);
	return { subtotalTzs, discountTzs: discount, totalTzs: subtotalTzs - discount };
}

/** Converts a percentage discount into a whole-TZS amount. */
export function discountFromPercent(subtotalTzs: number, percent: number): number {
	if (!Number.isFinite(percent) || percent <= 0) return 0;
	return clampDiscount(subtotalTzs, Math.round((subtotalTzs * percent) / 100));
}

export interface PaymentLike {
	amountTzs: number;
}

/** Total amount received against a document. */
export function totalPaid(payments: PaymentLike[]): number {
	return payments.reduce((sum, payment) => sum + (Number.isFinite(payment.amountTzs) ? payment.amountTzs : 0), 0);
}

/** Parses a TZS form input such as "40,000" or "TZS 40 000" into an integer. */
export function parseTzsInput(value: FormDataEntryValue | null | undefined): number {
	const digits = String(value ?? '').replace(/[^0-9]/g, '');
	if (digits === '') return 0;
	return Number.parseInt(digits, 10);
}

/** The first-clean promotion: a percentage discount for a new client's first job. */
export function firstCleanDiscountTzs(subtotalTzs: number, percent: number): number {
	return discountFromPercent(subtotalTzs, percent);
}

/** Applies a referral credit to an amount, never dropping the total below zero. */
export function applyCredit(
	amountTzs: number,
	creditTzs: number
): { totalTzs: number; creditAppliedTzs: number } {
	const credit = Math.min(Math.max(Math.round(creditTzs), 0), Math.max(Math.round(amountTzs), 0));
	return { totalTzs: Math.max(amountTzs, 0) - credit, creditAppliedTzs: credit };
}
