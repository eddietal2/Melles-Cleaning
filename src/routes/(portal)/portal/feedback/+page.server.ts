import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { feedbackSchema } from '$lib/schemas/feedback';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { resolveClientForRequest } from '$lib/server/portal/access';
import {
	listFeedbackEligibleBookings,
	listPortalFeedback,
	submitClientFeedback
} from '$lib/server/portal/data';

export const load: PageServerLoad = async ({ parent }) => {
	const { client } = await parent();
	if (!client) throw error(400, 'No client selected.');

	const [history, eligible] = await Promise.all([
		listPortalFeedback(client.id),
		listFeedbackEligibleBookings(client.id)
	]);

	return { history, eligible };
};

export const actions: Actions = {
	submit: async ({ request, locals, url }) => {
		if (!locals.user) {
			return fail(401, { message: 'Please sign in again.' });
		}

		const client = await resolveClientForRequest(locals.user, url);
		if (!client) {
			return fail(400, { message: 'No client selected.' });
		}

		const parsed = feedbackSchema.safeParse(formDataToObject(await request.formData()));

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		const result = await submitClientFeedback(
			client.id,
			parsed.data.bookingId,
			parsed.data.rating,
			parsed.data.comment
		);

		if ('error' in result) {
			return fail(400, { message: result.error });
		}

		return { success: true };
	}
};
