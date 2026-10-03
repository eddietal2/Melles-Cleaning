import { z } from 'zod';

export const INVOICE_STATUSES = ['DRAFT', 'ISSUED', 'PARTIAL', 'PAID', 'OVERDUE', 'VOID'] as const;

export const invoiceLineItemSchema = z.object({
	description: z.string().trim().min(2, 'Describe the line item.').max(240),
	quantity: z.coerce.number().int().min(1).max(100_000).default(1),
	unitPriceTzs: z.coerce.number().int().min(0).max(1_000_000_000).default(0)
});

export const invoiceSchema = z.object({
	clientId: z.string().trim().min(1, 'Choose a client.'),
	bookingId: z.string().trim().optional(),
	dueDate: z.string().trim().optional(),
	discountTzs: z.coerce.number().int().min(0).max(1_000_000_000).default(0)
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;
export type InvoiceLineItemInput = z.infer<typeof invoiceLineItemSchema>;

/** Reads parallel line-item fields from an invoice builder form. */
export function readInvoiceLineItems(data: FormData): InvoiceLineItemInput[] {
	const descriptions = data.getAll('description').map(String);
	const quantities = data.getAll('quantity').map(String);
	const prices = data.getAll('unitPriceTzs').map(String);

	return descriptions
		.map((description, index) =>
			invoiceLineItemSchema.safeParse({
				description,
				quantity: quantities[index] ?? '1',
				unitPriceTzs: prices[index] ?? '0'
			})
		)
		.filter((result): result is { success: true; data: InvoiceLineItemInput } => result.success)
		.map((result) => result.data);
}
