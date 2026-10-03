/**
 * Date helpers pinned to the business timezone (Africa/Dar_es_Salaam, EAT UTC+3).
 *
 * Timestamps are stored in UTC but must always be displayed and grouped in EAT,
 * so every formatter here is timezone-aware rather than relying on the viewer.
 */
const EAT_TIME_ZONE = 'Africa/Dar_es_Salaam';

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: EAT_TIME_ZONE,
	day: '2-digit',
	month: 'short',
	year: 'numeric',
	hour: '2-digit',
	minute: '2-digit',
	hour12: false
});

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: EAT_TIME_ZONE,
	day: '2-digit',
	month: 'short',
	year: 'numeric'
});

const monthFormatter = new Intl.DateTimeFormat('en-GB', {
	timeZone: EAT_TIME_ZONE,
	month: 'short',
	year: 'numeric'
});

const inputFormatter = new Intl.DateTimeFormat('en-CA', {
	timeZone: EAT_TIME_ZONE,
	year: 'numeric',
	month: '2-digit',
	day: '2-digit'
});

/** Normalises a Date, ISO string or null into a valid Date, else null. */
export function toDate(value: Date | string | null | undefined): Date | null {
	if (!value) return null;
	const date = value instanceof Date ? value : new Date(value);
	return Number.isNaN(date.getTime()) ? null : date;
}

/** e.g. "03 Oct 2026, 14:30 EAT". */
export function formatDateTime(value: Date | string | null | undefined): string {
	const date = toDate(value);
	return date ? `${dateTimeFormatter.format(date)} EAT` : '—';
}

/** e.g. "03 Oct 2026". */
export function formatDate(value: Date | string | null | undefined): string {
	const date = toDate(value);
	return date ? dateFormatter.format(date) : '—';
}

/** e.g. "Oct 2026" — used for monthly report grouping. */
export function formatMonth(value: Date | string | null | undefined): string {
	const date = toDate(value);
	return date ? monthFormatter.format(date) : '—';
}

/** `yyyy-mm-dd` value for `<input type="date">`, rendered in EAT. */
export function toDateInputValue(value: Date | string | null | undefined): string {
	const date = toDate(value);
	return date ? inputFormatter.format(date) : '';
}

/** The current calendar year in EAT, used for document numbering roll-over. */
export function currentEatYear(): number {
	return Number(
		new Intl.DateTimeFormat('en-GB', { timeZone: EAT_TIME_ZONE, year: 'numeric' }).format(new Date())
	);
}

/** `yyyy-mm` key in EAT, used to bucket monthly revenue. */
export function monthKey(value: Date | string): string {
	const date = toDate(value) ?? new Date();
	return `${inputFormatter.format(date).slice(0, 7)}`;
}

/** Start of the current day in EAT, as a UTC instant. */
export function startOfEatDay(now = new Date()): Date {
	const parts = new Intl.DateTimeFormat('en-CA', {
		timeZone: EAT_TIME_ZONE,
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	}).format(now);
	// EAT is a fixed UTC+3 offset with no daylight saving.
	return new Date(`${parts}T00:00:00+03:00`);
}

/** Adds a number of days to an instant, returning a new Date. */
export function addDays(date: Date, days: number): Date {
	return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}
