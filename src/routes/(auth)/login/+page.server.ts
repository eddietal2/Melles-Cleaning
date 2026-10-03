import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '../../../lib/server/db';
import { verifyPassword } from '../../../lib/server/auth/password';
import { createSession } from '../../../lib/server/auth/session';

/** Only allow redirects back into our own site. */
function safeRedirect(target: string | null): string {
	return target && target.startsWith('/') ? target : '/admin';
}

export const load: PageServerLoad = async ({ locals, url }) => {
	const redirectTo = safeRedirect(url.searchParams.get('redirectTo'));

	if (locals.user) {
		throw redirect(303, redirectTo);
	}

	return { redirectTo };
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const data = await request.formData();
		const email = String(data.get('email') ?? '')
			.trim()
			.toLowerCase();
		const password = String(data.get('password') ?? '');
		const redirectTo = safeRedirect(String(data.get('redirectTo') ?? '/'));

		if (!email || !password) {
			return fail(400, { email, error: 'Enter your email and password.' });
		}

		const user = await db.user.findUnique({ where: { email } });

		// Deliberately identical message for missing/inactive/wrong-password to
		// avoid leaking which accounts exist.
		if (!user || !user.isActive) {
			return fail(400, { email, error: 'Invalid email or password.' });
		}

		const valid = await verifyPassword(password, user.passwordHash);
		if (!valid) {
			return fail(400, { email, error: 'Invalid email or password.' });
		}

		await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
		await createSession(user.id, cookies);

		throw redirect(303, redirectTo);
	}
};
