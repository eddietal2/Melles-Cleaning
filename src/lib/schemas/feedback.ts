import { z } from 'zod';

export const feedbackSchema = z.object({
	bookingId: z.string().trim().min(1, 'Choose a booking.'),
	rating: z.coerce.number().int().min(1, 'Rate between 1 and 5.').max(5).default(5),
	comment: z.string().trim().max(2000).optional()
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;
