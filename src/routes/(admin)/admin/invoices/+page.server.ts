import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { invoiceSchema, readInvoiceLineItems } from '$lib/schemas/invoice';
import { recordAudit } from '$lib/server/audit';
import { createInvoice, createInvoiceFromBooking, listInvoices } from '$lib/server/crm/invoices';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const [invoices, clients, bookings] = await Promise.all([
		listInvoices(),
		db.client.findMany({
			orderBy: { displayName: 'asc' },
			select: { id: true, displayName: true }
		}),
		db.booking.findMany({
			where: { invoice: null },
			orderBy: { scheduledStart: 'desc' },
			select: {
				id: true,
				bookingNumber: true,
				quotedTotalTzs: true,
				client: { select: { displayName: true } }
			}
		})
	]);

	return { invoices, clients, bookings };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = await request.formData();
		const parsed = invoiceSchema.safeParse(formDataToObject(data));

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		const items = readInvoiceLineItems(data);

		if (items.length === 0 && !parsed.data.bookingId) {
			return fail(400, {
				message: 'Add at least one line item, or choose a booking to invoice.'
			});
		}

		const invoice =
			items.length === 0 && parsed.data.bookingId
				? await createInvoiceFromBooking(parsed.data.bookingId)
				: await createInvoice(parsed.data, items);

		if (!invoice) {
			return fail(400, { message: 'Could not create the invoice.' });
		}

		await recordAudit({
			userId: locals.user?.id,
			action: 'create',
			entityType: 'Invoice',
			entityId: invoice.id,
			diff: { invoiceNumber: invoice.invoiceNumber }
		});

		throw redirect(303, `/admin/invoices/${invoice.id}`);
	}
};
