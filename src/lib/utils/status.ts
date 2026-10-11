/** Human labels and semantic tones for every workflow status shown in the CRM. */

import * as m from '$lib/paraglide/messages.js';

export type Tone = 'neutral' | 'info' | 'success' | 'warning' | 'danger';

const TONE_BADGE: Record<Tone, string> = {
	neutral: 'bg-surface-muted text-muted-foreground',
	info: 'bg-info/10 text-info',
	success: 'bg-success/10 text-success',
	warning: 'bg-warning/10 text-warning',
	danger: 'bg-danger/10 text-danger'
};

/** Full class string for a status pill. */
export function badgeClass(tone: Tone): string {
	return `rounded-pill px-2 py-0.5 text-xs font-medium ${TONE_BADGE[tone]}`;
}

/** Fallback human label for an unrecognised enum value (`IN_PROGRESS` → "In Progress"). */
export function titleCase(value: string): string {
	return value
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

/**
 * Localized, human labels for every workflow status. Each map stores Paraglide
 * message functions so callers can render the active locale; unknown values fall
 * back to a title-cased version of the raw enum.
 */
type LabelMap = Record<string, () => string>;

const LEAD_STATUS_LABELS: LabelMap = {
	NEW: m.status_lead_new,
	CONTACTED: m.status_lead_contacted,
	QUALIFIED: m.status_lead_qualified,
	QUOTED: m.status_lead_quoted,
	WON: m.status_lead_won,
	LOST: m.status_lead_lost
};

export function leadStatusLabel(status: string): string {
	return LEAD_STATUS_LABELS[status]?.() ?? titleCase(status);
}

export function leadStatusTone(status: string): Tone {
	if (status === 'WON') return 'success';
	if (status === 'LOST') return 'danger';
	if (status === 'QUALIFIED' || status === 'QUOTED') return 'info';
	if (status === 'CONTACTED') return 'warning';
	return 'neutral';
}

const CLIENT_STATUS_LABELS: LabelMap = {
	PROSPECT: m.status_client_prospect,
	ACTIVE: m.status_client_active,
	INACTIVE: m.status_client_inactive
};

export function clientStatusLabel(status: string): string {
	return CLIENT_STATUS_LABELS[status]?.() ?? titleCase(status);
}

export function clientStatusTone(status: string): Tone {
	if (status === 'ACTIVE') return 'success';
	if (status === 'PROSPECT') return 'info';
	return 'neutral';
}

const CLIENT_TYPE_LABELS: LabelMap = {
	RESIDENTIAL: m.status_client_type_residential,
	COMMERCIAL: m.status_client_type_commercial
};

export function clientTypeLabel(type: string): string {
	return CLIENT_TYPE_LABELS[type]?.() ?? titleCase(type);
}

const QUOTE_STATUS_LABELS: LabelMap = {
	DRAFT: m.status_quote_draft,
	SENT: m.status_quote_sent,
	ACCEPTED: m.status_quote_accepted,
	DECLINED: m.status_quote_declined,
	EXPIRED: m.status_quote_expired
};

export function quoteStatusLabel(status: string): string {
	return QUOTE_STATUS_LABELS[status]?.() ?? titleCase(status);
}

export function quoteStatusTone(status: string): Tone {
	if (status === 'ACCEPTED') return 'success';
	if (status === 'DECLINED' || status === 'EXPIRED') return 'danger';
	if (status === 'SENT') return 'info';
	return 'neutral';
}

const BOOKING_STATUS_LABELS: LabelMap = {
	SCHEDULED: m.status_booking_scheduled,
	IN_PROGRESS: m.status_booking_in_progress,
	ON_HOLD: m.status_booking_on_hold,
	COMPLETED: m.status_booking_completed,
	VERIFIED: m.status_booking_verified,
	INVOICED: m.status_booking_invoiced,
	PAID: m.status_booking_paid,
	CANCELLED: m.status_booking_cancelled
};

export function bookingStatusLabel(status: string): string {
	return BOOKING_STATUS_LABELS[status]?.() ?? titleCase(status);
}

export function bookingStatusTone(status: string): Tone {
	if (status === 'PAID' || status === 'COMPLETED' || status === 'VERIFIED') return 'success';
	if (status === 'CANCELLED') return 'danger';
	if (status === 'IN_PROGRESS' || status === 'ON_HOLD') return 'warning';
	if (status === 'INVOICED') return 'info';
	return 'neutral';
}

const CHECKLIST_STATUS_LABELS: LabelMap = {
	PENDING: m.status_checklist_pending,
	IN_PROGRESS: m.status_checklist_in_progress,
	COMPLETED: m.status_checklist_completed
};

export function checklistStatusLabel(status: string): string {
	return CHECKLIST_STATUS_LABELS[status]?.() ?? titleCase(status);
}

export function checklistStatusTone(status: string): Tone {
	if (status === 'COMPLETED') return 'success';
	if (status === 'IN_PROGRESS') return 'warning';
	return 'neutral';
}

const INVOICE_STATUS_LABELS: LabelMap = {
	DRAFT: m.status_invoice_draft,
	ISSUED: m.status_invoice_issued,
	PARTIAL: m.status_invoice_partial,
	PAID: m.status_invoice_paid,
	OVERDUE: m.status_invoice_overdue,
	VOID: m.status_invoice_void
};

export function invoiceStatusLabel(status: string): string {
	return INVOICE_STATUS_LABELS[status]?.() ?? titleCase(status);
}

export function invoiceStatusTone(status: string): Tone {
	if (status === 'PAID') return 'success';
	if (status === 'OVERDUE') return 'danger';
	if (status === 'PARTIAL' || status === 'ISSUED') return 'warning';
	if (status === 'VOID') return 'neutral';
	return 'neutral';
}

const PAYMENT_METHOD_LABELS: LabelMap = {
	CASH: m.status_payment_cash,
	MPESA: m.status_payment_mpesa,
	TIGO_PESA: m.status_payment_tigo_pesa,
	AIRTEL_MONEY: m.status_payment_airtel_money,
	HALOPESA: m.status_payment_halopesa,
	BANK_TRANSFER: m.status_payment_bank_transfer,
	OTHER: m.status_payment_other
};

/** Payment methods in display order, for building `<option>` lists. */
export const PAYMENT_METHOD_CODES = [
	'CASH',
	'MPESA',
	'TIGO_PESA',
	'AIRTEL_MONEY',
	'HALOPESA',
	'BANK_TRANSFER',
	'OTHER'
] as const;

export function paymentMethodLabel(method: string): string {
	return PAYMENT_METHOD_LABELS[method]?.() ?? titleCase(method);
}

const ASSIGNMENT_STATUS_LABELS: LabelMap = {
	ASSIGNED: m.status_assignment_assigned,
	CONFIRMED: m.status_assignment_confirmed,
	COMPLETED: m.status_assignment_completed,
	NO_SHOW: m.status_assignment_no_show
};

export function assignmentStatusLabel(status: string): string {
	return ASSIGNMENT_STATUS_LABELS[status]?.() ?? titleCase(status);
}

const RECURRENCE_LABELS: LabelMap = {
	ONE_TIME: m.status_recurrence_one_time,
	WEEKLY: m.status_recurrence_weekly,
	BI_WEEKLY: m.status_recurrence_bi_weekly,
	MONTHLY: m.status_recurrence_monthly
};

export function recurrenceLabel(frequency: string): string {
	return RECURRENCE_LABELS[frequency]?.() ?? titleCase(frequency);
}
