import { formatMonth, monthKey, startOfEatDay } from '$lib/utils/dates';
import { db } from '../db';

/** Start of the current month in EAT, as a UTC instant. */
function startOfEatMonth(now = new Date()): Date {
	const key = monthKey(now);
	return new Date(`${key}-01T00:00:00+03:00`);
}

export async function getDashboardMetrics() {
	const now = new Date();
	const weekAhead = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

	const [
		openQuotes,
		jobsThisWeek,
		monthPayments,
		unpaidInvoices,
		recentFeedback,
		upcomingBookings
	] = await Promise.all([
		db.quote.findMany({
			where: { status: { in: ['DRAFT', 'SENT'] } },
			select: { totalTzs: true }
		}),
		db.booking.count({
			where: {
				status: { notIn: ['CANCELLED'] },
				scheduledStart: { gte: startOfEatDay(now), lte: weekAhead }
			}
		}),
		db.payment.findMany({
			where: { receivedAt: { gte: startOfEatMonth(now) } },
			select: { amountTzs: true }
		}),
		db.invoice.findMany({
			where: { status: { in: ['ISSUED', 'PARTIAL', 'OVERDUE'] } },
			select: { totalTzs: true, payments: { select: { amountTzs: true } } }
		}),
		db.feedback.findMany({
			orderBy: { submittedAt: 'desc' },
			take: 5,
			include: { booking: { include: { client: true, service: true } } }
		}),
		db.booking.findMany({
			where: { status: { notIn: ['CANCELLED', 'PAID'] }, scheduledStart: { gte: startOfEatDay(now) } },
			orderBy: { scheduledStart: 'asc' },
			take: 5,
			include: { client: true, service: true }
		})
	]);

	const pipelineValueTzs = openQuotes.reduce((sum, quote) => sum + quote.totalTzs, 0);
	const monthlyRevenueTzs = monthPayments.reduce((sum, payment) => sum + payment.amountTzs, 0);
	const unpaidInvoiceCount = unpaidInvoices.length;
	const unpaidInvoiceTzs = unpaidInvoices.reduce((sum, invoice) => {
		const paid = invoice.payments.reduce((inner, payment) => inner + payment.amountTzs, 0);
		return sum + Math.max(invoice.totalTzs - paid, 0);
	}, 0);

	return {
		pipelineValueTzs,
		jobsThisWeek,
		monthlyRevenueTzs,
		unpaidInvoiceCount,
		unpaidInvoiceTzs,
		recentFeedback,
		upcomingBookings
	};
}

export interface MonthlyRevenue {
	key: string;
	label: string;
	totalTzs: number;
}

export async function getReports() {
	const now = new Date();
	const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
	const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

	const [payments, invoices, completedBookings, assignments, activeClients] = await Promise.all([
		db.payment.findMany({
			where: { receivedAt: { gte: sixMonthsAgo } },
			select: { amountTzs: true, receivedAt: true }
		}),
		db.invoice.findMany({
			where: { status: { notIn: ['DRAFT', 'VOID'] } },
			include: { client: { select: { clientType: true } }, payments: { select: { amountTzs: true } } }
		}),
		db.booking.findMany({
			where: { status: { in: ['COMPLETED', 'VERIFIED', 'INVOICED', 'PAID'] } },
			select: { quotedTotalTzs: true, clientId: true }
		}),
		db.jobAssignment.findMany({
			where: { createdAt: { gte: thirtyDaysAgo } },
			include: { staffProfile: { include: { user: { select: { name: true } } } } }
		}),
		db.client.findMany({
			where: { status: 'ACTIVE' },
			select: { id: true, displayName: true }
		})
	]);

	// Revenue by month, newest first, always six buckets.
	const revenueMap = new Map<string, number>();
	for (const payment of payments) {
		const key = monthKey(payment.receivedAt);
		revenueMap.set(key, (revenueMap.get(key) ?? 0) + payment.amountTzs);
	}

	const revenueByMonth: MonthlyRevenue[] = Array.from({ length: 6 }, (_, index) => {
		const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
		const key = monthKey(date);
		return { key, label: formatMonth(date), totalTzs: revenueMap.get(key) ?? 0 };
	});

	// Invoiced value split by residential vs commercial.
	const segmentTotals = { RESIDENTIAL: 0, COMMERCIAL: 0 };
	for (const invoice of invoices) {
		segmentTotals[invoice.client.clientType] += invoice.totalTzs;
	}

	// Retention: active clients with more than one completed job.
	const recurringClientIds = new Set<string>();
	const bookingCounts = new Map<string, number>();
	for (const booking of completedBookings) {
		const count = (bookingCounts.get(booking.clientId) ?? 0) + 1;
		bookingCounts.set(booking.clientId, count);
		if (count > 1) recurringClientIds.add(booking.clientId);
	}
	const retentionPercent =
		activeClients.length > 0
			? Math.round((recurringClientIds.size / activeClients.length) * 100)
			: 0;

	const averageJobValueTzs =
		completedBookings.length > 0
			? Math.round(
					completedBookings.reduce((sum, booking) => sum + booking.quotedTotalTzs, 0) /
						completedBookings.length
				)
			: 0;

	// Team utilisation: jobs assigned per staff member in the last 30 days.
	const utilisationMap = new Map<string, { name: string; jobs: number }>();
	for (const assignment of assignments) {
		const entry = utilisationMap.get(assignment.staffProfileId) ?? {
			name: assignment.staffProfile.user.name,
			jobs: 0
		};
		entry.jobs += 1;
		utilisationMap.set(assignment.staffProfileId, entry);
	}
	const teamUtilisation = Array.from(utilisationMap.values()).sort((a, b) => b.jobs - a.jobs);

	// Aging of unpaid invoices.
	const aging = { current: 0, days30: 0, days60: 0, days90Plus: 0 };
	for (const invoice of invoices) {
		if (!['ISSUED', 'PARTIAL', 'OVERDUE'].includes(invoice.status)) continue;
		const paid = invoice.payments.reduce((sum, payment) => sum + payment.amountTzs, 0);
		const balance = Math.max(invoice.totalTzs - paid, 0);
		if (balance === 0 || !invoice.dueDate) continue;

		const overdueDays = Math.floor((now.getTime() - invoice.dueDate.getTime()) / (24 * 60 * 60 * 1000));
		if (overdueDays <= 0) aging.current += balance;
		else if (overdueDays <= 30) aging.days30 += balance;
		else if (overdueDays <= 60) aging.days60 += balance;
		else aging.days90Plus += balance;
	}

	return {
		revenueByMonth,
		segmentTotals,
		retentionPercent,
		recurringClients: recurringClientIds.size,
		activeClients: activeClients.length,
		averageJobValueTzs,
		teamUtilisation,
		aging
	};
}
