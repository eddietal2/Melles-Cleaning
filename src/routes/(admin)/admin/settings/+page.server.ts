import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { SETTING_FIELDS } from '$lib/server/content/settings-fields';

export const load: PageServerLoad = async () => {
	const rows = await db.siteSetting.findMany();
	const values = Object.fromEntries(rows.map((row) => [row.key, row.value]));

	return { fields: SETTING_FIELDS, values };
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
	}
};
