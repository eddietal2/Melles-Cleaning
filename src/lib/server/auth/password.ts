import bcrypt from 'bcryptjs';

/**
 * Password hashing helpers.
 *
 * bcrypt is a pure-JavaScript implementation so it works on every platform
 * (including the Windows/OneDrive development environment) without native
 * build tooling. A cost factor of 12 is a reasonable balance for a small CRM.
 */
const SALT_ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, SALT_ROUNDS);
}

export function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
	return bcrypt.compare(password, passwordHash);
}
