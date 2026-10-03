import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPublishedFaq, getServiceBySlug } from '$lib/server/content/site';

export const load: PageServerLoad = async ({ params }) => {
	const service = await getServiceBySlug(params.slug);

	if (!service) {
		throw error(404, 'That service could not be found.');
	}

	const faq = await getPublishedFaq();

	return { service, faq };
};
