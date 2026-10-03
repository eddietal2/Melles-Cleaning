import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { recordPayment } from '$lib/server/crm/payments';
import {
	isSuccessfulStatus,
	parseWebhook,
	verifyWebhookSignature
} from '$lib/server/payments/aggregator';

/**
 * Mobile money aggregator callback. Verifies the HMAC signature, resolves the
 * invoice from our reference, records the payment and lets the invoice status
 * recompute. Idempotent: duplicate provider references are acknowledged, not
 * recorded twice.
 */
export const POST: RequestHandler = async ({ request }) => {
	const raw = await request.text();
	const signature =
		request.headers.get('x-melles-signature') ?? request.headers.get('x-payments-signature');

	if (!verifyWebhookSignature(raw, signature)) {
		return json({ error: 'Invalid signature' }, { status: 401 });
	}

	let payload: Record<string, unknown>;
	try {
		payload = JSON.parse(raw) as Record<string, unknown>;
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const parsed = parseWebhook(payload);

	if (!parsed) {
		return json({ error: 'Unrecognised payload' }, { status: 400 });
	}

	if (!isSuccessfulStatus(parsed.status)) {
		return json({ received: true, ignored: true });
	}

	const invoice = parsed.invoiceId
		? await db.invoice.findUnique({ where: { id: parsed.invoiceId } })
		: await db.invoice.findUnique({ where: { invoiceNumber: parsed.reference } });

	if (!invoice) {
		return json({ error: 'Invoice not found' }, { status: 404 });
	}

	if (parsed.providerRef) {
		const duplicate = await db.payment.findFirst({ where: { reference: parsed.providerRef } });
		if (duplicate) {
			return json({ received: true, duplicate: true });
		}
	}

	await recordPayment(
		{
			invoiceId: invoice.id,
			amountTzs: parsed.amountTzs,
			method: parsed.method,
			reference: parsed.providerRef ?? parsed.reference
		},
		null
	);

	return json({ received: true });
};
