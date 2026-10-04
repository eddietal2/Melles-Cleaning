import { createHmac, timingSafeEqual } from 'node:crypto';
import { PAYMENTS_API_KEY, PAYMENTS_PROVIDER, PAYMENTS_WEBHOOK_SECRET } from '$app/env/private';
import type { PaymentMethod } from '$lib/server/generated/prisma/enums';

/**
 * Mobile money aggregator (Selcom / ClickPesa / AzamPay).
 *
 * Collections are initiated server-side; the aggregator then calls our webhook,
 * which we verify with an HMAC signature before recording the payment. When no API
 * key is configured the flow degrades to a simulated reference so the business can
 * keep recording payments manually.
 */

export interface CollectionRequest {
	invoiceNumber: string;
	amountTzs: number;
	phone: string;
}

export interface CollectionResult {
	provider: string;
	providerRef: string;
	status: 'PENDING' | 'FAILED';
	message: string;
}

export function isPaymentsConfigured(): boolean {
	return Boolean(PAYMENTS_API_KEY);
}

export async function initiateCollection(request: CollectionRequest): Promise<CollectionResult> {
	const provider = PAYMENTS_PROVIDER;

	if (!isPaymentsConfigured()) {
		return {
			provider,
			providerRef: `SIM-${Date.now().toString(36).toUpperCase()}`,
			status: 'PENDING',
			message: 'Aggregator not configured. Ask the client to pay, then record the payment manually.'
		};
	}

	try {
		const response = await fetch(`https://api.${provider}.co.tz/v1/collections`, {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${PAYMENTS_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				amount: request.amountTzs,
				currency: 'TZS',
				msisdn: request.phone.replace(/[^0-9]/g, ''),
				reference: request.invoiceNumber,
				remarks: `Melles invoice ${request.invoiceNumber}`
			})
		});

		const payload = (await response.json().catch(() => ({}))) as {
			reference?: string;
			message?: string;
		};

		if (!response.ok) {
			return {
				provider,
				providerRef: '',
				status: 'FAILED',
				message: payload.message ?? `Provider responded ${response.status}`
			};
		}

		return {
			provider,
			providerRef: payload.reference ?? request.invoiceNumber,
			status: 'PENDING',
			message: payload.message ?? 'Collection initiated. Awaiting confirmation.'
		};
	} catch (error) {
		return {
			provider,
			providerRef: '',
			status: 'FAILED',
			message: error instanceof Error ? error.message : 'Aggregator request failed.'
		};
	}
}

/** Constant-time HMAC-SHA256 verification of an incoming webhook body. */
export function verifyWebhookSignature(rawBody: string, signature: string | null): boolean {
	if (!PAYMENTS_WEBHOOK_SECRET || !signature) return false;

	const expected = createHmac('sha256', PAYMENTS_WEBHOOK_SECRET).update(rawBody).digest('hex');
	const expectedBuffer = Buffer.from(expected);
	const providedBuffer = Buffer.from(signature);

	return (
		expectedBuffer.length === providedBuffer.length &&
		timingSafeEqual(expectedBuffer, providedBuffer)
	);
}

export interface PaymentWebhookPayload {
	reference: string;
	invoiceId?: string;
	amountTzs: number;
	status: string;
	providerRef?: string;
	method: PaymentMethod;
}

const NETWORK_METHODS: Record<string, PaymentMethod> = {
	mpesa: 'MPESA',
	vodacom: 'MPESA',
	tigo: 'TIGO_PESA',
	mixx: 'TIGO_PESA',
	airtel: 'AIRTEL_MONEY',
	halopesa: 'HALOPESA',
	halotel: 'HALOPESA',
	cash: 'CASH',
	bank: 'BANK_TRANSFER'
};

function inferMethod(payload: Record<string, unknown>): PaymentMethod {
	const raw = String(payload.network ?? payload.method ?? '').toLowerCase();
	return NETWORK_METHODS[raw] ?? 'OTHER';
}

/** Normalises the varied aggregator payloads into one shape. Returns null if unusable. */
export function parseWebhook(payload: Record<string, unknown>): PaymentWebhookPayload | null {
	const reference = typeof payload.reference === 'string' ? payload.reference : '';
	const amountRaw = payload.amount ?? payload.amountTzs;
	const amountTzs = typeof amountRaw === 'number' ? amountRaw : Number(amountRaw);

	if (!reference || !Number.isFinite(amountTzs) || amountTzs <= 0) {
		return null;
	}

	return {
		reference,
		invoiceId: typeof payload.invoiceId === 'string' ? payload.invoiceId : undefined,
		amountTzs,
		status: String(payload.status ?? 'SUCCESS'),
		providerRef: typeof payload.providerRef === 'string' ? payload.providerRef : undefined,
		method: inferMethod(payload)
	};
}

/** True when the payload represents money actually received. */
export function isSuccessfulStatus(status: string): boolean {
	return ['SUCCESS', 'SUCCESSFUL', 'PAID', 'COMPLETED'].includes(status.toUpperCase());
}
