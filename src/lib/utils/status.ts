/** Human labels and semantic tones for every workflow status shown in the CRM. */

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

export function titleCase(value: string): string {
	return value
		.replace(/_/g, ' ')
		.toLowerCase()
		.replace(/\b\w/g, (character) => character.toUpperCase());
}

export const LEAD_STATUS_LABELS: Record<string, string> = {
	NEW: 'New',
	CONTACTED: 'Contacted',
	QUALIFIED: 'Qualified',
	QUOTED: 'Quoted',
	WON: 'Won',
	LOST: 'Lost'
};

export function leadStatusTone(status: string): Tone {
	if (status === 'WON') return 'success';
	if (status === 'LOST') return 'danger';
	if (status === 'QUALIFIED' || status === 'QUOTED') return 'info';
	if (status === 'CONTACTED') return 'warning';
	return 'neutral';
}

export const CLIENT_STATUS_LABELS: Record<string, string> = {
	PROSPECT: 'Prospect',
	ACTIVE: 'Active',
	INACTIVE: 'Inactive'
};

export function clientStatusTone(status: string): Tone {
	if (status === 'ACTIVE') return 'success';
	if (status === 'PROSPECT') return 'info';
	return 'neutral';
}

export const CLIENT_TYPE_LABELS: Record<string, string> = {
	RESIDENTIAL: 'Residential',
	COMMERCIAL: 'Commercial'
};

export const QUOTE_STATUS_LABELS: Record<string, string> = {
	DRAFT: 'Draft',
	SENT: 'Sent',
	ACCEPTED: 'Accepted',
	DECLINED: 'Declined',
	EXPIRED: 'Expired'
};

export function quoteStatusTone(status: string): Tone {
	if (status === 'ACCEPTED') return 'success';
	if (status === 'DECLINED' || status === 'EXPIRED') return 'danger';
	if (status === 'SENT') return 'info';
	return 'neutral';
}

export const BOOKING_STATUS_LABELS: Record<string, string> = {
	SCHEDULED: 'Scheduled',
	IN_PROGRESS: 'In progress',
	ON_HOLD: 'On hold',
	COMPLETED: 'Completed',
	VERIFIED: 'Verified',
	INVOICED: 'Invoiced',
	PAID: 'Paid',
	CANCELLED: 'Cancelled'
};

export function bookingStatusTone(status: string): Tone {
	if (status === 'PAID' || status === 'COMPLETED' || status === 'VERIFIED') return 'success';
	if (status === 'CANCELLED') return 'danger';
	if (status === 'IN_PROGRESS' || status === 'ON_HOLD') return 'warning';
	if (status === 'INVOICED') return 'info';
	return 'neutral';
}

export const CHECKLIST_STATUS_LABELS: Record<string, string> = {
	PENDING: 'Pending',
	IN_PROGRESS: 'In progress',
	COMPLETED: 'Completed'
};

export function checklistStatusTone(status: string): Tone {
	if (status === 'COMPLETED') return 'success';
	if (status === 'IN_PROGRESS') return 'warning';
	return 'neutral';
}

export const INVOICE_STATUS_LABELS: Record<string, string> = {
	DRAFT: 'Draft',
	ISSUED: 'Issued',
	PARTIAL: 'Partially paid',
	PAID: 'Paid',
	OVERDUE: 'Overdue',
	VOID: 'Void'
};

export function invoiceStatusTone(status: string): Tone {
	if (status === 'PAID') return 'success';
	if (status === 'OVERDUE') return 'danger';
	if (status === 'PARTIAL' || status === 'ISSUED') return 'warning';
	if (status === 'VOID') return 'neutral';
	return 'neutral';
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
	CASH: 'Cash',
	MPESA: 'M-Pesa',
	TIGO_PESA: 'Tigo Pesa',
	AIRTEL_MONEY: 'Airtel Money',
	HALOPESA: 'Halopesa',
	BANK_TRANSFER: 'Bank transfer',
	OTHER: 'Other'
};

export const ASSIGNMENT_STATUS_LABELS: Record<string, string> = {
	ASSIGNED: 'Assigned',
	CONFIRMED: 'Confirmed',
	COMPLETED: 'Completed',
	NO_SHOW: 'No show'
};

export const RECURRENCE_LABELS: Record<string, string> = {
	ONE_TIME: 'One-time',
	WEEKLY: 'Weekly',
	BI_WEEKLY: 'Bi-weekly',
	MONTHLY: 'Monthly'
};
