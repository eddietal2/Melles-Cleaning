import { error, redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import type { Role } from '../../../lib/server/generated/prisma/enums';

/** Roles allowed to reach the admin area at all. */
const ADMIN_ROLES: readonly Role[] = ['OWNER', 'ADMIN', 'SUPERVISOR'];

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(303, '/login?redirectTo=%2Fadmin');
	}

	if (!ADMIN_ROLES.includes(locals.user.role)) {
		throw error(403, 'You do not have access to the admin area.');
	}

	return { user: locals.user };
};
