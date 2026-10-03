import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { listPortalBookings } from '$lib/server/portal/data';

export const load: PageServerLoad = async ({ parent }) => {
	const { client } = await parent();
	if (!client) throw error(400, 'No client selected.');

	return { bookings: await listPortalBookings(client.id) };
};
