import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { resolveClientForRequest } from '$lib/server/portal/access';

/**
 * Client-portal guard. Clients are scoped to their own record; owners and admins
 * may preview any client with `?client=<id>`. Anything else is refused.
 */
export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		throw redirect(303, `/login?redirectTo=${encodeURIComponent('/portal')}`);
	}

	const { role } = locals.user;
	if (role !== 'CLIENT' && role !== 'OWNER' && role !== 'ADMIN') {
		throw error(403, 'The client portal is for clients only.');
	}

	const client = await resolveClientForRequest(locals.user, url);

	if (!client) {
		if (role === 'CLIENT') {
			throw error(
				403,
				'Your account is not linked to a client record yet. Please contact us and we will connect it.'
			);
		}
		throw error(400, 'Choose a client to preview by adding ?client=<id> to the URL.');
	}

	return { client, isPreview: role !== 'CLIENT' };
};
