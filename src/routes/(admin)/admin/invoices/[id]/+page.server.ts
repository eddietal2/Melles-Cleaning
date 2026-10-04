import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { invoiceSchema, readInvoiceLineItems } from '$lib/schemas/invoice';
import { paymentSchema } from '$lib/schemas/payment';
import { recordAudit } from '$lib/server/audit';
import { getSiteSettings } from '$lib/server/content/site';
import {
	getInvoice,
	invoiceBalance,
	issueInvoice,
	setInvoiceDiscount,
	updateInvoice,
	voidInvoice
} from '$lib/server/crm/invoices';
import { deletePayment, recordPayment } from '$lib/server/crm/payments';
import {
	notifyInvoiceIssued,
	notifyInvoiceReminder,
	primaryContact
} from '$lib/server/notify/notifications';
import { initiateCollection } from '$lib/server/payments/aggregator';
import { firstCleanDiscountTzs } from '$lib/server/pricing/engine';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
	// Fetch the invoice and the client options in parallel to minimise round trips.
	const [invoice, clients] = await Promise.all([
		getInvoice(params.id),
		db.client.findMany({
			orderBy: { displayName: 'asc' },
			select: { id: true, displayName: true }
		})
	]);

	if (!invoice) {
		throw error(404, 'Invoice not found.');
	}

	return { invoice, clients };
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const data = await request.formData();
		const parsed = invoiceSchema.safeParse(formDataToObject(data));

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		await updateInvoice(params.id, parsed.data, readInvoiceLineItems(data));
		await recordAudit({ userId: locals.user?.id, action: 'update', entityType: 'Invoice', entityId: params.id });

		return { success: true };
	},

	issue: async ({ params, locals }) => {
		await issueInvoice(params.id);
		await recordAudit({ userId: locals.user?.id, action: 'issue', entityType: 'Invoice', entityId: params.id });
		return { success: true };
	},

	void: async ({ params, locals }) => {
		await voidInvoice(params.id);
		await recordAudit({ userId: locals.user?.id, action: 'void', entityType: 'Invoice', entityId: params.id });
		return { success: true };
	},

	applyFirstClean: async ({ params, locals }) => {
		const invoice = await getInvoice(params.id);
		if (!invoice) return fail(404, { message: 'Invoice not found.' });

		const settings = await getSiteSettings();
		await setInvoiceDiscount(
			params.id,
			firstCleanDiscountTzs(invoice.subtotalTzs, settings.firstCleanDiscountPercent)
		);
		await recordAudit({
			userId: locals.user?.id,
			action: 'promotion',
			entityType: 'Invoice',
			entityId: params.id,
			diff: { promotion: 'FIRST_CLEAN', percent: settings.firstCleanDiscountPercent }
		});

		return { success: true, message: `First-clean ${settings.firstCleanDiscountPercent}% discount applied.` };
	},

	applyReferralCredit: async ({ params, locals }) => {
		const invoice = await getInvoice(params.id);
		if (!invoice) return fail(404, { message: 'Invoice not found.' });

		const settings = await getSiteSettings();
		await setInvoiceDiscount(params.id, invoice.discountTzs + settings.referralCreditTzs);
		await recordAudit({
			userId: locals.user?.id,
			action: 'promotion',
			entityType: 'Invoice',
			entityId: params.id,
			diff: { promotion: 'REFERRAL', creditTzs: settings.referralCreditTzs }
		});

		return { success: true, message: 'Referral credit applied.' };
	},

	requestMobileMoney: async ({ request, params, locals }) => {
		const invoice = await getInvoice(params.id);
		if (!invoice) return fail(404, { message: 'Invoice not found.' });

		const data = await request.formData();
		const phone = String(data.get('phone') ?? '').trim();

		if (phone.length < 7) {
			return fail(400, { message: 'Enter the mobile money number to bill.' });
		}

		const result = await initiateCollection({
			invoiceNumber: invoice.invoiceNumber,
			amountTzs: invoiceBalance(invoice),
			phone
		});

		await recordAudit({
			userId: locals.user?.id,
			action: 'collection',
			entityType: 'Invoice',
			entityId: params.id,
			diff: { provider: result.provider, providerRef: result.providerRef, status: result.status }
		});

		return { success: true, message: result.message };
	},

	notifyIssued: async ({ params }) => {
		const invoice = await getInvoice(params.id);
		if (!invoice) return fail(404, { message: 'Invoice not found.' });

		const recipient = primaryContact(invoice.client.contacts);
		if (!recipient) return fail(400, { message: 'This client has no contact to notify.' });

		const outcome = await notifyInvoiceIssued({
			invoiceNumber: invoice.invoiceNumber,
			totalTzs: invoice.totalTzs,
			dueDate: invoice.dueDate,
			recipient
		});

		return { success: true, message: describeOutcome(outcome) };
	},

	notifyReminder: async ({ params }) => {
		const invoice = await getInvoice(params.id);
		if (!invoice) return fail(404, { message: 'Invoice not found.' });

		const recipient = primaryContact(invoice.client.contacts);
		if (!recipient) return fail(400, { message: 'This client has no contact to notify.' });

		const outcome = await notifyInvoiceReminder({
			invoiceNumber: invoice.invoiceNumber,
			balanceTzs: invoiceBalance(invoice),
			dueDate: invoice.dueDate,
			recipient
		});

		return { success: true, message: describeOutcome(outcome) };
	},

	recordPayment: async ({ request, params, locals }) => {
		const parsed = paymentSchema.safeParse(formDataToObject(await request.formData()));

		if (!parsed.success) {
			return fail(400, { paymentErrors: fieldErrors(parsed.error) });
		}

		const payment = await recordPayment(
			{ ...parsed.data, invoiceId: params.id },
			locals.user?.id ?? null
		);

		await recordAudit({
			userId: locals.user?.id,
			action: 'create',
			entityType: 'Payment',
			entityId: payment.id,
			diff: { invoiceId: params.id, amountTzs: payment.amountTzs }
		});

		return { success: true };
	},

	deletePayment: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		await deletePayment(id);
		await recordAudit({ userId: locals.user?.id, action: 'delete', entityType: 'Payment', entityId: id });

		return { success: true };
	}
};

function describeOutcome(outcome: { email: boolean; whatsapp: boolean; sms: boolean }): string {
	const channels = [
		outcome.email ? 'email' : null,
		outcome.whatsapp ? 'WhatsApp' : null,
		outcome.sms ? 'SMS' : null
	].filter(Boolean);

	return channels.length > 0
		? `Sent via ${channels.join(', ')}.`
		: 'No channel is configured — copy the message from WhatsApp instead.';
}
