import { describe, expect, it } from 'vitest';
import { fieldErrors, formDataToObject, leadSchema } from './lead';

describe('leadSchema', () => {
	it('accepts a minimal valid lead and defaults the source', () => {
		const result = leadSchema.safeParse({ fullName: 'Asha M.', phone: '+255700000000' });

		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.source).toBe('WEBSITE');
		}
	});

	it('rejects a blank phone number', () => {
		const result = leadSchema.safeParse({ fullName: 'Asha M.', phone: '' });

		expect(result.success).toBe(false);
	});

	it('rejects an invalid email address', () => {
		const result = leadSchema.safeParse({
			fullName: 'Asha M.',
			phone: '0700000000',
			email: 'not-an-email'
		});

		expect(result.success).toBe(false);
	});
});

describe('formDataToObject', () => {
	it('drops whitespace-only values', () => {
		const form = new FormData();
		form.set('fullName', 'Asha');
		form.set('email', '   ');

		expect(formDataToObject(form)).toEqual({ fullName: 'Asha' });
	});
});

describe('fieldErrors', () => {
	it('maps validation issues back to their fields', () => {
		const result = leadSchema.safeParse({ fullName: 'A', phone: '' });

		expect(result.success).toBe(false);
		if (!result.success) {
			const errors = fieldErrors(result.error);
			expect(errors.fullName).toBeTruthy();
			expect(errors.phone).toBeTruthy();
		}
	});
});
