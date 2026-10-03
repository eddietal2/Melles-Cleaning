import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/lib/server/generated/prisma/client';

/**
 * Idempotent seed. Safe to run repeatedly:
 *   pnpm db:seed
 *
 * Creates the owner account, the standard 20-point quality checklist and the
 * default site settings. Reads OWNER_EMAIL / OWNER_PASSWORD from the environment
 * with sensible development fallbacks.
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

const SETTINGS: { key: string; value: string; group: string }[] = [
	{ key: 'business_name', value: 'Melles Cleaning Services', group: 'general' },
	{ key: 'business_city', value: 'Dodoma', group: 'general' },
	{ key: 'business_country', value: 'Tanzania', group: 'general' },
	{ key: 'business_hours', value: 'Mon–Sat, 07:00–19:00 EAT', group: 'general' },
	{ key: 'referral_credit_tzs', value: '10000', group: 'promotions' },
	{ key: 'first_clean_discount_percent', value: '20', group: 'promotions' }
];

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

async function seedSettings() {
	for (const setting of SETTINGS) {
		await db.siteSetting.upsert({
			where: { key: setting.key },
			update: { value: setting.value, group: setting.group },
			create: setting
		});
	}

	console.log(`✔ ${SETTINGS.length} site settings upserted`);
}

async function main() {
	await seedOwner();
	await seedChecklist();
	await seedSettings();
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
