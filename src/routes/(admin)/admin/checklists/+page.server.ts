import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { ensureChecklistForBooking, listJobChecklists, listTemplates } from '$lib/server/crm/checklists';
import { db } from '$lib/server/db';

export const load: PageServerLoad = () => {
	// Streamed so the page frame renders immediately.
	return {
		streamed: Promise.all([
			listTemplates(),
			listJobChecklists(),
			db.booking.findMany({
				where: { checklist: null, status: { notIn: ['CANCELLED'] } },
				orderBy: { scheduledStart: 'desc' },
				select: {
					id: true,
					bookingNumber: true,
					client: { select: { displayName: true } }
				}
			})
		]).then(([templates, jobChecklists, bookingsWithoutChecklist]) => ({
			templates,
			jobChecklists,
			bookingsWithoutChecklist
		}))
	};
};

export const actions: Actions = {
	attach: async ({ request }) => {
		const data = await request.formData();
		const bookingId = String(data.get('bookingId') ?? '');

		if (!bookingId) {
			return fail(400, { message: 'Choose a booking.' });
		}

		const checklist = await ensureChecklistForBooking(bookingId);

		if (!checklist) {
			return fail(400, { message: 'No checklist template is configured.' });
		}

		return { success: true };
	}
};
