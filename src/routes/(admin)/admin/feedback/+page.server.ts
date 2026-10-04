import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { feedbackSchema } from '$lib/schemas/feedback';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { recordAudit } from '$lib/server/audit';
import {
	createFeedback,
	deleteFeedback,
	listFeedback,
	setFeedbackPublished
} from '$lib/server/crm/feedback';
import { db } from '$lib/server/db';

export const load: PageServerLoad = () => {
	// Streamed so the page frame renders immediately.
	return {
		streamed: Promise.all([
			listFeedback(),
			db.booking.findMany({
				where: { status: { in: ['COMPLETED', 'VERIFIED', 'INVOICED', 'PAID'] } },
				orderBy: { scheduledStart: 'desc' },
				select: {
					id: true,
					bookingNumber: true,
					client: { select: { displayName: true } }
				}
			})
		]).then(([feedback, bookings]) => ({ feedback, bookings }))
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const parsed = feedbackSchema.safeParse(formDataToObject(await request.formData()));

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		const entry = await createFeedback(parsed.data);
		await recordAudit({
			userId: locals.user?.id,
			action: 'create',
			entityType: 'Feedback',
			entityId: entry.id,
			diff: { rating: entry.rating }
		});

		return { success: true };
	},

	setPublished: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const published = String(data.get('published') ?? '') === 'true';

		await setFeedbackPublished(id, published);
		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		await deleteFeedback(String(data.get('id') ?? ''));
		return { success: true };
	}
};
