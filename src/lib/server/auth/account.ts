import type { AccountInput } from '$lib/schemas/account';
import { recordAudit } from '../audit';
import { db } from '../db';
import { hashPassword, verifyPassword } from './password';

export type AccountUpdateResult =
	| { error: string; field?: keyof AccountInput }
	| { ok: true; emailChanged: boolean; passwordChanged: boolean };

/**
 * Updates the signed-in user's login email and/or password.
 *
 * The current password must be verified first. Changing the password revokes every
 * other session (the caller's own session is kept) so a stolen cookie cannot
 * outlive a credential change. Diffs are audit-logged without the password itself.
 */
export async function updateAccount(
	userId: string,
	currentSessionId: string | null,
	input: AccountInput
): Promise<AccountUpdateResult> {
	const user = await db.user.findUnique({ where: { id: userId } });

	if (!user) {
		return { error: 'Account not found.' };
	}

	const currentValid = await verifyPassword(input.currentPassword, user.passwordHash);
	if (!currentValid) {
		return { error: 'Your current password is incorrect.', field: 'currentPassword' };
	}

	const email = input.email.trim().toLowerCase();
	const emailChanged = email !== user.email;
	const newPassword = input.newPassword;
	const passwordChanged = Boolean(newPassword);

	if (!emailChanged && !passwordChanged) {
		return { error: 'Change your email or enter a new password, then save.', field: 'newPassword' };
	}

	if (emailChanged) {
		const clash = await db.user.findFirst({ where: { email, NOT: { id: userId } } });
		if (clash) {
			return { error: 'That email address is already in use.', field: 'email' };
		}
	}

	await db.user.update({
		where: { id: userId },
		data: {
			email: emailChanged ? email : undefined,
			passwordHash: passwordChanged && newPassword ? await hashPassword(newPassword) : undefined
		}
	});

	if (passwordChanged) {
		await db.session.deleteMany({
			where: { userId, ...(currentSessionId ? { NOT: { id: currentSessionId } } : {}) }
		});
	}

	await recordAudit({
		userId,
		action: 'update',
		entityType: 'User',
		entityId: userId,
		diff: { emailChanged, passwordChanged }
	});

	return { ok: true, emailChanged, passwordChanged };
}
