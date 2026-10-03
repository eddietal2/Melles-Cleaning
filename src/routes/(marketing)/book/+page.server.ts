import type { Actions, PageServerLoad } from './$types';
import { getServices } from '$lib/server/content/site';
import { handleLeadSubmission } from '$lib/server/crm/lead-form';

export const load: PageServerLoad = async ({ url }) => {
	return {
		services: await getServices(),
		preselectedServiceId: url.searchParams.get('service') ?? ''
	};
};

export const actions: Actions = {
	default: async ({ request }) => handleLeadSubmission(request, { withSchedule: true })
};
