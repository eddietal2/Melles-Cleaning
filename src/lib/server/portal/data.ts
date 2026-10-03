import { totalPaid } from '../pricing/engine';
import { db } from '../db';

/**
 * Portal queries. Every function is scoped by `clientId` so a portal user can only
 * ever read their own bookings, invoices and feedback.
 */

export async function getPortalOverview(clientId: string) {
	const now = new Date();

	const [upcomingCount, nextBookings, invoices, recentFeedback] = await Promise.all([
		db.booking.count({
			where: { clientId, scheduledStart: { gte: now }, status: { notIn: ['CANCELLED'] } }
		}),
		db.booking.findMany({
			where: { clientId, scheduledStart: { gte: now }, status: { notIn: ['CANCELLED'] } },
			orderBy: { scheduledStart: 'asc' },
			take: 3,
			include: { service: true }
		}),
		db.invoice.findMany({
			where: { clientId, status: { notIn: ['DRAFT', 'VOID'] } },
			include: { payments: true }
		}),
		db.feedback.findMany({
			where: { booking: { clientId } },
			orderBy: { submittedAt: 'desc' },
			take: 3,
			include: { booking: { include: { service: true } } }
		})
	]);

	const outstandingTzs = invoices.reduce(
		(sum, invoice) => sum + Math.max(invoice.totalTzs - totalPaid(invoice.payments), 0),
		0
	);
	const paidTzs = invoices.reduce((sum, invoice) => sum + totalPaid(invoice.payments), 0);

	return { upcomingCount, nextBookings, outstandingTzs, paidTzs, recentFeedback };
}

export async function listPortalBookings(clientId: string) {
	return db.booking.findMany({
		where: { clientId },
		orderBy: { scheduledStart: 'desc' },
		include: {
			service: true,
			invoice: { select: { id: true, invoiceNumber: true, status: true } }
		}
	});
}

export async function listPortalInvoices(clientId: string) {
	return db.invoice.findMany({
		where: { clientId, status: { notIn: ['DRAFT'] } },
		orderBy: { createdAt: 'desc' },
		include: {
			payments: { orderBy: { receivedAt: 'desc' } },
			lineItems: { orderBy: { sortOrder: 'asc' } },
			booking: { select: { bookingNumber: true } }
		}
	});
}

export async function listPortalFeedback(clientId: string) {
	return db.feedback.findMany({
		where: { booking: { clientId } },
		orderBy: { submittedAt: 'desc' },
		include: { booking: { include: { service: true } } }
	});
}

/** Completed jobs that have not yet received feedback. */
export async function listFeedbackEligibleBookings(clientId: string) {
	return db.booking.findMany({
		where: {
			clientId,
			status: { in: ['COMPLETED', 'VERIFIED', 'INVOICED', 'PAID'] },
			feedbacks: { none: {} }
		},
		orderBy: { scheduledStart: 'desc' },
		include: { service: true }
	});
}

/** Creates feedback for one of the client's own completed bookings. */
export async function submitClientFeedback(
	clientId: string,
	bookingId: string,
	rating: number,
	comment?: string
): Promise<{ error: string } | { ok: true }> {
	const booking = await db.booking.findFirst({
		where: { id: bookingId, clientId },
		select: { id: true, status: true }
	});

	if (!booking) {
		return { error: 'That booking could not be found.' };
	}

	await db.feedback.create({ data: { bookingId, rating, comment: comment ?? null } });
	return { ok: true };
}
