import type { PageServerLoad } from './$types';
import { getServices } from '../../../lib/server/content/site';

export const load: PageServerLoad = async () => {
	return { services: await getServices() };
};
