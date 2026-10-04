import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { bookingSchema } from '$lib/schemas/booking';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { quoteSchema, readLineItems } from '$lib/schemas/quote';
import { recordAudit } from '$lib/server/audit';
import { getSiteSettings } from '$lib/server/content/site';
import {
	convertQuoteToBooking,
	deleteQuote,
	getQuote,
	setQuoteDiscount,
	setQuoteStatus,
	updateQuote
} from '$lib/server/crm/quotes';
import { firstCleanDiscountTzs } from '$lib/server/pricing/engine';
import { db } from '$lib/server/db';
import type { QuoteStatus } from '$lib/server/generated/prisma/enums';

export const load: PageServerLoad = async ({ params }) => {
	// All three lookups are independent, so run them together.
	const [quote, clients, services] = await Promise.all([
		getQuote(params.id),
		db.client.findMany({
			orderBy: { displayName: 'asc' },
			select: { id: true, displayName: true }
		}),
		db.service.findMany({
			where: { isActive: true },
			orderBy: { sortOrder: 'asc' },
			select: { id: true, name: true }
		})
	]);

	if (!quote) {
		throw error(404, 'Quote not found.');
	}

	return { quote, clients, services };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const data = await request.formData();
		const parsed = quoteSchema.safeParse(formDataToObject(data));

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		await updateQuote(params.id, parsed.data, readLineItems(data));
		await recordAudit({ userId: locals.user?.id, action: 'update', entityType: 'Quote', entityId: params.id });

		return { success: true };
	},

	setStatus: async ({ request, params, locals }) => {
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
		const quote = await getQuote(params.id);
		if (!quote) return fail(404, { message: 'Quote not found.' });

		const settings = await getSiteSettings();
		const discountTzs = firstCleanDiscountTzs(quote.subtotalTzs, settings.firstCleanDiscountPercent);
		await setQuoteDiscount(params.id, discountTzs);
		await recordAudit({
			userId: locals.user?.id,
			action: 'promotion',
			entityType: 'Quote',
			entityId: params.id,
			diff: { promotion: 'FIRST_CLEAN', percent: settings.firstCleanDiscountPercent }
		});

		return { success: true, message: `First-clean ${settings.firstCleanDiscountPercent}% discount applied.` };
	},

	applyReferralCredit: async ({ params, locals }) => {
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
		await deleteQuote(params.id);
		throw redirect(303, '/admin/quotes');
	}
};
