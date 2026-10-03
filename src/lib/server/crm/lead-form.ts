import { fail } from '@sveltejs/kit';
import { getSiteSettings } from '$lib/server/content/site';
import { createLead, notifyNewLead } from '$lib/server/crm/leads';
import { fieldErrors, formDataToObject, leadSchema } from '$lib/schemas/lead';

/**
 * Shared handler for the public contact and booking forms. Validates with Zod,
 * persists a lead and notifies the owner. Returns a SvelteKit form-action result.
 */
export async function handleLeadSubmission(request: Request, options?: { withSchedule?: boolean }) {
	const data = formDataToObject(await request.formData());

	let message: string | undefined = data.notes;
	if (options?.withSchedule) {
		const schedule = [data.preferredDate, data.preferredTime].filter(Boolean).join(' ');
		message =
			[schedule ? `Preferred: ${schedule}` : '', data.notes].filter(Boolean).join('\n') ||
			undefined;
	}

	const payload = {
		fullName: data.fullName,
		phone: data.phone,
		email: data.email,
		segment: data.segment,
		serviceInterestId: data.serviceInterestId,
		message,
		source: 'WEBSITE' as const
	};

	const parsed = leadSchema.safeParse(payload);

	if (!parsed.success) {
		return fail(400, { errors: fieldErrors(parsed.error), values: data });
	}

	const lead = await createLead(parsed.data);
	const settings = await getSiteSettings();
	await notifyNewLead(lead, parsed.data, settings.notificationEmail);

	return { success: true };
}
