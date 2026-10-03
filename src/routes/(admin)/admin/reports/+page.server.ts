import type { PageServerLoad } from './$types';
import { getReports } from '$lib/server/reporting/reports';

export const load: PageServerLoad = async () => {
	return { reports: await getReports() };
};
