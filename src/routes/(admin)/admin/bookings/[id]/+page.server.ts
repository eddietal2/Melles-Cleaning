import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { recordAudit } from '$lib/server/audit';
import { getBooking, nextBookingStatuses, updateBookingStatus } from '$lib/server/crm/bookings';
import { createInvoiceFromBooking } from '$lib/server/crm/invoices';
import type { BookingStatus } from '$lib/server/generated/prisma/enums';

export const load: PageServerLoad = async ({ params }) => {
	const booking = await getBooking(params.id);

	if (!booking) {
		throw error(404, 'Booking not found.');
	}

	return { booking, nextStatuses: nextBookingStatuses(booking.status) };
};

export const actions: Actions = {
	setStatus: async ({ request, params, locals }) => {
		const data = await request.formData();
		const status = String(data.get('status') ?? '') as BookingStatus;

		const result = await updateBookingStatus(params.id, status);
		if (result.error) {
			return fail(400, { message: result.error });
		}

		await recordAudit({
			userId: locals.user?.id,
			action: 'status',
			entityType: 'Booking',
			entityId: params.id,
			diff: { status }
		});

		return { success: true };
	},

	generateInvoice: async ({ params, locals }) => {
		const invoice = await createInvoiceFromBooking(params.id);

		if (!invoice) {
			return fail(400, { message: 'This job already has an invoice.' });
		}

		await recordAudit({
			userId: locals.user?.id,
			action: 'create',
			entityType: 'Invoice',
			entityId: invoice.id,
			diff: { fromBooking: params.id }
		});

		throw redirect(303, `/admin/invoices/${invoice.id}`);
	}
};
