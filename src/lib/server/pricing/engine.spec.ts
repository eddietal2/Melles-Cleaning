import { describe, expect, it } from 'vitest';
import {
	applyCredit,
	clampDiscount,
	computeLineTotalTzs,
	computeTotals,
	discountFromPercent,
	firstCleanDiscountTzs,
	parseTzsInput,
	totalPaid
} from './engine';

describe('computeLineTotalTzs', () => {
	it('multiplies quantity by unit price and rounds to whole TZS', () => {
		expect(computeLineTotalTzs(3, 40000)).toBe(120000);
		expect(computeLineTotalTzs(1.5, 33333)).toBe(50000);
	});

	it('treats non-finite input as zero', () => {
		expect(computeLineTotalTzs(Number.NaN, 40000)).toBe(0);
		expect(computeLineTotalTzs(2, Number.POSITIVE_INFINITY)).toBe(0);
	});
});

describe('computeTotals', () => {
	it('sums line items and applies a discount', () => {
		const totals = computeTotals(
			[
				{ description: 'Deep clean', quantity: 1, unitPriceTzs: 120000 },
				{ description: 'Sofa', quantity: 2, unitPriceTzs: 30000 }
			],
			20000
		);

		expect(totals.subtotalTzs).toBe(180000);
		expect(totals.discountTzs).toBe(20000);
		expect(totals.totalTzs).toBe(160000);
	});

	it('never lets a discount exceed the subtotal', () => {
		const totals = computeTotals([{ description: 'Job', quantity: 1, unitPriceTzs: 40000 }], 90000);

		expect(totals.discountTzs).toBe(40000);
		expect(totals.totalTzs).toBe(0);
	});
});

describe('clampDiscount', () => {
	it('ignores negative values', () => {
		expect(clampDiscount(50000, -100)).toBe(0);
	});
});

describe('discountFromPercent', () => {
	it('converts a percentage into whole TZS', () => {
		expect(discountFromPercent(100000, 20)).toBe(20000);
	});

	it('returns zero for a non-positive percentage', () => {
		expect(discountFromPercent(100000, 0)).toBe(0);
	});
});

describe('totalPaid', () => {
	it('sums recorded payment amounts', () => {
		expect(totalPaid([{ amountTzs: 30000 }, { amountTzs: 20000 }])).toBe(50000);
	});
});

describe('parseTzsInput', () => {
	it('strips separators and currency noise', () => {
		expect(parseTzsInput('TZS 40,000')).toBe(40000);
		expect(parseTzsInput('')).toBe(0);
	});
});

describe('firstCleanDiscountTzs', () => {
	it('applies the configured first-clean percentage', () => {
		expect(firstCleanDiscountTzs(120000, 20)).toBe(24000);
	});
});

describe('applyCredit', () => {
	it('applies a referral credit without going negative', () => {
		expect(applyCredit(120000, 10000)).toEqual({ totalTzs: 110000, creditAppliedTzs: 10000 });
	});

	it('caps the credit at the amount owed', () => {
		expect(applyCredit(5000, 10000)).toEqual({ totalTzs: 0, creditAppliedTzs: 5000 });
	});
});
