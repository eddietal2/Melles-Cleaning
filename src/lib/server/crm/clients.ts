import type { ClientContactInput, ClientInput } from '$lib/schemas/client';
import { db } from '../db';

/** Lightweight client list with the counters shown in the CRM. */
export async function listClients() {
	return db.client.findMany({
		orderBy: { displayName: 'asc' },
		include: {
			contacts: { orderBy: [{ isPrimary: 'desc' }] },
			_count: { select: { bookings: true, invoices: true, quotes: true } }
		}
	});
}

/** Full client profile with contacts, quotes, bookings and invoices. */
export async function getClient(id: string) {
	return db.client.findUnique({
		where: { id },
		include: {
			contacts: { orderBy: [{ isPrimary: 'desc' }] },
			lead: true,
			quotes: { orderBy: { createdAt: 'desc' } },
			bookings: {
				orderBy: { scheduledStart: 'desc' },
				include: { service: true, invoice: true }
			},
			invoices: {
				orderBy: { createdAt: 'desc' },
				include: { payments: true }
			}
		}
	});
}

export async function createClient(input: ClientInput) {
	return db.client.create({
		data: {
			displayName: input.displayName,
			clientType: input.clientType,
			addressLine: input.addressLine ?? null,
			area: input.area ?? null,
			city: input.city,
			notes: input.notes ?? null
		}
	});
}

export async function updateClient(id: string, input: ClientInput) {
	return db.client.update({
		where: { id },
		data: {
			displayName: input.displayName,
			clientType: input.clientType,
			addressLine: input.addressLine ?? null,
			area: input.area ?? null,
			city: input.city,
			notes: input.notes ?? null
		}
	});
}

/** The first contact added for a client becomes the primary contact. */
export async function addClientContact(clientId: string, input: ClientContactInput) {
	const existing = await db.clientContact.count({ where: { clientId } });

	return db.clientContact.create({
		data: {
			clientId,
			name: input.name,
			role: input.role ?? null,
			phone: input.phone,
			email: input.email ?? null,
			isPrimary: existing === 0
		}
	});
}

export async function deleteClientContact(id: string) {
	await db.clientContact.delete({ where: { id } });
}

export async function deleteClient(id: string) {
	await db.client.delete({ where: { id } });
}

/** Converts a captured lead into a client, preserving the link back to the lead. */
export async function convertLeadToClient(leadId: string) {
	const lead = await db.lead.findUnique({
		where: { id: leadId },
		include: { serviceInterest: true, convertedClient: true }
	});

	if (!lead || lead.convertedClient) {
		return lead?.convertedClient ?? null;
	}

	const [client] = await db.$transaction([
		db.client.create({
			data: {
				leadId: lead.id,
				displayName: lead.fullName,
				clientType: lead.segment ?? 'RESIDENTIAL',
				notes: lead.message ?? null,
				contacts: {
					create: {
						name: lead.fullName,
						phone: lead.phone,
						email: lead.email ?? null,
						isPrimary: true
					}
				}
			}
		}),
		db.lead.update({ where: { id: lead.id }, data: { status: 'WON' } })
	]);

	return client;
}
