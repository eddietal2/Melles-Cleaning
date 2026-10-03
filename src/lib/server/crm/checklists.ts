import type { ChecklistResultInput } from '$lib/schemas/checklist';
import { db } from '../db';

export async function listTemplates() {
	return db.checklistTemplate.findMany({
		orderBy: { createdAt: 'asc' },
		include: {
			items: { orderBy: { sortOrder: 'asc' } },
			_count: { select: { jobChecklists: true } }
		}
	});
}

export async function listJobChecklists() {
	return db.jobChecklist.findMany({
		orderBy: { createdAt: 'desc' },
		include: {
			booking: { include: { client: true, service: true } },
			template: { select: { name: true } },
			_count: { select: { results: true } }
		}
	});
}

export async function getJobChecklist(id: string) {
	return db.jobChecklist.findUnique({
		where: { id },
		include: {
			booking: { include: { client: true, service: true } },
			template: { include: { items: { orderBy: { sortOrder: 'asc' } } } },
			supervisor: { include: { user: { select: { name: true } } } },
			results: { include: { photoMedia: true } }
		}
	});
}

/**
 * Instantiates a job checklist for a booking, choosing the template that matches
 * the client type and falls back to the default. Idempotent per booking.
 */
export async function ensureChecklistForBooking(bookingId: string, templateId?: string) {
	const existing = await db.jobChecklist.findUnique({ where: { bookingId } });
	if (existing) return existing;

	const booking = await db.booking.findUnique({
		where: { id: bookingId },
		include: { client: { select: { clientType: true } } }
	});
	if (!booking) return null;

	const template =
		(templateId
			? await db.checklistTemplate.findUnique({
					where: { id: templateId },
					include: { items: true }
				})
			: null) ??
		(await db.checklistTemplate.findFirst({
			where: { isDefault: true, appliesTo: booking.client.clientType },
			include: { items: true }
		})) ??
		(await db.checklistTemplate.findFirst({
			where: { isDefault: true },
			include: { items: true }
		})) ??
		(await db.checklistTemplate.findFirst({
			include: { items: true },
			orderBy: { createdAt: 'asc' }
		}));

	if (!template) return null;

	return db.jobChecklist.create({
		data: {
			bookingId,
			templateId: template.id,
			results: {
				create: template.items.map((item) => ({ templateItemId: item.id, isChecked: false }))
			}
		}
	});
}

/** Persists ticked/unticked items and nudges the checklist into progress. */
export async function saveChecklistResults(jobChecklistId: string, results: ChecklistResultInput[]) {
	await db.$transaction(
		results.map((result) =>
			db.checklistResult.update({
				where: { id: result.resultId },
				data: {
					isChecked: result.isChecked,
					note: result.note ?? null,
					checkedAt: result.isChecked ? new Date() : null
				}
			})
		)
	);

	const checked = await db.checklistResult.count({
		where: { jobChecklistId, isChecked: true }
	});

	await db.jobChecklist.update({
		where: { id: jobChecklistId },
		data: { status: checked === 0 ? 'PENDING' : 'IN_PROGRESS' }
	});
}

/** Completes a checklist with the supervisor walkthrough and client sign-off. */
export async function signOffChecklist(
	jobChecklistId: string,
	supervisorUserId: string | null,
	clientSignatureName?: string
) {
	const supervisor = supervisorUserId
		? await db.staffProfile.findUnique({
				where: { userId: supervisorUserId },
				select: { id: true }
			})
		: null;

	await db.jobChecklist.update({
		where: { id: jobChecklistId },
		data: {
			status: 'COMPLETED',
			completedAt: new Date(),
			supervisorId: supervisor?.id ?? null,
			clientSignatureName: clientSignatureName ?? null,
			signedOffAt: new Date()
		}
	});
}
