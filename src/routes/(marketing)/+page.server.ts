import type { PageServerLoad } from './$types';
import { getServices } from '$lib/server/content/site';

/**
 * Home page reads the live service catalogue (with active pricing packages) so the
 * combined services-and-pricing section always reflects what the owner published.
 * Awaited rather than streamed so the copy is in the initial HTML for SEO.
 */
export const load: PageServerLoad = async () => {
	return { services: await getServices() };
};
