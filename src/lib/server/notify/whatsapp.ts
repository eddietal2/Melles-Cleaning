import { WHATSAPP_CLOUD_TOKEN, WHATSAPP_PHONE_NUMBER_ID } from '$app/env/private';

const GRAPH_API_VERSION = 'v21.0';

/** Builds a click-to-chat deep link with an optional prefilled message. */
export function whatsAppDeepLink(number: string, message?: string): string | null {
	const digits = number.replace(/[^0-9]/g, '');
	if (!digits) return null;

	const base = `https://wa.me/${digits}`;
	return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/**
 * Sends a WhatsApp text message via the Cloud API when credentials are present.
 * Best-effort: without configuration it logs and returns false so the caller can
 * fall back to a click-to-chat link.
 */
export async function sendWhatsAppText(to: string, body: string): Promise<boolean> {
	const recipient = to.replace(/[^0-9]/g, '');

	if (!WHATSAPP_CLOUD_TOKEN || !WHATSAPP_PHONE_NUMBER_ID || !recipient) {
		console.info(
			`[whatsapp] Cloud API not configured; message to ${recipient || 'unknown'} not sent`
		);
		return false;
	}

	try {
		const response = await fetch(
			`https://graph.facebook.com/${GRAPH_API_VERSION}/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
			{
				method: 'POST',
				headers: {
					Authorization: `Bearer ${WHATSAPP_CLOUD_TOKEN}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					messaging_product: 'whatsapp',
					recipient_type: 'individual',
					to: recipient,
					type: 'text',
					text: { preview_url: false, body }
				})
			}
		);

		if (!response.ok) {
			console.error(`[whatsapp] Cloud API responded ${response.status}`);
			return false;
		}

		return true;
	} catch (error) {
		console.error('[whatsapp] send failed', error);
		return false;
	}
}
