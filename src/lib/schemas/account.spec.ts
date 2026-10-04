import { describe, expect, it } from 'vitest';
import { accountSchema } from './account';

describe('accountSchema', () => {
	it('accepts an email-only change', () => {
		const result = accountSchema.safeParse({ email: 'new@example.com', currentPassword: 'secret' });
		expect(result.success).toBe(true);
	});

	it('accepts a valid password change', () => {
		const result = accountSchema.safeParse({
			email: 'owner@example.com',
			currentPassword: 'secret',
			newPassword: 'longenough',
			confirmPassword: 'longenough'
		});
		expect(result.success).toBe(true);
	});

	it('rejects a short new password', () => {
		const result = accountSchema.safeParse({
			email: 'owner@example.com',
			currentPassword: 'secret',
			newPassword: 'short',
			confirmPassword: 'short'
		});
		expect(result.success).toBe(false);
	});

	it('rejects mismatched confirmation', () => {
		const result = accountSchema.safeParse({
			email: 'owner@example.com',
			currentPassword: 'secret',
			newPassword: 'longenough',
			confirmPassword: 'different1'
		});
		expect(result.success).toBe(false);
	});

	it('requires the current password', () => {
		const result = accountSchema.safeParse({ email: 'owner@example.com', currentPassword: '' });
		expect(result.success).toBe(false);
	});

	it('rejects an invalid email address', () => {
		const result = accountSchema.safeParse({ email: 'not-an-email', currentPassword: 'secret' });
		expect(result.success).toBe(false);
	});
});
