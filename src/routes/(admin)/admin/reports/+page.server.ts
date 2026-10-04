import type { PageServerLoad } from './$types';
import { getReports } from '$lib/server/reporting/reports';

export const load: PageServerLoad = () => {
	// Streamed so the page frame renders immediately while the aggregates compute.
	return { streamed: getReports() };
};
