import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { clientContactSchema, clientSchema } from '$lib/schemas/client';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { recordAudit } from '$lib/server/audit';
import { addClientContact, createClient, deleteClient, listClients } from '$lib/server/crm/clients';

export const load: PageServerLoad = () => {
	// Streamed so the page frame renders immediately.
	return { streamed: listClients() };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = formDataToObject(await request.formData());
		const parsed = clientSchema.safeParse(data);

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error), values: data });
		}

		const client = await createClient(parsed.data);

		const contact = clientContactSchema.safeParse({
			name: data.contactName,
			phone: data.contactPhone,
			role: data.contactRole,
			email: data.contactEmail
		});
		if (contact.success) {
			await addClientContact(client.id, contact.data);
		}

		await recordAudit({
			userId: locals.user?.id,
			action: 'create',
			entityType: 'Client',
			entityId: client.id,
			diff: { displayName: client.displayName }
		});

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		await deleteClient(id);
		await recordAudit({ userId: locals.user?.id, action: 'delete', entityType: 'Client', entityId: id });

		return { success: true };
	}
};
