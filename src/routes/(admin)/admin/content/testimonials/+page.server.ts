import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const items = await db.testimonial.findMany({ orderBy: { sortOrder: 'asc' } });
	return { items };
};

function clampRating(value: FormDataEntryValue | null): number {
	const rating = Number(value ?? 5);
	if (!Number.isFinite(rating)) return 5;
	return Math.min(5, Math.max(1, Math.round(rating)));
}

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const clientName = String(data.get('clientName') ?? '').trim();
		const quote = String(data.get('quote') ?? '').trim();

		if (!clientName || !quote) {
			return fail(400, { message: 'A client name and a quote are required.' });
		}

		const highest = await db.testimonial.aggregate({ _max: { sortOrder: true } });

		await db.testimonial.create({
			data: {
				clientName,
				clientRole: String(data.get('clientRole') ?? '').trim() || null,
				quote,
				rating: clampRating(data.get('rating')),
				sortOrder: (highest._max.sortOrder ?? -1) + 1,
				isPublished: false
			}
		});

		return { success: true };
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		await db.testimonial.update({
			where: { id },
			data: {
				clientName: String(data.get('clientName') ?? '').trim(),
				clientRole: String(data.get('clientRole') ?? '').trim() || null,
				quote: String(data.get('quote') ?? '').trim(),
				rating: clampRating(data.get('rating')),
				sortOrder: Number(data.get('sortOrder') ?? 0) || 0
			}
		});

		return { success: true };
	},

	togglePublish: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const publish = String(data.get('publish') ?? '') === 'true';

		await db.testimonial.update({ where: { id }, data: { isPublished: publish } });

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		await db.testimonial.delete({ where: { id } });

		return { success: true };
	}
};
