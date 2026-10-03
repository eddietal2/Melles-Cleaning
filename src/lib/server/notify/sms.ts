import { SMS_API_KEY, SMS_SENDER_ID } from '$app/env/private';

/**
 * Optional SMS fallback for clients without WhatsApp. Uses a generic JSON gateway
 * (most Tanzanian providers accept `to`, `sender`, `message`). Best-effort.
 */
export async function sendSms(to: string, message: string): Promise<boolean> {
	const recipient = to.replace(/[^0-9]/g, '');

	if (!SMS_API_KEY || !recipient) {
		console.info(`[sms] skipped message to ${recipient || 'unknown'} (SMS gateway not configured)`);
		return false;
	}

	try {
		const response = await fetch('https://api.smsgateway.center/v1/messages', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${SMS_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ to: recipient, sender: SMS_SENDER_ID, message })
		});

		if (!response.ok) {
			console.error(`[sms] gateway responded ${response.status}`);
			return false;
		}

		return true;
	} catch (error) {
		console.error('[sms] send failed', error);
		return false;
	}
}
