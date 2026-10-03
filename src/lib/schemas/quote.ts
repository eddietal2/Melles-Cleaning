import { z } from 'zod';

export const QUOTE_STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED'] as const;

export const quoteLineItemSchema = z.object({
	description: z.string().trim().min(2, 'Describe the line item.').max(240),
	quantity: z.coerce.number().int().min(1).max(100_000).default(1),
	unitPriceTzs: z.coerce.number().int().min(0).max(1_000_000_000).default(0)
});

export const quoteSchema = z.object({
	clientId: z.string().trim().min(1, 'Choose a client.'),
	validUntil: z.string().trim().optional(),
	notes: z.string().trim().max(2000).optional(),
	discountTzs: z.coerce.number().int().min(0).max(1_000_000_000).default(0)
});

export type QuoteInput = z.infer<typeof quoteSchema>;
export type QuoteLineItemInput = z.infer<typeof quoteLineItemSchema>;

/**
 * Reads parallel `description[]`, `quantity[]` and `unitPriceTzs[]` fields from a
 * quote line-item builder form and returns only rows with a description.
 */
export function readLineItems(data: FormData): QuoteLineItemInput[] {
	const descriptions = data.getAll('description').map(String);
	const quantities = data.getAll('quantity').map(String);
	const prices = data.getAll('unitPriceTzs').map(String);

	return descriptions
		.map((description, index) =>
			quoteLineItemSchema.safeParse({
				description,
				quantity: quantities[index] ?? '1',
				unitPriceTzs: prices[index] ?? '0'
			})
		)
		.filter((result): result is { success: true; data: QuoteLineItemInput } => result.success)
		.map((result) => result.data);
}
