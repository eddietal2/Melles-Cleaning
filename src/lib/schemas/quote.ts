import { z } from 'zod';

export const QUOTE_STATUSES = ['DRAFT', 'SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED'] as const;

export const quoteLineItemSchema = z.object({
	title: z.string().trim().min(2, 'Give the line item a title.').max(120),
	cleaningType: z.string().trim().max(120).default(''),
	description: z.string().trim().max(500).default(''),
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

/** A line-item row as edited in the quote forms, including its local accordion state. */
export type QuoteItemRow = {
	id: number;
	title: string;
	cleaningType: string;
	description: string;
	quantity: number;
	unitPriceTzs: number;
	open: boolean;
};

/** The most line items a single quote may contain. */
export const MAX_QUOTE_LINE_ITEMS = 10;

/** The languages a quote document can be rendered in. */
export type QuoteDocumentLang = 'en' | 'sw';

/** Free-text terms shown on a quote document, authored per language. */
export type QuoteTerms = Record<QuoteDocumentLang, string>;

/** Sensible starting terms for a new quote, in each supported language. */
export const DEFAULT_QUOTE_TERMS: QuoteTerms = {
	en: 'All rates quoted are valid for 15 days.\n40% payment should be done in advance.\nThe remaining amount should be paid within 20 days of delivery.',
	sw: 'Bei zote zilizotolewa ni halali kwa siku 15.\nMalipo ya 40% yanapaswa kufanywa kabla.\nKiasi kilichobaki kilipwe ndani ya siku 20 baada ya huduma kukamilika.'
};

/**
 * Reads parallel `title[]`, `cleaningType[]`, `description[]`, `quantity[]` and
 * `unitPriceTzs[]` fields from a quote line-item builder form and returns only rows
 * with a valid title, capped at {@link MAX_QUOTE_LINE_ITEMS}.
 */
export function readLineItems(data: FormData): QuoteLineItemInput[] {
	const titles = data.getAll('title').map(String);
	const cleaningTypes = data.getAll('cleaningType').map(String);
	const descriptions = data.getAll('description').map(String);
	const quantities = data.getAll('quantity').map(String);
	const prices = data.getAll('unitPriceTzs').map(String);

	return titles
		.map((title, index) =>
			quoteLineItemSchema.safeParse({
				title,
				cleaningType: cleaningTypes[index] ?? '',
				description: descriptions[index] ?? '',
				quantity: quantities[index] ?? '1',
				unitPriceTzs: prices[index] ?? '0'
			})
		)
		.filter((result): result is { success: true; data: QuoteLineItemInput } => result.success)
		.map((result) => result.data)
		.slice(0, MAX_QUOTE_LINE_ITEMS);
}
