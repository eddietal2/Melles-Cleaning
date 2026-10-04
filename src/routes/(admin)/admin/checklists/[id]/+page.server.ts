import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { recordAudit } from '$lib/server/audit';
import {
	getJobChecklist,
	saveChecklistResults,
	signOffChecklist
} from '$lib/server/crm/checklists';

export const load: PageServerLoad = async ({ params }) => {
	const checklist = await getJobChecklist(params.id);

	if (!checklist) {
		throw error(404, 'Checklist not found.');
	}

	// Group template items into their sections, paired with the saved result.
	type Row = {
		item: (typeof checklist.template.items)[number];
		result: (typeof checklist.results)[number];
	};
	const resultByItem = new Map(checklist.results.map((result) => [result.templateItemId, result]));
	const groups: { section: string; guidance: string | null; rows: Row[] }[] = [];

	for (const item of checklist.template.items) {
		const result = resultByItem.get(item.id);
		if (!result) continue;

		let group = groups.find((candidate) => candidate.section === item.section);
		if (!group) {
			group = { section: item.section, guidance: item.guidance, rows: [] };
			groups.push(group);
		}
		group.rows.push({ item, result });
	}

	return { checklist, groups };
};

export const actions: Actions = {
	saveResults: async ({ request, params }) => {
		const data = await request.formData();
		const checklist = await getJobChecklist(params.id);

		if (!checklist) {
			return fail(404, { message: 'Checklist not found.' });
		}

		const results = checklist.results.map((result) => ({
			resultId: result.id,
			isChecked: data.get(`checked-${result.id}`) === 'on',
			note: String(data.get(`note-${result.id}`) ?? '').trim() || undefined
		}));

		await saveChecklistResults(params.id, results);
		return { success: true };
	},

	signOff: async ({ request, params, locals }) => {
		const data = await request.formData();
		const signature = String(data.get('clientSignatureName') ?? '').trim();

		await signOffChecklist(params.id, locals.user?.id ?? null, signature || undefined);
		await recordAudit({
			userId: locals.user?.id,
			action: 'signoff',
			entityType: 'JobChecklist',
			entityId: params.id
		});

		return { success: true };
	}
};
