import type { PageServerLoad } from './$types';
import { getDashboardMetrics } from '$lib/server/reporting/reports';

export const load: PageServerLoad = () => {
	// Returned as a promise (not awaited) so the shell renders immediately and the
	// metrics stream in behind a skeleton.
	return { streamed: getDashboardMetrics() };
};
