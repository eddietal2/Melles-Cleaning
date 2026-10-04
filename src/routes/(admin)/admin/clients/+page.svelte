<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';
	import {
		CLIENT_STATUS_LABELS,
		CLIENT_TYPE_LABELS,
		badgeClass,
		clientStatusTone
	} from '$lib/utils/status';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Clients</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			People and businesses you clean for. New clients can be added manually or converted from a
			lead.
		</p>
	</div>

	<details class="rounded-brand border border-border bg-background shadow-card">
		<summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-foreground"
			>Add a client</summary
		>
		<form method="POST" action="?/create" class="space-y-4 border-t border-border p-5" use:enhance>
			<div class="grid gap-4 sm:grid-cols-2">
				<div>
					<label for="displayName" class="block text-sm font-medium text-foreground"
						>Client name</label
					>
					<input
						id="displayName"
						name="displayName"
						required
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
					{#if errors.displayName}<p class="mt-1 text-xs text-danger">{errors.displayName}</p>{/if}
				</div>
				<div>
					<label for="clientType" class="block text-sm font-medium text-foreground">Type</label>
					<select
						id="clientType"
						name="clientType"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						<option value="RESIDENTIAL">Residential</option>
						<option value="COMMERCIAL">Commercial</option>
					</select>
				</div>
				<div>
					<label for="area" class="block text-sm font-medium text-foreground">Area</label>
					<input
						id="area"
						name="area"
						placeholder="e.g. Area C"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div>
					<label for="city" class="block text-sm font-medium text-foreground">City</label>
					<input
						id="city"
						name="city"
						value="Dodoma"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
			</div>

			<fieldset class="grid gap-4 border-t border-border pt-4 sm:grid-cols-2">
				<legend class="text-sm font-semibold text-foreground">Primary contact (optional)</legend>
				<div>
					<label for="contactName" class="block text-sm font-medium text-foreground">Name</label>
					<input
						id="contactName"
						name="contactName"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div>
					<label for="contactPhone" class="block text-sm font-medium text-foreground">Phone</label>
					<input
						id="contactPhone"
						name="contactPhone"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
			</fieldset>

			<button
				type="submit"
				class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
			>
				Save client
			</button>
		</form>
	</details>

	{#await data.streamed}
		<TableSkeleton rows={6} columns={5} />
	{:then clients}
		<div class="overflow-hidden rounded-brand border border-border bg-background shadow-card">
			<table class="min-w-full divide-y divide-border text-sm">
				<thead
					class="bg-surface-muted text-left text-xs tracking-wide text-muted-foreground uppercase"
				>
					<tr>
						<th class="px-5 py-3 font-medium">Client</th>
						<th class="px-5 py-3 font-medium">Status</th>
						<th class="px-5 py-3 font-medium">Jobs</th>
						<th class="px-5 py-3 font-medium">Invoices</th>
						<th class="px-5 py-3"></th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each clients as client (client.id)}
						<tr>
							<td class="px-5 py-3">
								<a
									href="/admin/clients/{client.id}"
									class="font-medium text-foreground hover:text-brand-700">{client.displayName}</a
								>
								<p class="text-xs text-muted-foreground">
									{CLIENT_TYPE_LABELS[client.clientType]}{client.area ? ` · ${client.area}` : ''}
								</p>
							</td>
							<td class="px-5 py-3">
								<span class={badgeClass(clientStatusTone(client.status))}
									>{CLIENT_STATUS_LABELS[client.status]}</span
								>
							</td>
							<td class="px-5 py-3 text-muted-foreground">{client._count.bookings}</td>
							<td class="px-5 py-3 text-muted-foreground">{client._count.invoices}</td>
							<td class="px-5 py-3 text-right">
								<form method="POST" action="?/delete" use:enhance>
									<input type="hidden" name="id" value={client.id} />
									<button
										type="submit"
										class="text-xs text-muted-foreground transition hover:text-danger"
										onclick={(event) => {
											if (!confirm('Delete this client and all related records?'))
												event.preventDefault();
										}}
									>
										Delete
									</button>
								</form>
							</td>
						</tr>
					{:else}
						<tr><td class="px-5 py-6 text-muted-foreground" colspan="5">No clients yet.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:catch}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			Could not load clients. Please refresh the page.
		</p>
	{/await}
</div>
