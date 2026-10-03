import { z } from 'zod';

export const PAYMENT_METHODS = [
	'CASH',
	'MPESA',
	'TIGO_PESA',
	'AIRTEL_MONEY',
	'HALOPESA',
	'BANK_TRANSFER',
	'OTHER'
] as const;

export const paymentSchema = z.object({
	invoiceId: z.string().trim().min(1, 'Choose an invoice.'),
	amountTzs: z.coerce.number().int().min(1, 'Enter an amount greater than zero.').max(1_000_000_000),
	method: z.enum(PAYMENT_METHODS).default('CASH'),
	reference: z.string().trim().max(120).optional(),
	receivedAt: z.string().trim().optional()
});

export type PaymentInput = z.infer<typeof paymentSchema>;
