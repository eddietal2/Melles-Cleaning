import { MAIL_FROM, RESEND_API_KEY } from '$app/env/private';

export interface EmailInput {
	to: string;
	subject: string;
	html: string;
}

/**
 * Sends a transactional email through Resend. Best-effort: a delivery failure is
 * logged and reported but never thrown, so it cannot break the caller's action.
 */
export async function sendEmail({ to, subject, html }: EmailInput): Promise<boolean> {
	if (!RESEND_API_KEY || !to) {
		console.info(`[email] skipped "${subject}" to ${to || 'unknown'} (Resend not configured)`);
		return false;
	}

	try {
		const response = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ from: MAIL_FROM, to, subject, html })
		});

		if (!response.ok) {
			console.error(`[email] Resend responded ${response.status} for "${subject}"`);
			return false;
		}

		return true;
	} catch (error) {
		console.error('[email] send failed', error);
		return false;
	}
}
