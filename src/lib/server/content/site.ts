import { db } from '../db';

export interface SiteSettings {
	businessName: string;
	city: string;
	country: string;
	hours: string;
	phone: string;
	whatsapp: string;
	email: string;
	address: string;
	notificationEmail: string;
	referralCreditTzs: number;
	firstCleanDiscountPercent: number;
}

/**
 * Code-level defaults. `getSiteSettings` merges these with whatever the owner has
 * saved in the database, so the site always renders even before content is edited.
 */
export const DEFAULT_SITE_SETTINGS: SiteSettings = {
	businessName: 'Melles Cleaning Services',
	city: 'Dodoma',
	country: 'Tanzania',
	hours: 'Mon–Sat, 07:00–19:00 EAT',
	phone: '',
	whatsapp: '',
	email: '',
	address: 'Dodoma, Tanzania',
	notificationEmail: '',
	referralCreditTzs: 10000,
	firstCleanDiscountPercent: 20
};

function toNumber(value: string | undefined, fallback: number): number {
	if (!value) return fallback;
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

/** Reads site settings from the database, falling back to code defaults. */
export async function getSiteSettings(): Promise<SiteSettings> {
	const rows = await db.siteSetting.findMany();
	const map = new Map(rows.map((row) => [row.key, row.value]));

	return {
		businessName: map.get('business_name') ?? DEFAULT_SITE_SETTINGS.businessName,
		city: map.get('business_city') ?? DEFAULT_SITE_SETTINGS.city,
		country: map.get('business_country') ?? DEFAULT_SITE_SETTINGS.country,
		hours: map.get('business_hours') ?? DEFAULT_SITE_SETTINGS.hours,
		phone: map.get('business_phone') ?? DEFAULT_SITE_SETTINGS.phone,
		whatsapp: map.get('business_whatsapp') ?? DEFAULT_SITE_SETTINGS.whatsapp,
		email: map.get('business_email') ?? DEFAULT_SITE_SETTINGS.email,
		address: map.get('business_address') ?? DEFAULT_SITE_SETTINGS.address,
		notificationEmail: map.get('notification_email') ?? DEFAULT_SITE_SETTINGS.notificationEmail,
		referralCreditTzs: toNumber(
			map.get('referral_credit_tzs'),
			DEFAULT_SITE_SETTINGS.referralCreditTzs
		),
		firstCleanDiscountPercent: toNumber(
			map.get('first_clean_discount_percent'),
			DEFAULT_SITE_SETTINGS.firstCleanDiscountPercent
		)
	};
}

const serviceInclude = {
	pricingPackages: {
		where: { isActive: true },
		orderBy: { sortOrder: 'asc' as const }
	},
	heroMedia: true
};

/** Active services with their active pricing packages, ordered for display. */
export async function getServices() {
	return db.service.findMany({
		where: { isActive: true },
		orderBy: { sortOrder: 'asc' },
		include: serviceInclude
	});
}

/** A single active service by slug, including pricing and FAQ. */
export async function getServiceBySlug(slug: string) {
	return db.service.findFirst({
		where: { slug, isActive: true },
		include: {
			...serviceInclude,
			faqItems: { where: { isPublished: true }, orderBy: { sortOrder: 'asc' } }
		}
	});
}

/** All active pricing packages with their parent service. */
export async function getPricingPackages() {
	return db.pricingPackage.findMany({
		where: { isActive: true, service: { isActive: true } },
		orderBy: [{ service: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
		include: { service: true }
	});
}

export async function getPublishedFaq() {
	return db.faqItem.findMany({
		where: { isPublished: true },
		orderBy: { sortOrder: 'asc' }
	});
}

export async function getPublishedTestimonials() {
	return db.testimonial.findMany({
		where: { isPublished: true },
		orderBy: { sortOrder: 'asc' },
		include: { avatarMedia: true }
	});
}

export async function getPublishedGallery() {
	return db.galleryItem.findMany({
		where: { isPublished: true },
		orderBy: { sortOrder: 'asc' },
		include: { media: true }
	});
}
