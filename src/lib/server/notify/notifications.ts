import { formatDateTime } from '$lib/utils/dates';
import { formatTzs } from '$lib/utils/currency';
import { getSiteSettings } from '../content/site';
import { sendEmail } from './email';
import { sendSms } from './sms';
import { sendWhatsAppText, whatsAppDeepLink } from './whatsapp';

export interface Recipient {
	name: string;
	phone?: string | null;
	email?: string | null;
}

export interface NotificationOutcome {
	email: boolean;
	whatsapp: boolean;
	sms: boolean;
	whatsAppLink: string | null;
}

/**
 * Fans a message out across every configured channel. WhatsApp Cloud API and SMS
 * are silent no-ops when unconfigured; the returned deep link is the always-available
 * fallback the owner can click from the CRM.
 */
async function dispatch(
	recipient: Recipient,
	subject: string,
	body: string
): Promise<NotificationOutcome> {
	const email = recipient.email
		? await sendEmail({
				to: recipient.email,
				subject,
				html: `<p>${body.replace(/\n/g, '<br>')}</p>`
			})
		: false;
	const whatsapp = recipient.phone ? await sendWhatsAppText(recipient.phone, body) : false;
	const sms = recipient.phone && !whatsapp ? await sendSms(recipient.phone, body) : false;

	return {
		email,
		whatsapp,
		sms,
		whatsAppLink: recipient.phone ? whatsAppDeepLink(recipient.phone, body) : null
	};
}

export async function notifyBookingConfirmation(input: {
	bookingNumber: string;
	serviceName: string;
	scheduledStart: Date;
	address?: string | null;
	recipient: Recipient;
}): Promise<NotificationOutcome> {
	const settings = await getSiteSettings();
	const body = [
		`Hello ${input.recipient.name},`,
		`Your ${input.serviceName} is booked for ${formatDateTime(input.scheduledStart)}.`,
		input.address ? `Address: ${input.address}` : '',
		`Reference: ${input.bookingNumber}.`,
		`— ${settings.businessName}`
	]
		.filter(Boolean)
		.join('\n');

	return dispatch(input.recipient, `Booking confirmed — ${input.bookingNumber}`, body);
}

export async function notifyInvoiceIssued(input: {
	invoiceNumber: string;
	totalTzs: number;
	dueDate?: Date | null;
	recipient: Recipient;
}): Promise<NotificationOutcome> {
	const settings = await getSiteSettings();
	const body = [
		`Hello ${input.recipient.name},`,
		`Invoice ${input.invoiceNumber} for ${formatTzs(input.totalTzs)} is ready.`,
		input.dueDate ? `Due ${formatDateTime(input.dueDate)}.` : '',
		`— ${settings.businessName}`
	]
		.filter(Boolean)
		.join('\n');

	return dispatch(input.recipient, `Invoice ${input.invoiceNumber}`, body);
}

export async function notifyInvoiceReminder(input: {
	invoiceNumber: string;
	balanceTzs: number;
	dueDate?: Date | null;
	recipient: Recipient;
}): Promise<NotificationOutcome> {
	const settings = await getSiteSettings();
	const body = [
		`Hello ${input.recipient.name},`,
		`A friendly reminder that invoice ${input.invoiceNumber} has an outstanding balance of ${formatTzs(
			input.balanceTzs
		)}.`,
		input.dueDate ? `It was due ${formatDateTime(input.dueDate)}.` : '',
		`— ${settings.businessName}`
	]
		.filter(Boolean)
		.join('\n');

	return dispatch(input.recipient, `Reminder — invoice ${input.invoiceNumber}`, body);
}

export async function notifyFeedbackRequest(input: {
	bookingNumber: string;
	recipient: Recipient;
	link?: string;
}): Promise<NotificationOutcome> {
	const settings = await getSiteSettings();
	const body = [
		`Hello ${input.recipient.name},`,
		`Thank you for choosing ${settings.businessName}. How did we do on ${input.bookingNumber}?`,
		input.link ? `Leave your feedback: ${input.link}` : '',
		'We read every review.'
	]
		.filter(Boolean)
		.join('\n');

	return dispatch(input.recipient, `How did we do? — ${input.bookingNumber}`, body);
}

/** Picks the primary contact, falling back to the first on file. */
export function primaryContact(
	contacts: { name: string; phone: string; email: string | null; isPrimary: boolean }[]
): Recipient | null {
	if (contacts.length === 0) return null;

	const preferred = contacts.find((contact) => contact.isPrimary) ?? contacts[0];
	return { name: preferred.name, phone: preferred.phone, email: preferred.email };
}
