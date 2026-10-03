import { z } from 'zod';

export const LEAD_SOURCES = [
	'WEBSITE',
	'WHATSAPP',
	'REFERRAL',
	'FLYER',
	'GOOGLE',
	'PHONE',
	'OTHER'
] as const;

export const CLIENT_SEGMENTS = ['RESIDENTIAL', 'COMMERCIAL'] as const;

const optionalTrimmed = (max: number) => z.string().trim().max(max).optional();

export const leadSchema = z.object({
	fullName: z.string().trim().min(2, 'Please enter your full name.').max(120),
	phone: z.string().trim().min(7, 'Please enter a reachable phone number.').max(40),
	email: z.email('Please enter a valid email address.').optional(),
	segment: z.enum(CLIENT_SEGMENTS).optional(),
	serviceInterestId: z.string().trim().min(1).optional(),
	message: optionalTrimmed(2000),
	source: z.enum(LEAD_SOURCES).default('WEBSITE')
});

export type LeadInput = z.infer<typeof leadSchema>;

/**
 * Converts raw form data into a plain object, dropping empty strings so that
 * optional fields validate as absent rather than invalid.
 */
export function formDataToObject(data: FormData): Record<string, string> {
	const result: Record<string, string> = {};

	for (const [key, value] of data.entries()) {
		if (typeof value !== 'string') continue;
		if (value.trim() === '') continue;
		result[key] = value;
	}

	return result;
}

/** Turns Zod issues into a `{ field: message }` map for form rendering. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
	const errors: Record<string, string> = {};

	for (const issue of error.issues) {
		const key = issue.path[0];
		if (typeof key === 'string' && !errors[key]) {
			errors[key] = issue.message;
		}
	}

	return errors;
}
