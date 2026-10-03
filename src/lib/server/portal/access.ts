import { randomBytes } from 'node:crypto';
import type { SessionUser } from '../auth/session';
import { hashPassword } from '../auth/password';
import { recordAudit } from '../audit';
import { db } from '../db';

/**
 * Client-portal access.
 *
 * A portal user is a `User` with the `CLIENT` role whose email matches one of the
 * client's contact emails. This keeps the portal working without a schema change;
 * promoting it to an explicit `Client.userId` foreign key later is a drop-in
 * replacement for `resolvePortalClient`.
 *
 * Owners and admins may preview any client by adding `?client=<id>`.
 */

export async function getClientById(id: string) {
	return db.client.findUnique({ where: { id } });
}

/** Resolves the client a signed-in portal user belongs to, by contact email. */
export async function resolvePortalClient(user: SessionUser) {
	const contact = await db.clientContact.findFirst({
		where: { email: { equals: user.email, mode: 'insensitive' } },
		orderBy: { isPrimary: 'desc' },
		include: { client: true }
	});

	return contact?.client ?? null;
}

/**
 * Resolves the client for any portal request: a client user is scoped to their own
 * record, while owner/admin users may preview a specific client.
 */
export async function resolveClientForRequest(user: SessionUser, url: URL) {
	if (user.role === 'OWNER' || user.role === 'ADMIN') {
		const previewId = url.searchParams.get('client');
		return previewId ? getClientById(previewId) : null;
	}

	if (user.role === 'CLIENT') {
		return resolvePortalClient(user);
	}

	return null;
}

/** Whether a portal login exists for any of the client's contact emails. */
export async function findPortalUserForClient(clientId: string) {
	const contacts = await db.clientContact.findMany({
		where: { clientId, email: { not: null } },
		select: { email: true }
	});

	const emails = contacts
		.map((contact) => contact.email?.toLowerCase())
		.filter((email): email is string => Boolean(email));

	if (emails.length === 0) {
		return null;
	}

	return db.user.findFirst({
		where: { role: 'CLIENT', email: { in: emails, mode: 'insensitive' } },
		select: { id: true, email: true, isActive: true, lastLoginAt: true }
	});
}

export type InviteResult = { error: string } | { email: string; password: string };

function generatePassword(): string {
	return randomBytes(9).toString('base64url');
}

/**
 * Creates a CLIENT user for the client's primary contact email and returns the
 * generated password so the owner can share it. Fails if a contact email is
 * missing or a user already exists.
 */
export async function inviteClientToPortal(
	clientId: string,
	invitedById: string | null
): Promise<InviteResult> {
	const contact = await db.clientContact.findFirst({
		where: { clientId, email: { not: null } },
		orderBy: { isPrimary: 'desc' },
		select: { name: true, email: true }
	});

	if (!contact?.email) {
		return { error: 'Add a contact with an email address before inviting this client.' };
	}

	const email = contact.email.toLowerCase();
	const existing = await db.user.findUnique({ where: { email } });

	if (existing) {
		return { error: 'A user with that email address already exists.' };
	}

	const password = generatePassword();
	const user = await db.user.create({
		data: { email, name: contact.name, role: 'CLIENT', passwordHash: await hashPassword(password) }
	});

	await recordAudit({
		userId: invitedById,
		action: 'invite',
		entityType: 'PortalUser',
		entityId: user.id,
		diff: { clientId, email }
	});

	return { email, password };
}
