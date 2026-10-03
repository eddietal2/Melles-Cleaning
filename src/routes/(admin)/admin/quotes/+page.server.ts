import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { quoteSchema, readLineItems } from '$lib/schemas/quote';
import { recordAudit } from '$lib/server/audit';
import { createQuote, listQuotes } from '$lib/server/crm/quotes';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const [quotes, clients] = await Promise.all([
		listQuotes(),
		db.client.findMany({
			orderBy: { displayName: 'asc' },
			select: { id: true, displayName: true }
		})
	]);

	return { quotes, clients };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();
		const parsed = quoteSchema.safeParse(formDataToObject(data));

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		const quote = await createQuote(parsed.data, readLineItems(data));
		await recordAudit({
			userId: locals.user?.id,
			action: 'create',
			entityType: 'Quote',
			entityId: quote.id,
			diff: { quoteNumber: quote.quoteNumber }
		});

		throw redirect(303, `/admin/quotes/${quote.id}`);
	}
};
