import type { Actions, PageServerLoad } from './$types';
import { getServices } from '$lib/server/content/site';
import { handleLeadSubmission } from '$lib/server/crm/lead-form';

export const load: PageServerLoad = async () => {
	return { services: await getServices() };
};

export const actions: Actions = {
	default: async ({ request }) => handleLeadSubmission(request)
};
