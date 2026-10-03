import { db } from '../db';
import type { LeadInput } from '../../schemas/lead';

/** Persists a captured lead and returns its id and display name. */
export async function createLead(input: LeadInput): Promise<{ id: string; fullName: string }> {
	const lead = await db.lead.create({
		data: {
			fullName: input.fullName,
			phone: input.phone,
			email: input.email ?? null,
			segment: input.segment ?? null,
			serviceInterestId: input.serviceInterestId ?? null,
			message: input.message ?? null,
			source: input.source
		},
		select: { id: true, fullName: true }
	});

	return lead;
}

/** Best-effort owner notification. Never throws so a failed email can't lose a lead. */
export async function notifyNewLead(
	lead: { id: string; fullName: string },
	input: LeadInput,
	notificationEmail: string
): Promise<void> {
	if (!notificationEmail) {
		console.info(`[lead] ${lead.fullName} (${input.phone}) — no notification email configured`);
		return;
	}

	console.info(`[lead] ${lead.fullName} (${input.phone}) captured, notifying ${notificationEmail}`);
}
