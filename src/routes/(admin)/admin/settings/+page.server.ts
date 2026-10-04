import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { accountSchema } from '$lib/schemas/account';
import { fieldErrors, formDataToObject } from '$lib/schemas/form';
import { updateAccount } from '$lib/server/auth/account';
import { SETTING_FIELDS } from '$lib/server/content/settings-fields';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	const rows = await db.siteSetting.findMany();
	const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));

	return {
		fields: SETTING_FIELDS,
		values,
		account: { email: locals.user?.email ?? '' }
	};
};

export const actions: Actions = {
	update: async ({ request }) => {
		const data = await request.formData();

		for (const field of SETTING_FIELDS) {
			const value = String(data.get(field.key) ?? '').trim();

			await db.siteSetting.upsert({
				where: { key: field.key },
				update: { value, group: field.group },
				create: { key: field.key, value, group: field.group }
			});
		}

		return { success: true };
	},

	updateAccount: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { accountMessage: 'Please sign in again.' });
		}

		const parsed = accountSchema.safeParse(formDataToObject(await request.formData()));

		if (!parsed.success) {
			return fail(400, { accountErrors: fieldErrors(parsed.error) });
		}

		const result = await updateAccount(
			locals.user.id,
			locals.session?.id ?? null,
			parsed.data
		);

		if ('error' in result) {
			return fail(400, {
				accountErrors: result.field ? { [result.field]: result.error } : {},
				accountMessage: result.error
			});
		}

		return {
			accountSuccess: true,
			accountMessage: result.passwordChanged
				? 'Account updated. Other devices have been signed out.'
				: 'Account updated.'
		};
	}
};
