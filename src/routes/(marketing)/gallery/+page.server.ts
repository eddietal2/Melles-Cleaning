import type { PageServerLoad } from './$types';
import { getPublishedGallery } from '$lib/server/content/site';

export const load: PageServerLoad = async () => {
	return { items: await getPublishedGallery() };
};
