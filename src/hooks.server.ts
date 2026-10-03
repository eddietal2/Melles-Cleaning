import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit/hooks';
import { cookieDomain, cookieMaxAge, cookieName, locales } from './lib/paraglide/runtime';
import { paraglideMiddleware } from './lib/paraglide/server';
import { SESSION_COOKIE_NAME, validateSessionToken } from './lib/server/auth/session';

/**
 * Every request passes through here so that `event.locals.user` and
 * `event.locals.locale` are populated before any load function or form action runs.
 *
 * Locale switching uses a `?lang=en|sw` query parameter: we persist the choice in
 * Paraglide's cookie and redirect to the clean URL, so the very next render is in
 * the requested language (and no client JavaScript is required).
 *
 * Route protection is centralized: anything under `/admin` requires a session, and
 * users are bounced to the login page with a `redirectTo` they return to after signing in.
 */
const PROTECTED_PREFIX = '/admin';

function isKnownLocale(value: string | null): value is (typeof locales)[number] {
	return value !== null && (locales as readonly string[]).includes(value);
}

export const handle: Handle = async ({ event, resolve }) => {
	const requested = event.url.searchParams.get('lang');

	if (isKnownLocale(requested)) {
		event.cookies.set(cookieName, requested, {
			path: '/',
			sameSite: 'lax',
			httpOnly: false,
			maxAge: cookieMaxAge,
			domain: cookieDomain || undefined
		});

		const clean = new URL(event.url);
		clean.searchParams.delete('lang');
		throw redirect(303, `${clean.pathname}${clean.search}`);
	}

	return paraglideMiddleware(event.request, async ({ locale }) => {
		event.locals.locale = locale;

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
	});
};
