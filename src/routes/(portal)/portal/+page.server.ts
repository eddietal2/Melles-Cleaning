import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getPortalOverview } from '$lib/server/portal/data';

export const load: PageServerLoad = async ({ parent }) => {
	const { client } = await parent();
	if (!client) throw error(400, 'No client selected.');

	return { overview: await getPortalOverview(client.id) };
};
