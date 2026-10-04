import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { clientContactSchema, clientSchema } from '$lib/schemas/client';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { recordAudit } from '$lib/server/audit';
import {
	addClientContact,
	deleteClientContact,
	getClient,
	updateClient
} from '$lib/server/crm/clients';
import { findPortalUserForClient, inviteClientToPortal } from '$lib/server/portal/access';

export const load: PageServerLoad = async ({ params }) => {
	// Run the client lookup and portal-access check together.
	const [client, portalUser] = await Promise.all([
		getClient(params.id),
		findPortalUserForClient(params.id)
	]);

	if (!client) {
		throw error(404, 'Client not found.');
	}

	return { client, portalUser };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const data = formDataToObject(await request.formData());
		const parsed = clientSchema.safeParse(data);

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		await updateClient(params.id, parsed.data);
		await recordAudit({
			userId: locals.user?.id,
			action: 'update',
			entityType: 'Client',
			entityId: params.id
		});

		return { success: true };
	},

	addContact: async ({ request, params }) => {
		const data = formDataToObject(await request.formData());
		const parsed = clientContactSchema.safeParse(data);

		if (!parsed.success) {
			return fail(400, { contactErrors: fieldErrors(parsed.error) });
		}

		await addClientContact(params.id, parsed.data);
		return { success: true };
	},

	deleteContact: async ({ request }) => {
		const data = await request.formData();
		await deleteClientContact(String(data.get('id') ?? ''));
		return { success: true };
	},

	invitePortal: async ({ params, locals }) => {
		const result = await inviteClientToPortal(params.id, locals.user?.id ?? null);

		if ('error' in result) {
			return fail(400, { message: result.error });
		}

		return { success: true, invite: result };
	}
};
