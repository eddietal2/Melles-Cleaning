/// <reference types="node" />
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/lib/server/generated/prisma/client';

/**
 * Idempotent seed. Safe to run repeatedly:
 *   pnpm db:seed
 *
 * Creates the owner account, services with pricing packages, FAQ, testimonials,
 * the standard 20-point quality checklist and default site settings. Content sets
 * are only created when empty so that owner edits are never overwritten.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	throw new Error('DATABASE_URL is required to run the seed script.');
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const CHECKLIST: { section: string; guidance: string; items: string[] }[] = [
	{
		section: 'Living & General Areas',
		guidance: 'High and low dusting, sanitisations and floor care',
		items: [
			'Cobweb removal: high and low dusting of ceilings, light fixtures, corners and door frames',
			'Touchpoint sanitisation: light switches, door handles and outlet covers',
			'Glass and mirrors: streak-free interior panes, sills and mirrors',
			'Surface dusting: tables, entertainment units, shelves and decor',
			'Floor care: sweeping, vacuuming and damp-mopping hard surfaces',
			'Upholstery refresh: sofa cushions, rugs and seat fabrics',
			'Waste management: empty bins, replace liners, wipe bin lids'
		]
	},
	{
		section: 'Kitchen',
		guidance: 'Degreasing and sanitising all food preparation surfaces',
		items: [
			'Countertop and backsplash sanitisation',
			'Appliance exterior wipe-down: fridge, oven and microwave front panels',
			'Sink and faucet scrubbing: basin, chrome taps and drain sanitisation',
			'Cabinet fronts: doors, handles and drawer faces',
			'Kitchen floor washing with a grease-cutting cleaner'
		]
	},
	{
		section: 'Bathrooms & Restrooms',
		guidance: 'Full disinfection and descaling',
		items: [
			'Toilet disinfection: bowl, rim, tank exterior and surrounding floor',
			'Shower and tub scrubbing: tile walls, glass screens and bathtubs',
			'Vanity and basin care: sinks, vanity tops and chrome fittings',
			'Bathroom mirror polishing to remove water spots',
			'Floor and drain sanitation'
		]
	},
	{
		section: 'Touchpoints & Finishing',
		guidance: 'Final detail work and sign-off',
		items: [
			'Baseboards and door panels: spot-clean scuffs from doors, frames and skirting',
			'Deodorising: apply fragrance spray on completion',
			'Supervisor walkthrough: final inspection signed off with the client'
		]
	}
];

interface SeedPackage {
	name: string;
	scope: string;
	priceMinTzs: number;
	priceMaxTzs: number;
	unit: string;
}

interface SeedService {
	slug: string;
	name: string;
	shortDescription: string;
	bodyMarkdown: string;
	sortOrder: number;
	packages: SeedPackage[];
}

const SERVICES: SeedService[] = [
	{
		slug: 'standard-residential-cleaning',
		name: 'Standard Residential Cleaning',
		shortDescription: 'Routine home maintenance for busy households.',
		bodyMarkdown:
			'Dusting, sweeping, mopping, bathroom sanitisation, kitchen deep cleaning and routine bed-making for 2–3 bedroom homes. Ideal as a weekly or bi-weekly service so your home never falls behind.',
		sortOrder: 0,
		packages: [
			{
				name: 'Standard House Clean',
				scope: '2–3 bedroom home, routine maintenance',
				priceMinTzs: 40000,
				priceMaxTzs: 60000,
				unit: 'per visit'
			}
		]
	},
	{
		slug: 'deep-clean-move-in-out',
		name: 'Deep Clean & Move-In / Move-Out',
		shortDescription: 'Intensive scrubbing for tenants, owners and agencies.',
		bodyMarkdown:
			'A comprehensive top-to-bottom reset covering appliances, baseboards, window sills, cabinet fronts, grout and drains. Perfect for recovering a deposit, preparing a unit for new occupants, or a seasonal refresh.',
		sortOrder: 1,
		packages: [
			{
				name: 'Deep Clean / Move-In Clean',
				scope: 'Comprehensive scrubbing, appliances, baseboards',
				priceMinTzs: 60000,
				priceMaxTzs: 120000,
				unit: 'per visit'
			},
			{
				name: 'Sofa / Upholstery Cleaning',
				scope: 'Deep stain removal and fabric refresh',
				priceMinTzs: 30000,
				priceMaxTzs: 60000,
				unit: 'per set'
			}
		]
	},
	{
		slug: 'airbnb-guest-house-turnovers',
		name: 'Airbnb & Guest House Turnovers',
		shortDescription: 'Fast-turnaround cleans for short-stay hosts.',
		bodyMarkdown:
			'Same-day turnover cleaning between guests, including linen replacement, bathroom restocking and a final presentation check. Built for hosts who are rated on cleanliness.',
		sortOrder: 2,
		packages: [
			{
				name: 'Guest Turnover Clean',
				scope: 'Clean, linen change and amenity restocking',
				priceMinTzs: 35000,
				priceMaxTzs: 70000,
				unit: 'per turnover'
			}
		]
	},
	{
		slug: 'office-commercial-cleaning',
		name: 'Small Office & Commercial Resets',
		shortDescription: 'Evening or early-morning maintenance for offices.',
		bodyMarkdown:
			'Scheduled cleaning for small businesses, agencies and professional offices. Work is completed outside business hours against a documented checklist, with a monthly retainer for predictable costs.',
		sortOrder: 3,
		packages: [
			{
				name: 'Small Office Reset',
				scope: '1–2 visits per week, maintenance clean',
				priceMinTzs: 150000,
				priceMaxTzs: 250000,
				unit: 'per month'
			},
			{
				name: 'Medium Commercial Office',
				scope: 'Full facility care, scheduled team',
				priceMinTzs: 400000,
				priceMaxTzs: 800000,
				unit: 'per month'
			}
		]
	}
];

const FAQ: { question: string; answer: string; sortOrder: number }[] = [
	{
		question: 'Which areas of Dodoma do you serve?',
		answer:
			'We serve residential estates, offices and short-stay properties throughout Dodoma. Travel beyond the town centre may include a small transport fee, which we confirm before booking.',
		sortOrder: 0
	},
	{
		question: 'Do I need to provide cleaning equipment or supplies?',
		answer:
			'For the first visit we can work with your supplies, but we bring professional microfiber cloths, chemicals and safety equipment as standard for regular clients.',
		sortOrder: 1
	},
	{
		question: 'How much does a standard house clean cost?',
		answer:
			'A routine clean for a 2–3 bedroom home is 40,000–60,000 TZS. Deep cleans and move-in/move-out resets range from 60,000–120,000 TZS depending on size and condition.',
		sortOrder: 2
	},
	{
		question: 'Are your staff vetted?',
		answer:
			'Yes. Every cleaner is background-checked, works in branded uniform and follows a signed service agreement. A supervisor inspects the work before we close a job.',
		sortOrder: 3
	},
	{
		question: 'What is your quality guarantee?',
		answer:
			'Each visit is measured against our 20-point checklist and signed off with you. If something is missed, tell us within 24 hours and we will return to put it right at no extra cost.',
		sortOrder: 4
	},
	{
		question: 'How do I pay?',
		answer:
			'We accept cash and mobile money (M-Pesa, Tigo Pesa, Airtel Money and Halopesa). Corporate clients can be invoiced monthly on a retainer.',
		sortOrder: 5
	}
];

const TESTIMONIALS: {
	clientName: string;
	clientRole: string;
	quote: string;
	rating: number;
	sortOrder: number;
}[] = [
	{
		clientName: 'Asha M.',
		clientRole: 'Homeowner, Dodoma',
		quote:
			'I booked a deep clean before moving in and the house was spotless. The team arrived on time, wore uniforms and walked me through a checklist at the end.',
		rating: 5,
		sortOrder: 0
	},
	{
		clientName: 'David K.',
		clientRole: 'Airbnb host',
		quote:
			'Turnovers used to be my biggest stress. Melles handles them the same day and my guest ratings for cleanliness have gone up noticeably.',
		rating: 5,
		sortOrder: 1
	},
	{
		clientName: 'Grace N.',
		clientRole: 'Office manager',
		quote:
			'The monthly retainer is transparent and the office is always ready before staff arrive. No hidden costs and easy to reach on WhatsApp.',
		rating: 5,
		sortOrder: 2
	}
];

function settings(): { key: string; value: string; group: string }[] {
	return [
		{ key: 'business_name', value: 'Melles Cleaning Services', group: 'general' },
		{ key: 'business_city', value: 'Dodoma', group: 'general' },
		{ key: 'business_country', value: 'Tanzania', group: 'general' },
		{ key: 'business_hours', value: 'Mon–Sat, 07:00–19:00 EAT', group: 'general' },
		{ key: 'business_address', value: 'Dodoma, Tanzania', group: 'general' },
		{ key: 'business_phone', value: process.env.PUBLIC_BUSINESS_PHONE ?? '', group: 'contact' },
		{ key: 'business_whatsapp', value: process.env.PUBLIC_WHATSAPP_NUMBER ?? '', group: 'contact' },
		{ key: 'business_email', value: '', group: 'contact' },
		{ key: 'notification_email', value: '', group: 'contact' },
		{ key: 'referral_credit_tzs', value: '10000', group: 'promotions' },
		{ key: 'first_clean_discount_percent', value: '20', group: 'promotions' }
	];
}

async function seedOwner() {
	const email = (process.env.OWNER_EMAIL ?? 'owner@mellescleaning.test').toLowerCase();
	const password = process.env.OWNER_PASSWORD ?? 'change-me-now';
	const passwordHash = await bcrypt.hash(password, 12);

	await db.user.upsert({
		where: { email },
		update: { name: 'Melles Owner', role: 'OWNER', isActive: true },
		create: {
			email,
			name: 'Melles Owner',
			role: 'OWNER',
			isActive: true,
			passwordHash
		}
	});

	console.log(`✔ Owner account ready: ${email}`);
}

async function seedChecklist() {
	const existing = await db.checklistTemplate.findFirst({
		where: { name: 'Standard 20-Point QC' }
	});

	if (existing) {
		console.log('✔ Checklist template already present');
		return;
	}

	let sortOrder = 0;

	await db.checklistTemplate.create({
		data: {
			name: 'Standard 20-Point QC',
			description: 'The standard quality control checklist used on every job visit.',
			isDefault: true,
			items: {
				create: CHECKLIST.flatMap((group) =>
					group.items.map((label) => ({
						section: group.section,
						label,
						guidance: group.guidance,
						sortOrder: sortOrder++,
						isRequired: true
					}))
				)
			}
		}
	});

	console.log('✔ 20-point checklist template created');
}

async function seedServices() {
	for (const service of SERVICES) {
		const record = await db.service.upsert({
			where: { slug: service.slug },
			update: {
				name: service.name,
				shortDescription: service.shortDescription,
				bodyMarkdown: service.bodyMarkdown,
				sortOrder: service.sortOrder,
				isActive: true
			},
			create: {
				slug: service.slug,
				name: service.name,
				shortDescription: service.shortDescription,
				bodyMarkdown: service.bodyMarkdown,
				sortOrder: service.sortOrder,
				isActive: true
			}
		});

		const packageCount = await db.pricingPackage.count({ where: { serviceId: record.id } });
		if (packageCount === 0) {
			await db.pricingPackage.createMany({
				data: service.packages.map((pkg, index) => ({
					serviceId: record.id,
					name: pkg.name,
					scope: pkg.scope,
					priceMinTzs: pkg.priceMinTzs,
					priceMaxTzs: pkg.priceMaxTzs,
					unit: pkg.unit,
					sortOrder: index
				}))
			});
		}
	}

	console.log(`✔ ${SERVICES.length} services and their pricing packages seeded`);
}

async function seedFaq() {
	const count = await db.faqItem.count();
	if (count > 0) {
		console.log('✔ FAQ already present');
		return;
	}

	await db.faqItem.createMany({
		data: FAQ.map((item) => ({ ...item, isPublished: true }))
	});

	console.log(`✔ ${FAQ.length} FAQ items created`);
}

async function seedTestimonials() {
	const count = await db.testimonial.count();
	if (count > 0) {
		console.log('✔ Testimonials already present');
		return;
	}

	await db.testimonial.createMany({
		data: TESTIMONIALS.map((item) => ({ ...item, isPublished: true }))
	});

	console.log(`✔ ${TESTIMONIALS.length} testimonials created`);
}

async function seedSettings() {
	for (const setting of settings()) {
		await db.siteSetting.upsert({
			where: { key: setting.key },
			update: { group: setting.group },
			create: setting
		});
	}

	console.log(`✔ ${settings().length} site settings present`);
}

async function main() {
	await seedOwner();
	await seedSettings();
	await seedServices();
	await seedFaq();
	await seedTestimonials();
	await seedChecklist();
}

main()
	.then(async () => {
		await db.$disconnect();
		console.log('Seed complete.');
	})
	.catch(async (error) => {
		console.error('Seed failed:', error);
		await db.$disconnect();
		process.exit(1);
	});
