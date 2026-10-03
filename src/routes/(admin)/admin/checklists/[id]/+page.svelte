<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatDateTime } from '$lib/utils/dates';
	import { CHECKLIST_STATUS_LABELS, badgeClass, checklistStatusTone } from '$lib/utils/status';

	let { data }: PageProps = $props();

	const checkedCount = $derived(data.checklist.results.filter((result) => result.isChecked).length);
</script>

<div class="space-y-8">
	<div>
		<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/checklists">← Checklists</a>
		<div class="mt-1 flex flex-wrap items-center gap-3">
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">
				{data.checklist.booking.bookingNumber}
			</h1>
			<span class={badgeClass(checklistStatusTone(data.checklist.status))}>{CHECKLIST_STATUS_LABELS[data.checklist.status]}</span>
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			{data.checklist.template.name} · {data.checklist.booking.client.displayName} · {checkedCount}/{data.checklist.results.length} complete
		</p>
	</div>

	<form method="POST" action="?/saveResults" class="space-y-6" use:enhance>
		{#each data.groups as group (group.section)}
			<section class="rounded-brand border border-border bg-background shadow-card">
				<div class="border-b border-border px-5 py-3">
					<h2 class="text-sm font-semibold text-foreground">{group.section}</h2>
					{#if group.guidance}<p class="text-xs text-muted-foreground">{group.guidance}</p>{/if}
				</div>
				<ul class="divide-y divide-border">
					{#each group.rows as row (row.item.id)}
						<li class="flex flex-wrap items-start gap-3 px-5 py-3">
							<input
								type="checkbox"
								name={`checked-${row.result.id}`}
								checked={row.result.isChecked}
								class="mt-1 rounded border-border text-brand-600 focus:ring-brand-600"
							/>
							<div class="min-w-56 flex-1">
								<span class="block text-sm text-foreground">{row.item.label}</span>
								{#if row.result.checkedAt}
									<p class="text-xs text-muted-foreground">Checked {formatDateTime(row.result.checkedAt)}</p>
								{/if}
								<input
									name={`note-${row.result.id}`}
									value={row.result.note ?? ''}
									placeholder="Note (optional)"
									class="mt-1 block w-full rounded-brand border-border text-sm shadow-sm focus:border-brand-600 focus:ring-brand-600"
								/>
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/each}

		<button type="submit" class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
			Save progress
		</button>
	</form>

	<section class="rounded-brand border border-border bg-background p-5 shadow-card">
		<h2 class="text-sm font-semibold text-foreground">Supervisor walkthrough & client sign-off</h2>
		{#if data.checklist.signedOffAt}
			<p class="mt-2 text-sm text-success">Signed off {formatDateTime(data.checklist.signedOffAt)}</p>
			{#if data.checklist.clientSignatureName}
				<p class="text-sm text-muted-foreground">Client: {data.checklist.clientSignatureName}</p>
			{/if}
		{:else}
			<form method="POST" action="?/signOff" class="mt-3 flex flex-wrap items-end gap-3" use:enhance>
				<div class="min-w-56 flex-1">
					<label for="clientSignatureName" class="block text-sm font-medium text-foreground">Client name (sign-off)</label>
					<input id="clientSignatureName" name="clientSignatureName" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
				</div>
				<button type="submit" class="rounded-brand border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
					Complete checklist
				</button>
			</form>
		{/if}
	</section>
</div>
