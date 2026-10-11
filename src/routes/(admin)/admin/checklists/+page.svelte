<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { formatDateTime } from '$lib/utils/dates';
	import { badgeClass, checklistStatusLabel, checklistStatusTone } from '$lib/utils/status';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';

	let { data, form }: PageProps = $props();

	const message = $derived((form as { message?: string } | null)?.message);
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">
			{m.admin_checklists_title()}
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			{m.admin_checklists_intro()}
		</p>
	</div>

	{#if message}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{message}
		</p>
	{/if}

	{#await data.streamed}
		<TableSkeleton rows={6} columns={6} />
	{:then payload}
		<section class="grid gap-6 lg:grid-cols-2">
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">{m.admin_checklists_templates()}</h2>
				<ul class="mt-3 space-y-3 text-sm">
					{#each payload.templates as template (template.id)}
						<li>
							<div class="flex items-center justify-between gap-3">
								<span class="font-medium text-foreground">{template.name}</span>
								{#if template.isDefault}
									<span
										class="rounded-pill bg-brand-50 px-2 py-0.5 text-xs font-medium text-brand-700"
										>{m.admin_checklists_default()}</span
									>
								{/if}
							</div>
							<p class="text-xs text-muted-foreground">
								{m.admin_checklists_template_meta({
									items: template.items.length,
									jobs: template._count.jobChecklists
								})}
							</p>
						</li>
					{:else}
						<li class="text-muted-foreground">
							{m.admin_checklists_no_templates()}
						</li>
					{/each}
				</ul>
			</div>

			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">
					{m.admin_checklists_attach_heading()}
				</h2>
				<p class="mt-1 text-xs text-muted-foreground">
					{m.admin_checklists_attach_hint()}
				</p>
				<form
					method="POST"
					action="?/attach"
					class="mt-3 flex flex-wrap items-end gap-3"
					use:enhance
				>
					<div class="min-w-56 flex-1">
						<label for="bookingId" class="block text-sm font-medium text-foreground"
							>{m.common_booking()}</label
						>
						<select
							id="bookingId"
							name="bookingId"
							required
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						>
							<option value="">{m.admin_checklists_select_booking()}</option>
							{#each payload.bookingsWithoutChecklist as booking (booking.id)}
								<option value={booking.id}
									>{booking.bookingNumber} · {booking.client.displayName}</option
								>
							{/each}
						</select>
					</div>
					<button
						type="submit"
						class="rounded-brand border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-brand-500 hover:text-brand-700"
					>
						{m.admin_checklists_attach()}
					</button>
				</form>
			</div>
		</section>

		<div class="overflow-hidden rounded-brand border border-border bg-background shadow-card">
			<table class="min-w-full divide-y divide-border text-sm">
				<thead
					class="bg-surface-muted text-left text-xs tracking-wide text-muted-foreground uppercase"
				>
					<tr>
						<th class="px-5 py-3 font-medium">{m.common_job()}</th>
						<th class="px-5 py-3 font-medium">{m.common_client()}</th>
						<th class="px-5 py-3 font-medium">{m.admin_checklists_template()}</th>
						<th class="px-5 py-3 font-medium">{m.common_items()}</th>
						<th class="px-5 py-3 font-medium">{m.common_status()}</th>
						<th class="px-5 py-3 font-medium">{m.common_created()}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each payload.jobChecklists as checklist (checklist.id)}
						<tr>
							<td class="px-5 py-3">
								<a
									href="/admin/checklists/{checklist.id}"
									class="font-medium text-foreground hover:text-brand-700"
									>{checklist.booking.bookingNumber}</a
								>
								<p class="text-xs text-muted-foreground">{checklist.booking.service.name}</p>
							</td>
							<td class="px-5 py-3 text-muted-foreground">{checklist.booking.client.displayName}</td
							>
							<td class="px-5 py-3 text-muted-foreground">{checklist.template.name}</td>
							<td class="px-5 py-3 text-muted-foreground">{checklist._count.results}</td>
							<td class="px-5 py-3">
								<span class={badgeClass(checklistStatusTone(checklist.status))}
									>{checklistStatusLabel(checklist.status)}</span
								>
							</td>
							<td class="px-5 py-3 text-muted-foreground">{formatDateTime(checklist.createdAt)}</td>
						</tr>
					{:else}
						<tr>
							<td class="px-5 py-6 text-muted-foreground" colspan="6">
								{m.admin_checklists_empty()}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:catch}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{m.admin_checklists_error()}
		</p>
	{/await}
</div>
