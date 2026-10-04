import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { slugify } from '$lib/utils/slug';

export const load: PageServerLoad = async ({ params }) => {
	const service = await db.service.findUnique({
		where: { id: params.id },
		include: { pricingPackages: { orderBy: { sortOrder: 'asc' } } }
	});

	if (!service) {
		throw error(404, 'Service not found.');
	}

	return { service };
};

function optional(value: FormDataEntryValue | null): string | null {
	const text = String(value ?? '').trim();
	return text === '' ? null : text;
}

export const actions: Actions = {
	update: async ({ request, params }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();
		const slugInput = String(data.get('slug') ?? '').trim();
		const slug = slugify(slugInput || name);

		if (name.length < 2 || !slug) {
			return fail(400, { message: 'A name and a valid slug are required.' });
		}

		const clash = await db.service.findFirst({
			where: { slug, NOT: { id: params.id } }
		});

		if (clash) {
			return fail(400, { message: 'That slug is already used by another service.' });
		}

		await db.service.update({
			where: { id: params.id },
			data: {
				name,
				slug,
				shortDescription: optional(data.get('shortDescription')),
				bodyMarkdown: optional(data.get('bodyMarkdown')),
				sortOrder: Number(data.get('sortOrder') ?? 0) || 0,
				isActive: String(data.get('isActive') ?? '') === 'on'
			}
		});

		return { success: true };
	},

	createPackage: async ({ request, params }) => {
		const data = await request.formData();
		const name = String(data.get('name') ?? '').trim();

		if (!name) {
			return fail(400, { message: 'Enter a package name.' });
		}

		const highest = await db.pricingPackage.aggregate({
			where: { serviceId: params.id },
			_max: { sortOrder: true }
		});

		await db.pricingPackage.create({
			data: {
				serviceId: params.id,
				name,
				scope: optional(data.get('scope')),
				priceMinTzs: Number(data.get('priceMinTzs') ?? 0) || 0,
				priceMaxTzs: Number(data.get('priceMaxTzs') ?? 0) || 0,
				unit: optional(data.get('unit')),
				sortOrder: (highest._max.sortOrder ?? -1) + 1
			}
		});

		return { success: true };
	},

	updatePackage: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		await db.pricingPackage.update({
			where: { id },
			data: {
				name: String(data.get('name') ?? '').trim(),
				scope: optional(data.get('scope')),
				priceMinTzs: Number(data.get('priceMinTzs') ?? 0) || 0,
				priceMaxTzs: Number(data.get('priceMaxTzs') ?? 0) || 0,
				unit: optional(data.get('unit')),
				sortOrder: Number(data.get('sortOrder') ?? 0) || 0,
				isActive: String(data.get('isActive') ?? '') === 'on'
			}
		});

		return { success: true };
	},

	deletePackage: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		await db.pricingPackage.delete({ where: { id } });

		return { success: true };
	},

	deleteService: async ({ params }) => {
		const bookings = await db.booking.count({ where: { serviceId: params.id } });

		if (bookings > 0) {
			return fail(400, {
				message: 'This service has bookings and cannot be deleted. Hide it instead.'
			});
		}

		await db.service.delete({ where: { id: params.id } });

		throw redirect(303, '/admin/website/services');
	}
};
