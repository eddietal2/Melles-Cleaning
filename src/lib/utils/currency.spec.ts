import { describe, expect, it } from 'vitest';
import { formatTzs, formatTzsRange, formatTzsWithUnit } from './currency';

describe('currency formatting', () => {
	it('formats whole TZS amounts', () => {
		expect(formatTzs(40000)).toBe('40,000 TZS');
	});

	it('formats an inclusive range', () => {
		expect(formatTzsRange(40000, 60000)).toBe('40,000 – 60,000 TZS');
	});

	it('collapses a range where the bounds are equal', () => {
		expect(formatTzsRange(5000, 5000)).toBe('5,000 TZS');
	});

	it('appends a unit when provided', () => {
		expect(formatTzsWithUnit(150000, 'per month')).toBe('150,000 TZS per month');
	});
});
