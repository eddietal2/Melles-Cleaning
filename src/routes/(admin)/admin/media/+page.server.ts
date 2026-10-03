import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { deleteObject, hasPublicUrl, isR2Configured, publicUrl } from '$lib/server/media/r2';

export const load: PageServerLoad = async () => {
	const [media, galleryItems] = await Promise.all([
		db.mediaAsset.findMany({ orderBy: { createdAt: 'desc' } }),
		db.galleryItem.findMany({ select: { mediaId: true, isPublished: true } })
	]);

	return {
		media,
		gallery: galleryItems,
		r2Configured: isR2Configured(),
		publicUrlConfigured: hasPublicUrl()
	};
};

export const actions: Actions = {
	register: async ({ request, locals }) => {
		const data = await request.formData();
		const key = String(data.get('key') ?? '').trim();

		if (!key) {
			return fail(400, { message: 'The upload did not complete.' });
		}

		const sizeRaw = Number(data.get('size') ?? 0);

		await db.mediaAsset.create({
			data: {
				r2Key: key,
				url: publicUrl(key),
				mimeType: String(data.get('mimeType') ?? 'image/jpeg'),
				sizeBytes: Number.isFinite(sizeRaw) && sizeRaw > 0 ? Math.round(sizeRaw) : null,
				altText: String(data.get('altText') ?? '').trim() || null,
				uploadedById: locals.user?.id ?? null
			}
		});

		return { success: true };
	},

	delete: async ({ request }) => {
		const data = await request.formData();
		const id = String(data.get('id') ?? '');

		const asset = await db.mediaAsset.findUnique({ where: { id } });
		if (!asset) {
			return fail(404, { message: 'Image not found.' });
		}

		await deleteObject(asset.r2Key).catch(() => undefined);
		await db.mediaAsset.delete({ where: { id } });

		return { success: true };
	},

	toggleGallery: async ({ request }) => {
		const data = await request.formData();
		const mediaId = String(data.get('mediaId') ?? '');

		const existing = await db.galleryItem.findFirst({ where: { mediaId } });

		if (existing) {
			await db.galleryItem.delete({ where: { id: existing.id } });
		} else {
			await db.galleryItem.create({ data: { mediaId, isPublished: false } });
		}

		return { success: true };
	},

	toggleGalleryPublish: async ({ request }) => {
		const data = await request.formData();
		const mediaId = String(data.get('mediaId') ?? '');
		const publish = String(data.get('publish') ?? '') === 'true';

		const item = await db.galleryItem.findFirst({ where: { mediaId } });
		if (!item) {
			return fail(404, { message: 'That image is not in the gallery.' });
		}

		await db.galleryItem.update({ where: { id: item.id }, data: { isPublished: publish } });

		return { success: true };
	}
};
