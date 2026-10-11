import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { bookingSchema } from '$lib/schemas/booking';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { quoteSchema, readLineItems } from '$lib/schemas/quote';
import { recordAudit } from '$lib/server/audit';
import { getSiteSettings } from '$lib/server/content/site';
import {
	convertQuoteToBooking,
	createQuote,
	deleteQuote,
	getQuote,
	setQuoteDiscount,
	setQuoteStatus,
	updateQuote
} from '$lib/server/crm/quotes';
import { firstCleanDiscountTzs } from '$lib/server/pricing/engine';
import { db } from '$lib/server/db';
import type { QuoteStatus } from '$lib/server/generated/prisma/enums';

/** The shaped detail returned by {@link getQuote}, used to type the blank draft. */
type QuoteDetail = NonNullable<Awaited<ReturnType<typeof getQuote>>>;

/** Sentinel id used by `/admin/quotes/new` for a not-yet-saved quote. */
const NEW_ID = 'new';

/** A blank, unsaved quote so the editor can render before anything is persisted. */
function blankQuote(): QuoteDetail {
	return {
		id: NEW_ID,
		quoteNumber: '',
		clientId: '',
		status: 'DRAFT',
		subtotalTzs: 0,
		discountTzs: 0,
		totalTzs: 0,
		validUntil: null,
		notes: null,
		sentAt: null,
		createdAt: new Date(),
		updatedAt: new Date(),
		client: null,
		lineItems: [],
		booking: null
	} as unknown as QuoteDetail;
}

export const load: PageServerLoad = async ({ params }) => {
	const isNew = params.id === NEW_ID;
	const settings = await getSiteSettings();

	// Clients and services are streamed so the editor frame can paint first, giving
	// an instant navigation for `/admin/quotes/new`.
	const streamed = Promise.all([
		db.client.findMany({
			orderBy: { displayName: 'asc' },
			select: { id: true, displayName: true }
		}),
		db.service.findMany({
			where: { isActive: true },
			orderBy: { sortOrder: 'asc' },
			select: { id: true, name: true }
		})
	]).then(([clients, services]) => ({ clients, services }));

	const defaultTerms = { en: settings.quoteTermsEn, sw: settings.quoteTermsSw };

	if (isNew) {
		return { isNew, quote: blankQuote(), defaultTerms, streamed };
	}

	const quote = await getQuote(params.id);
	if (!quote) {
		throw error(404, 'Quote not found.');
	}

	return { isNew, quote, defaultTerms, streamed };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const data = await request.formData();
		const parsed = quoteSchema.safeParse(formDataToObject(data));

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		// Saving a brand-new quote actually creates it here, then the editor reloads
		// against the real record.
		if (params.id === NEW_ID) {
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

		await updateQuote(params.id, parsed.data, readLineItems(data));
		await recordAudit({
			userId: locals.user?.id,
			action: 'update',
			entityType: 'Quote',
			entityId: params.id
		});

		return { success: true };
	},

	setStatus: async ({ request, params, locals }) => {
		if (params.id === NEW_ID) return fail(400, { message: 'Save the quote first.' });

		const data = await request.formData();
		const status = String(data.get('status') ?? '') as QuoteStatus;

		await setQuoteStatus(params.id, status);
		await recordAudit({
			userId: locals.user?.id,
			action: 'status',
			entityType: 'Quote',
			entityId: params.id,
			diff: { status }
		});

		return { success: true };
	},

	applyFirstClean: async ({ params, locals }) => {
		if (params.id === NEW_ID) return fail(400, { message: 'Save the quote first.' });

		const quote = await getQuote(params.id);
		if (!quote) return fail(404, { message: 'Quote not found.' });

		const settings = await getSiteSettings();
		const discountTzs = firstCleanDiscountTzs(
			quote.subtotalTzs,
			settings.firstCleanDiscountPercent
		);
		await setQuoteDiscount(params.id, discountTzs);
		await recordAudit({
			userId: locals.user?.id,
			action: 'promotion',
			entityType: 'Quote',
			entityId: params.id,
			diff: { promotion: 'FIRST_CLEAN', percent: settings.firstCleanDiscountPercent }
		});

		return {
			success: true,
			message: `First-clean ${settings.firstCleanDiscountPercent}% discount applied.`
		};
	},

	applyReferralCredit: async ({ params, locals }) => {
		if (params.id === NEW_ID) return fail(400, { message: 'Save the quote first.' });

		const quote = await getQuote(params.id);
		if (!quote) return fail(404, { message: 'Quote not found.' });

		const settings = await getSiteSettings();
		await setQuoteDiscount(params.id, quote.discountTzs + settings.referralCreditTzs);
		await recordAudit({
			userId: locals.user?.id,
			action: 'promotion',
			entityType: 'Quote',
			entityId: params.id,
			diff: { promotion: 'REFERRAL', creditTzs: settings.referralCreditTzs }
		});

		return { success: true, message: 'Referral credit applied.' };
	},

	convert: async ({ request, params, locals }) => {
		if (params.id === NEW_ID) return fail(400, { message: 'Save the quote first.' });

		const parsed = bookingSchema.safeParse(formDataToObject(await request.formData()));

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		const booking = await convertQuoteToBooking(params.id, parsed.data);
		if (!booking) {
			return fail(400, { message: 'This quote has already become a booking.' });
		}

		await recordAudit({
			userId: locals.user?.id,
			action: 'convert',
			entityType: 'Quote',
			entityId: params.id,
			diff: { bookingId: booking.id }
		});

		throw redirect(303, `/admin/bookings/${booking.id}`);
	},

	delete: async ({ params }) => {
		if (params.id === NEW_ID) throw redirect(303, '/admin/quotes');

		await deleteQuote(params.id);
		throw redirect(303, '/admin/quotes');
	}
};
