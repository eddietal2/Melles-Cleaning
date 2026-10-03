import { z } from 'zod';

export const BOOKING_STATUSES = [
	'SCHEDULED',
	'IN_PROGRESS',
	'ON_HOLD',
	'COMPLETED',
	'VERIFIED',
	'INVOICED',
	'PAID',
	'CANCELLED'
] as const;

export const RECURRENCE_FREQUENCIES = ['ONE_TIME', 'WEEKLY', 'BI_WEEKLY', 'MONTHLY'] as const;

const optional = (max: number) => z.string().trim().max(max).optional();

export const bookingSchema = z.object({
	clientId: z.string().trim().min(1, 'Choose a client.'),
	serviceId: z.string().trim().min(1, 'Choose a service.'),
	scheduledDate: z.string().trim().min(1, 'Choose a scheduled date.'),
	scheduledTime: z.string().trim().default('08:00'),
	durationMinutes: z.coerce.number().int().min(30, 'Use at least 30 minutes.').max(1440).default(120),
	recurrenceFrequency: z.enum(RECURRENCE_FREQUENCIES).default('ONE_TIME'),
	addressSnapshot: optional(240),
	specialInstructions: optional(2000),
	quotedTotalTzs: z.coerce.number().int().min(0).max(1_000_000_000).default(0)
});

export type BookingInput = z.infer<typeof bookingSchema>;
