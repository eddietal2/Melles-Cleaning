import type { PaymentInput } from '$lib/schemas/payment';
import { db } from '../db';
import { recomputeInvoiceStatus } from './invoices';

export async function listPayments() {
	return db.payment.findMany({
		orderBy: { receivedAt: 'desc' },
		include: {
			invoice: { include: { client: true } },
			receivedBy: { select: { name: true } }
		}
	});
}

export async function recordPayment(input: PaymentInput, receivedById: string | null) {
	const payment = await db.payment.create({
		data: {
			invoiceId: input.invoiceId,
			amountTzs: input.amountTzs,
			method: input.method,
			reference: input.reference ?? null,
			receivedById,
			receivedAt: input.receivedAt ? new Date(`${input.receivedAt}T12:00:00+03:00`) : new Date()
		}
	});

	await recomputeInvoiceStatus(input.invoiceId);

	return payment;
}

export async function deletePayment(id: string) {
	const payment = await db.payment.findUnique({ where: { id }, select: { invoiceId: true } });
	if (!payment) return;

	await db.payment.delete({ where: { id } });
	await recomputeInvoiceStatus(payment.invoiceId);
}
