import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { SESSION_COOKIE_NAME, validateSessionToken } from './lib/server/auth/session';

/**
 * Every request passes through here so that `event.locals.user` is populated
 * before any load function or form action runs.
 *
 * Route protection is centralized: anything under `/admin` requires a session,
 * and users are bounced to the login page with a `redirectTo` they return to
 * after signing in.
 */
const PROTECTED_PREFIX = '/admin';

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE_NAME) ?? null;

	const { session, user } = token
		? await validateSessionToken(token)
		: { session: null, user: null };

	event.locals.session = session;
	event.locals.user = user;

	const path = event.url.pathname;
	const isProtected = path === PROTECTED_PREFIX || path.startsWith(`${PROTECTED_PREFIX}/`);

	if (isProtected && !event.locals.user) {
		const redirectTo = encodeURIComponent(`${path}${event.url.search}`);
		throw redirect(303, `/login?redirectTo=${redirectTo}`);
	}

	return resolve(event);
};
