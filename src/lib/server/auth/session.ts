import { createHash, randomBytes } from 'node:crypto';
import { dev } from '$app/env';
import type { Cookies } from '@sveltejs/kit';
import { db } from '../db';
import type { Role } from '../generated/prisma/enums';

/** Name of the httpOnly cookie that carries the opaque session token. */
export const SESSION_COOKIE_NAME = 'melles_session';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

export interface SessionUser {
	id: string;
	email: string;
	name: string;
	role: Role;
}

export interface SessionInfo {
	id: string;
	expiresAt: Date;
}

export interface SessionValidationResult {
	session: SessionInfo | null;
	user: SessionUser | null;
}

/** Generates a cryptographically random, URL-safe session token. */
function generateSessionToken(): string {
	return randomBytes(32).toString('base64url');
}

/**
 * Only a hash of the token is persisted, so a database leak cannot be used to
 * impersonate a logged-in user.
 */
function hashSessionToken(token: string): string {
	return createHash('sha256').update(token).digest('hex');
}

/** Creates a session row and sets the session cookie on the response. */
export async function createSession(userId: string, cookies: Cookies): Promise<void> {
	const token = generateSessionToken();
	const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

	await db.session.create({
		data: { userId, tokenHash: hashSessionToken(token), expiresAt }
	});

	cookies.set(SESSION_COOKIE_NAME, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		expires: expiresAt,
		maxAge: Math.floor(SESSION_TTL_MS / 1000)
	});
}

/** Resolves a raw session token to its session and user, if valid. */
export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const session = await db.session.findUnique({
		where: { tokenHash: hashSessionToken(token) },
		include: { user: true }
	});

	if (!session) {
		return { session: null, user: null };
	}

	if (session.expiresAt.getTime() <= Date.now()) {
		await db.session.delete({ where: { id: session.id } }).catch(() => undefined);
		return { session: null, user: null };
	}

	if (!session.user.isActive) {
		return { session: null, user: null };
	}

	return {
		session: { id: session.id, expiresAt: session.expiresAt },
		user: {
			id: session.user.id,
			email: session.user.email,
			name: session.user.name,
			role: session.user.role
		}
	};
}

/** Deletes the session row and clears the cookie. */
export async function invalidateSession(sessionId: string, cookies: Cookies): Promise<void> {
	await db.session.delete({ where: { id: sessionId } }).catch(() => undefined);
	clearSessionCookie(cookies);
}

/** Clears the session cookie without touching the database. */
export function clearSessionCookie(cookies: Cookies): void {
	cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
}
