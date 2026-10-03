import type { z } from 'zod';

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
