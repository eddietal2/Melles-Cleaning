import type { PageServerLoad } from './$types';
import { getPricingPackages } from '$lib/server/content/site';

export const load: PageServerLoad = async () => {
	return { packages: await getPricingPackages() };
};
