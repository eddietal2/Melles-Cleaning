import type { BookingInput } from '$lib/schemas/booking';
import type { BookingStatus } from '$lib/server/generated/prisma/enums';
import { db } from '../db';
import { ensureChecklistForBooking } from './checklists';
import { nextBookingNumber } from './numbering';

/** The booking and job lifecycle from docs/architecture.md §7.5. */
const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
	SCHEDULED: ['IN_PROGRESS', 'ON_HOLD', 'CANCELLED'],
	IN_PROGRESS: ['COMPLETED', 'ON_HOLD'],
	ON_HOLD: ['IN_PROGRESS', 'CANCELLED'],
	COMPLETED: ['VERIFIED'],
	VERIFIED: ['INVOICED'],
	INVOICED: ['PAID'],
	PAID: [],
	CANCELLED: []
};

/** Statuses a job may legally move to from its current state. */
export function nextBookingStatuses(status: BookingStatus): BookingStatus[] {
	return BOOKING_TRANSITIONS[status] ?? [];
}

export async function listBookings(status?: BookingStatus) {
	return db.booking.findMany({
		where: status ? { status } : undefined,
		orderBy: { scheduledStart: 'desc' },
		include: {
			client: true,
			service: true,
			invoice: { select: { id: true, invoiceNumber: true, status: true } },
			checklist: { select: { id: true, status: true } },
			assignments: true
		}
	});
}

export async function getBooking(id: string) {
	return db.booking.findUnique({
		where: { id },
		include: {
			client: { include: { contacts: true } },
			service: true,
			quote: { include: { lineItems: true } },
			invoice: { include: { payments: true } },
			checklist: {
				include: {
					template: { include: { items: { orderBy: { sortOrder: 'asc' } } } },
					supervisor: { include: { user: { select: { name: true } } } },
					results: true
				}
			},
			feedbacks: { orderBy: { submittedAt: 'desc' } },
			assignments: {
				include: { staffProfile: { include: { user: { select: { name: true } } } } }
			}
		}
	});
}

/** Builds the EAT instant for a date + time pair. */
export function buildScheduledStart(date: string, time: string): Date {
	return new Date(`${date}T${time || '08:00'}:00+03:00`);
}

export async function createBooking(input: BookingInput, options?: { quoteId?: string }) {
	const bookingNumber = await nextBookingNumber();

	const booking = await db.booking.create({
		data: {
			clientId: input.clientId,
			serviceId: input.serviceId,
			quoteId: options?.quoteId ?? null,
			bookingNumber,
			scheduledStart: buildScheduledStart(input.scheduledDate, input.scheduledTime),
			durationMinutes: input.durationMinutes,
			recurrenceFrequency: input.recurrenceFrequency,
			addressSnapshot: input.addressSnapshot ?? null,
			specialInstructions: input.specialInstructions ?? null,
			quotedTotalTzs: input.quotedTotalTzs
		}
	});

	// Every job carries the QC checklist from the moment it is scheduled.
	await ensureChecklistForBooking(booking.id);

	return booking;
}

export interface StatusUpdateResult {
	error?: string;
}

export async function updateBookingStatus(
	id: string,
	status: BookingStatus
): Promise<StatusUpdateResult> {
	const booking = await db.booking.findUnique({ where: { id }, select: { status: true } });

	if (!booking) return { error: 'Booking not found.' };

	const allowed = BOOKING_TRANSITIONS[booking.status] ?? [];
	if (!allowed.includes(status)) {
		return { error: `A ${booking.status} job cannot move to ${status}.` };
	}

	await db.booking.update({ where: { id }, data: { status } });
	return {};
}

export async function cancelBooking(id: string) {
	await db.booking.update({ where: { id }, data: { status: 'CANCELLED' } });
}
