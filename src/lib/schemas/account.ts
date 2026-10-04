import { z } from 'zod';

/**
 * Changing login credentials. The current password is always required; the new
 * password is optional, so an owner can change only their email without touching
 * the password. Password confirmation is only enforced when a new password is set.
 */
export const accountSchema = z
	.object({
		email: z.email('Enter a valid email address.').max(200),
		currentPassword: z.string().min(1, 'Enter your current password.').max(200),
		newPassword: z.string().max(200).optional(),
		confirmPassword: z.string().max(200).optional()
	})
	.refine((value) => !value.newPassword || value.newPassword.length >= 8, {
		path: ['newPassword'],
		message: 'Use at least 8 characters.'
	})
	.refine((value) => !value.newPassword || value.newPassword === value.confirmPassword, {
		path: ['confirmPassword'],
		message: 'Passwords do not match.'
	});

export type AccountInput = z.infer<typeof accountSchema>;
