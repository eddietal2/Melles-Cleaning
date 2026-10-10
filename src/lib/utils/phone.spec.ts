import { describe, expect, it } from 'vitest';
import { formatTzPhone, normalizeTzPhone, tzPhoneInputValue } from './phone';

describe('normalizeTzPhone', () => {
	it('normalises local, national and international mobile numbers', () => {
		expect(normalizeTzPhone('0712 345 678')).toBe('+255712345678');
		expect(normalizeTzPhone('712345678')).toBe('+255712345678');
		expect(normalizeTzPhone('+255 712 345 678')).toBe('+255712345678');
		expect(normalizeTzPhone('255712345678')).toBe('+255712345678');
		expect(normalizeTzPhone('00255712345678')).toBe('+255712345678');
	});

	it('handles landline numbers', () => {
		expect(normalizeTzPhone('022 123 4567')).toBe('+255221234567');
	});

	it('returns null for empty or unrecognisable values', () => {
		expect(normalizeTzPhone('')).toBeNull();
		expect(normalizeTzPhone(null)).toBeNull();
		expect(normalizeTzPhone(undefined)).toBeNull();
		expect(normalizeTzPhone('12345')).toBeNull();
	});
});

describe('formatTzPhone', () => {
	it('renders a readable grouped format', () => {
		expect(formatTzPhone('0712345678')).toBe('+255 712 345 678');
		expect(formatTzPhone('+255712345678')).toBe('+255 712 345 678');
	});

	it('falls back to the original value or an em dash', () => {
		expect(formatTzPhone('not a number')).toBe('not a number');
		expect(formatTzPhone('')).toBe('—');
	});
});

describe('tzPhoneInputValue', () => {
	it('reduces stored numbers to the nine-digit national form', () => {
		expect(tzPhoneInputValue('+255712345678')).toBe('712345678');
		expect(tzPhoneInputValue('0712345678')).toBe('712345678');
		expect(tzPhoneInputValue('712345678')).toBe('712345678');
	});

	it('strips separators and caps the length', () => {
		expect(tzPhoneInputValue('12-34-56-789')).toBe('123456789');
		expect(tzPhoneInputValue('')).toBe('');
		expect(tzPhoneInputValue(null)).toBe('');
	});
});
