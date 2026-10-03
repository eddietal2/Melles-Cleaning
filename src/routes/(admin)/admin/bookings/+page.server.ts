import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { bookingSchema } from '$lib/schemas/booking';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { recordAudit } from '$lib/server/audit';
import { createBooking, listBookings, updateBookingStatus } from '$lib/server/crm/bookings';
import { db } from '$lib/server/db';
import type { BookingStatus } from '$lib/server/generated/prisma/enums';

export const load: PageServerLoad = async () => {
	const [bookings, clients, services] = await Promise.all([
		listBookings(),
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

	return { bookings, clients, services };
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const data = formDataToObject(await request.formData());
		const parsed = bookingSchema.safeParse(data);

		if (!parsed.success) {
			return fail(400, { errors: fieldErrors(parsed.error) });
		}

		const booking = await createBooking(parsed.data);
		await recordAudit({
			userId: locals.user?.id,
			action: 'create',
			entityType: 'Booking',
			entityId: booking.id,
			diff: { bookingNumber: booking.bookingNumber }
		});

		return { success: true };
	},

	setStatus: async ({ request, locals }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const status = String(data.get('status') ?? '') as BookingStatus;

		const result = await updateBookingStatus(id, status);
		if (result.error) {
			return fail(400, { message: result.error });
		}

		await recordAudit({
			userId: locals.user?.id,
			action: 'status',
			entityType: 'Booking',
			entityId: id,
			diff: { status }
		});

		return { success: true };
	}
};
