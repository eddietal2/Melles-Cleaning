import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async () => {
	const [services, faq, testimonials, gallery, media] = await Promise.all([
		db.service.count(),
		db.faqItem.count(),
		db.testimonial.count(),
		db.galleryItem.count(),
		db.mediaAsset.count()
	]);

	return { counts: { services, faq, testimonials, gallery, media } };
};
