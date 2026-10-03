import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { slugify } from '$lib/utils/slug';

export const load: PageServerLoad = async () => {
	const services = await db.service.findMany({
		orderBy: { sortOrder: 'asc' },
		include: { _count: { select: { pricingPackages: true } } }
	});

	return { services };
};

export const actions: Actions = {
	create: async ({ request }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();

		if (name.length < 2) {
			return fail(400, { message: 'Enter a service name.' });
		}

		let slug = slugify(name);
		if (await db.service.findUnique({ where: { slug } })) {
			slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
		}

		const highest = await db.service.aggregate({ _max: { sortOrder: true } });

		await db.service.create({
			data: {
				name,
				slug,
				sortOrder: (highest._max.sortOrder ?? -1) + 1,
				isActive: false
			}
		});

		return { success: true };
	},

	toggleActive: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');
		const active = String(data.get('active') ?? '') === 'true';

		await db.service.update({ where: { id }, data: { isActive: active } });

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		const bookings = await db.booking.count({ where: { serviceId: id } });
		if (bookings > 0) {
			return fail(400, {
				message: 'This service has bookings and cannot be deleted. Hide it instead.'
			});
		}

		await db.service.delete({ where: { id } });

		return { success: true };
	}
};
