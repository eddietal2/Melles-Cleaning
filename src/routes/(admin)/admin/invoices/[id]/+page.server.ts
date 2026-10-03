import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { invoiceSchema, readInvoiceLineItems } from '$lib/schemas/invoice';
import { paymentSchema } from '$lib/schemas/payment';
import { recordAudit } from '$lib/server/audit';
import { getInvoice, issueInvoice, updateInvoice, voidInvoice } from '$lib/server/crm/invoices';
import { deletePayment, recordPayment } from '$lib/server/crm/payments';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ params }) => {
	const invoice = await getInvoice(params.id);

	if (!invoice) {
		throw error(404, 'Invoice not found.');
	}

	const clients = await db.client.findMany({
		orderBy: { displayName: 'asc' },
		select: { id: true, displayName: true }
	});

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
