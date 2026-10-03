import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { clearSessionCookie, invalidateSession } from '../../../lib/server/auth/session';

/** Signs the current user out and returns them to the login page. */
export const POST: RequestHandler = async ({ locals, cookies }) => {
	if (locals.session) {
		await invalidateSession(locals.session.id, cookies);
	} else {
		clearSessionCookie(cookies);
	}

	throw redirect(303, '/login');
};
