import { AUTH_SECRET } from '$app/env/private';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { addDays, startOfEatDay } from '$lib/utils/dates';

/**
 * ICS feed of upcoming jobs for staff calendar apps. Requires either a signed-in
 * session (browser) or the `?token=` shared secret, since schedules are sensitive.
 */

function icsDate(date: Date): string {
	return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
}

function escapeText(value: string): string {
	return value.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export const GET: RequestHandler = async ({ locals, url }) => {
	const token = url.searchParams.get('token');
	const authorised = Boolean(locals.user) || (Boolean(AUTH_SECRET) && token === AUTH_SECRET);

	if (!authorised) {
		return new Response('Unauthorised', { status: 401 });
	}

	const from = startOfEatDay();
	const to = addDays(from, 90);

	const bookings = await db.booking.findMany({
		where: {
			scheduledStart: { gte: from, lte: to },
			status: { notIn: ['CANCELLED'] }
		},
		orderBy: { scheduledStart: 'asc' },
		include: { service: true, client: true }
	});

	const lines: string[] = [
		'BEGIN:VCALENDAR',
		'VERSION:2.0',
		'PRODID:-//Melles Cleaning Services//CRM//EN',
		'CALSCALE:GREGORIAN',
		'METHOD:PUBLISH'
	];

	for (const booking of bookings) {
		const end = new Date(booking.scheduledStart.getTime() + booking.durationMinutes * 60 * 1000);
		const summary = `${booking.service.name} — ${booking.client.displayName}`;

		lines.push(
			'BEGIN:VEVENT',
			`UID:${booking.id}@mellescleaning`,
			`DTSTAMP:${icsDate(new Date())}`,
			`DTSTART:${icsDate(booking.scheduledStart)}`,
			`DTEND:${icsDate(end)}`,
			`SUMMARY:${escapeText(summary)}`,
			`STATUS:CONFIRMED`,
			...(booking.addressSnapshot ? [`LOCATION:${escapeText(booking.addressSnapshot)}`] : []),
			...(booking.specialInstructions
				? [`DESCRIPTION:${escapeText(booking.specialInstructions)}`]
				: []),
			'END:VEVENT'
		);
	}

	lines.push('END:VCALENDAR');

	return new Response(lines.join('\r\n'), {
		headers: {
			'Content-Type': 'text/calendar; charset=utf-8',
			'Content-Disposition': 'inline; filename="melles-bookings.ics"',
			'Cache-Control': 'private, max-age=300'
		}
	});
};
