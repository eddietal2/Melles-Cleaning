import type { Prisma } from '$lib/server/generated/prisma/client';
import { db } from './db';

export interface AuditEntry {
	userId?: string | null;
	action: string;
	entityType: string;
	entityId?: string | null;
	diff?: Prisma.InputJsonValue;
}

/**
 * Writes an audit trail row. Best-effort: a logging failure must never roll back
 * the business operation that triggered it.
 */
export async function recordAudit(entry: AuditEntry): Promise<void> {
	await db.auditLog
		.create({
			data: {
				userId: entry.userId ?? null,
				action: entry.action,
				entityType: entry.entityType,
				entityId: entry.entityId ?? null,
				diffJson: entry.diff
			}
		})
		.catch(() => undefined);
}
