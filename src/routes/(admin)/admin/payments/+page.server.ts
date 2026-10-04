import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { paymentSchema } from '$lib/schemas/payment';
import { recordAudit } from '$lib/server/audit';
import { listPayments, recordPayment } from '$lib/server/crm/payments';
import { db } from '$lib/server/db';

export const load: PageServerLoad = () => {
	// Streamed so the page frame renders immediately.
	return {
		streamed: Promise.all([
			listPayments(),
			db.invoice.findMany({
				where: { status: { in: ['DRAFT', 'ISSUED', 'PARTIAL', 'OVERDUE'] } },
				orderBy: { createdAt: 'desc' },
				select: {
					id: true,
					invoiceNumber: true,
					totalTzs: true,
					payments: { select: { amountTzs: true } },
					client: { select: { displayName: true } }
				}
			})
		]).then(([payments, openInvoices]) => ({ payments, openInvoices }))
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const parsed = paymentSchema.safeParse(formDataToObject(await request.formData()));

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		const payment = await recordPayment(parsed.data, locals.user?.id ?? null);

		await recordAudit({
			userId: locals.user?.id,
			action: 'create',
			entityType: 'Payment',
			entityId: payment.id,
			diff: { invoiceId: payment.invoiceId, amountTzs: payment.amountTzs }
		});

		return { success: true };
	}
};
