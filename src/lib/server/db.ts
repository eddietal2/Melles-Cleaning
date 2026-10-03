import { PrismaPg } from '@prisma/adapter-pg';
import { DATABASE_URL } from '$app/env/private';
import { PrismaClient } from './generated/prisma/client';

/**
 * Prisma client singleton.
 *
 * Prisma 7 talks to PostgreSQL through a driver adapter, so we build a single
 * PrismaPg adapter from DATABASE_URL and reuse one client across hot reloads in
 * development to avoid exhausting database connections.
 */
const adapter = new PrismaPg({ connectionString: DATABASE_URL });

const globalForPrisma = globalThis as unknown as { __mellesPrisma?: PrismaClient };

export const db = globalForPrisma.__mellesPrisma ?? new PrismaClient({ adapter });

if (!import.meta.env.PROD) {
	globalForPrisma.__mellesPrisma = db;
}
