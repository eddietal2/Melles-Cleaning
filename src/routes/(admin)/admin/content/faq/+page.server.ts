import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const items = await db.faqItem.findMany({ orderBy: { sortOrder: 'asc' } });
	return { items };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const question = String(data.get('question') ?? '').trim();
		const answer = String(data.get('answer') ?? '').trim();

		if (!question || !answer) {
			return fail(400, { message: 'Both a question and an answer are required.' });
		}

		const highest = await db.faqItem.aggregate({ _max: { sortOrder: true } });

		await db.faqItem.create({
			data: {
				question,
				answer,
				sortOrder: (highest._max.sortOrder ?? -1) + 1,
				isPublished: false
			}
		});

		return { success: true };
	},

	update: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		await db.faqItem.update({
			where: { id },
			data: {
				question: String(data.get('question') ?? '').trim(),
				answer: String(data.get('answer') ?? '').trim(),
				sortOrder: Number(data.get('sortOrder') ?? 0) || 0
			}
		});

		return { success: true };
	},

	togglePublish: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const publish = String(data.get('publish') ?? '') === 'true';

		await db.faqItem.update({ where: { id }, data: { isPublished: publish } });

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		await db.faqItem.delete({ where: { id } });

		return { success: true };
	}
};
