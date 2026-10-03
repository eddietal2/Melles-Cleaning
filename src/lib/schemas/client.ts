import { z } from 'zod';

export const CLIENT_TYPES = ['RESIDENTIAL', 'COMMERCIAL'] as const;
export const CLIENT_STATUSES = ['PROSPECT', 'ACTIVE', 'INACTIVE'] as const;

const optional = (max: number) => z.string().trim().max(max).optional();

export const clientSchema = z.object({
	displayName: z.string().trim().min(2, 'Enter the client name.').max(160),
	clientType: z.enum(CLIENT_TYPES).default('RESIDENTIAL'),
	addressLine: optional(200),
	area: optional(120),
	city: z.string().trim().max(120).default('Dodoma'),
	notes: optional(2000)
});

export const clientContactSchema = z.object({
	name: z.string().trim().min(2, 'Enter a contact name.').max(120),
	role: optional(80),
	phone: z.string().trim().min(7, 'Enter a reachable phone number.').max(40),
	email: z.email('Enter a valid email address.').optional()
});

export type ClientInput = z.infer<typeof clientSchema>;
export type ClientContactInput = z.infer<typeof clientContactSchema>;
