import type { PageServerLoad } from './$types';
import { getDashboardMetrics } from '$lib/server/reporting/reports';

export const load: PageServerLoad = async () => {
	return { metrics: await getDashboardMetrics() };
};
