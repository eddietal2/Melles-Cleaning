<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import Modal from '$lib/components/ui/modal.svelte';
	import PhoneInput from '$lib/components/ui/phone-input.svelte';
	import Spinner from '$lib/components/ui/spinner.svelte';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';
	import { formatDate } from '$lib/utils/dates';
	import { formatTzPhone } from '$lib/utils/phone';
	import { toast } from '$lib/utils/toast';
	import {
		CLIENT_STATUS_LABELS,
		CLIENT_TYPE_LABELS,
		badgeClass,
		clientStatusTone
	} from '$lib/utils/status';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});

	/** The add-client form toggles from the header action, so it opens after a failed submit. */
	// svelte-ignore state_referenced_locally
	let showForm = $state(Object.keys(errors).length > 0);

	/** True while the new-client form is being submitted. */
	let savingClient = $state(false);

	/** The client awaiting delete confirmation, or null when the dialog is closed. */
	let pendingDelete = $state<{ id: string; name: string } | null>(null);

	/** Submitted programmatically once the owner confirms the deletion. */
	let deleteForm = $state<HTMLFormElement | null>(null);
</script>

<div class="space-y-8">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">Clients</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				People and businesses you clean for. New clients can be added manually or converted from a
				lead.
			</p>
		</div>
		<button
			type="button"
			class="inline-flex shrink-0 items-center gap-2 rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-accent-700"
			onclick={() => (showForm = true)}
		>
			Add a client
		</button>
	</div>

	<Modal open={showForm} title="Add a client" onclose={() => (showForm = false)}>
		<form
			method="POST"
			action="?/create"
			class="space-y-4"
			use:enhance={() => {
				savingClient = true;
				return async ({ result, update }) => {
					await update({ reset: false });
					savingClient = false;
					if (result.type === 'success') {
						showForm = false;
						toast.success('Client added.');
					}
				};
			}}
		>
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
					<PhoneInput id="contactPhone" name="contactPhone" />
				</div>
				<div>
					<label for="contactRole" class="block text-sm font-medium text-foreground">Role</label>
					<input
						id="contactRole"
						name="contactRole"
						placeholder="Role (optional)"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div>
					<label for="contactEmail" class="block text-sm font-medium text-foreground">Email</label>
					<input
						id="contactEmail"
						name="contactEmail"
						type="email"
						placeholder="Email (optional)"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
			</fieldset>

			<button
				type="submit"
				disabled={savingClient}
				class="inline-flex items-center gap-2 rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
			>
				{#if savingClient}<Spinner class="h-4 w-4" />{/if}
				Save client
			</button>
		</form>
	</Modal>

	{#await data.streamed}
		<TableSkeleton rows={6} columns={10} />
	{:then clients}
		<div class="overflow-x-auto rounded-brand border border-border bg-background shadow-card">
			<table class="min-w-full divide-y divide-border text-sm">
				<thead
					class="bg-surface-muted text-left text-xs tracking-wide text-muted-foreground uppercase"
				>
					<tr>
						<th class="px-5 py-3 font-medium">Client</th>
						<th class="px-5 py-3 font-medium">Type</th>
						<th class="px-5 py-3 font-medium">Location</th>
						<th class="px-5 py-3 font-medium">Primary contact</th>
						<th class="px-5 py-3 font-medium">Status</th>
						<th class="px-5 py-3 text-right font-medium">Jobs</th>
						<th class="px-5 py-3 text-right font-medium">Quotes</th>
						<th class="px-5 py-3 text-right font-medium">Invoices</th>
						<th class="px-5 py-3 font-medium whitespace-nowrap">Created</th>
						<th class="px-5 py-3 text-right font-medium">Actions</th>
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
							</td>
							<td class="px-5 py-3 text-muted-foreground">
								{CLIENT_TYPE_LABELS[client.clientType]}
							</td>
							<td class="px-5 py-3 text-muted-foreground">
								{[client.area, client.city].filter(Boolean).join(' · ') || '—'}
							</td>
							<td class="px-5 py-3">
								{#if client.contacts[0]}
									<p class="text-foreground">{client.contacts[0].name}</p>
									<p class="text-xs text-muted-foreground">
										{formatTzPhone(client.contacts[0].phone)}
									</p>
								{:else}
									<span class="text-muted-foreground">—</span>
								{/if}
							</td>
							<td class="px-5 py-3">
								<span class={badgeClass(clientStatusTone(client.status))}
									>{CLIENT_STATUS_LABELS[client.status]}</span
								>
							</td>
							<td class="px-5 py-3 text-right text-muted-foreground">{client._count.bookings}</td>
							<td class="px-5 py-3 text-right text-muted-foreground">{client._count.quotes}</td>
							<td class="px-5 py-3 text-right text-muted-foreground">{client._count.invoices}</td>
							<td class="px-5 py-3 whitespace-nowrap text-muted-foreground">
								{formatDate(client.createdAt)}
							</td>
							<td class="px-5 py-3 text-right">
								<div class="flex items-center justify-end gap-3">
									<a
										href="/admin/clients/{client.id}"
										class="text-xs font-medium text-brand-700 transition hover:text-brand-800"
										>View</a
									>
									<button
										type="button"
										class="text-xs text-muted-foreground transition hover:text-danger"
										onclick={() => (pendingDelete = { id: client.id, name: client.displayName })}
									>
										Delete
									</button>
								</div>
							</td>
						</tr>
					{:else}
						<tr><td class="px-5 py-6 text-muted-foreground" colspan="10">No clients yet.</td></tr>
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

<form method="POST" action="?/delete" use:enhance bind:this={deleteForm} class="hidden">
	<input type="hidden" name="id" value={pendingDelete?.id ?? ''} />
</form>

<ConfirmDialog
	open={pendingDelete !== null}
	title="Delete client?"
	message={`Are you sure you want to delete ${pendingDelete?.name ?? 'this client'}? All related bookings, quotes and invoices will also be removed. This cannot be undone.`}
	confirmLabel="Delete client"
	oncancel={() => (pendingDelete = null)}
	onconfirm={() => {
		deleteForm?.requestSubmit();
		pendingDelete = null;
	}}
/>
