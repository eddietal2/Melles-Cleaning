import type { Actions, PageServerLoad } from './$types';
import { recordAudit } from '$lib/server/audit';
import { getSiteSettings } from '$lib/server/content/site';
import { deleteQuote, listQuotes } from '$lib/server/crm/quotes';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const settings = await getSiteSettings();

	// Streamed so the page frame renders immediately. The defaults for the Terms
	// & Conditions editor are loaded up front so the modal is prefilled.
	return {
		defaultTerms: { en: settings.quoteTermsEn, sw: settings.quoteTermsSw },
		streamed: Promise.all([
			listQuotes(),
			db.client.findMany({
				orderBy: { displayName: 'asc' },
				select: { id: true, displayName: true }
			})
		]).then(([quotes, clients]) => ({ quotes, clients }))
	};
};

export const actions: Actions = {
	/** Saves the bilingual default terms used as the starting text for new quotes. */
	terms: async ({ request, locals }) => {
		const data = await request.formData();
		const termsEn = String(data.get('termsEn') ?? '').slice(0, 2000);
		const termsSw = String(data.get('termsSw') ?? '').slice(0, 2000);

		await Promise.all([
			db.siteSetting.upsert({
				where: { key: 'quote_terms_en' },
				update: { value: termsEn },
				create: { key: 'quote_terms_en', value: termsEn, group: 'quotes' }
			}),
			db.siteSetting.upsert({
				where: { key: 'quote_terms_sw' },
				update: { value: termsSw },
				create: { key: 'quote_terms_sw', value: termsSw, group: 'quotes' }
			})
		]);
		await recordAudit({
			userId: locals.user?.id,
			action: 'update',
			entityType: 'QuoteTerms'
		});

		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		await deleteQuote(id);
		await recordAudit({
			userId: locals.user?.id,
			action: 'delete',
			entityType: 'Quote',
			entityId: id
		});

		return { success: true };
	}
};
