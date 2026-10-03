import { z } from 'zod';

export const checklistResultSchema = z.object({
	resultId: z.string().trim().min(1),
	isChecked: z.boolean().default(false),
	note: z.string().trim().max(500).optional()
});

export const checklistSignOffSchema = z.object({
	clientSignatureName: z.string().trim().max(160).optional(),
	complete: z.boolean().default(false)
});

export type ChecklistResultInput = z.infer<typeof checklistResultSchema>;
export type ChecklistSignOffInput = z.infer<typeof checklistSignOffSchema>;

/** A checkbox is submitted only when ticked, so absence means false. */
export function readCheckbox(data: FormData, name: string): boolean {
	return data.get(name) === 'on' || data.get(name) === 'true';
}
