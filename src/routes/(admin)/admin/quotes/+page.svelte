<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import QuoteItemsEditor from '$lib/components/quotes/quote-items-editor.svelte';
	import QuotePreview from '$lib/components/quotes/quote-preview.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import Modal from '$lib/components/ui/modal.svelte';
	import Spinner from '$lib/components/ui/spinner.svelte';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';
	import type { QuoteItemRow } from '$lib/schemas/quote';
	import { formatTzs } from '$lib/utils/currency';
	import { formatDate } from '$lib/utils/dates';
	import { toast } from '$lib/utils/toast';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});

	/** The new-quote modal is opened from the header action. */
	let showForm = $state(false);

	/** The client chosen in the form, mirrored into the live document preview. */
	let selectedClientId = $state('');

	/** Whether the Terms & Conditions editor modal is open. */
	let showTerms = $state(false);

	/** True while the new quote is being submitted. */
	let savingQuote = $state(false);

	/** The quote awaiting delete confirmation, or null when the dialog is closed. */
	let pendingDelete = $state<{ id: string; number: string } | null>(null);

	/** Submitted programmatically once the owner confirms the deletion. */
	let deleteForm = $state<HTMLFormElement | null>(null);

	/** True while the quote deletion request is in flight. */
	let deletingQuote = $state(false);

	/** Terms shown in the document footer; edited via the Terms & Conditions modal. */
	let terms = $state(
		'All rates quoted are valid for 15 days.\n40% payment should be done in advance.\nThe remaining amount should be paid within 20 days of delivery.'
	);

	/** Maximum length of the free-text terms shown on the document. */
	const TERMS_MAX = 1000;

	/** The line items listed in the "Items" accordion of the new-quote form. */
	let items = $state<QuoteItemRow[]>([
		{ id: 0, description: '', quantity: 1, unitPriceTzs: 0, open: true }
	]);
</script>

<div class="space-y-8">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">Quotes</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Line-item quotes with server-side totals. Totals are always recalculated on save.
			</p>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			<button
				type="button"
				class="rounded-brand border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
				onclick={() => (showTerms = true)}
			>
				Terms & conditions
			</button>
			<button
				type="button"
				class="inline-flex shrink-0 items-center gap-2 rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-accent-700"
				onclick={() => (showForm = true)}
			>
				Add quote
			</button>
		</div>
	</div>

	<Modal open={showTerms} title="Terms & Conditions" onclose={() => (showTerms = false)}>
		<div class="space-y-2">
			<div class="flex items-center justify-between">
				<label for="terms" class="block text-sm font-medium text-foreground"
					>Terms & conditions</label
				>
				<span class="text-xs text-muted-foreground">{terms.length}/{TERMS_MAX}</span>
			</div>
			<textarea
				id="terms"
				bind:value={terms}
				rows="8"
				maxlength={TERMS_MAX}
				placeholder="All rates quoted are valid for 15 days."
				class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
			></textarea>
			<p class="text-xs text-muted-foreground">Shown in the footer of the quote document.</p>
		</div>
		{#snippet footer()}
			<div class="flex justify-end">
				<button
					type="button"
					class="rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700"
					onclick={() => (showTerms = false)}
				>
					Done
				</button>
			</div>
		{/snippet}
	</Modal>

	{#await data.streamed}
		<TableSkeleton rows={6} columns={5} />
	{:then payload}
		<Modal open={showForm} title="New quote" size="xl" tall onclose={() => (showForm = false)}>
			{#snippet preview()}
				{@const selectedClient = payload.clients.find((client) => client.id === selectedClientId)}
				<QuotePreview
					clientName={selectedClient?.displayName ?? 'Select a client'}
					{items}
					{terms}
				/>
			{/snippet}
			{#snippet footer()}
				<div class="flex items-center justify-end gap-3">
					<button
						type="button"
						class="rounded-brand border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
						onclick={() => (showForm = false)}
					>
						Cancel
					</button>
					<button
						type="submit"
						form="quote-form"
						disabled={savingQuote}
						class="inline-flex items-center gap-2 rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-70"
					>
						{#if savingQuote}<Spinner class="h-4 w-4" />{/if}
						Create quote
					</button>
				</div>
			{/snippet}
			<form
				id="quote-form"
				method="POST"
				action="?/create"
				class="space-y-4"
				use:enhance={() => {
					savingQuote = true;
					return async ({ result, update }) => {
						if (result.type === 'redirect') {
							// Close the modal and confirm in the same beat as the redirect.
							showForm = false;
							toast.success('Quote created.');
							await goto(result.location);
							return;
						}
						await update();
						savingQuote = false;
					};
				}}
			>
				<div>
					<label for="clientId" class="block text-sm font-medium text-foreground">Client</label>
					<select
						id="clientId"
						name="clientId"
						required
						bind:value={selectedClientId}
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						<option value="">Select a client</option>
						{#each payload.clients as client (client.id)}
							<option value={client.id}>{client.displayName}</option>
						{/each}
					</select>
					{#if errors.clientId}<p class="mt-1 text-xs text-danger">{errors.clientId}</p>{/if}
				</div>

				<QuoteItemsEditor bind:items />

				<button
					type="button"
					class="flex w-full items-center justify-between gap-3 rounded-brand border border-border px-3 py-2 text-left transition hover:border-brand-500"
					onclick={() => (showTerms = true)}
				>
					<span>
						<span class="block text-sm font-medium text-foreground">Terms & conditions</span>
						<span class="block text-xs text-muted-foreground">Shown in the document footer.</span>
					</span>
					<span class="text-xs font-medium text-brand-700">Edit</span>
				</button>
			</form>
		</Modal>

		<div class="overflow-hidden rounded-brand border border-border bg-background shadow-card">
			<table class="min-w-full divide-y divide-border text-sm">
				<thead
					class="bg-surface-muted text-left text-xs tracking-wide text-muted-foreground uppercase"
				>
					<tr>
						<th class="px-5 py-3 font-medium">Quote</th>
						<th class="px-5 py-3 font-medium">Client</th>
						<th class="px-5 py-3 font-medium">Created</th>
						<th class="px-5 py-3 font-medium">Total</th>
						<th class="px-5 py-3 text-right font-medium">Actions</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each payload.quotes as quote (quote.id)}
						<tr>
							<td class="px-5 py-3">
								<a
									href="/admin/quotes/{quote.id}"
									class="font-medium text-foreground hover:text-brand-700">{quote.quoteNumber}</a
								>
								<p class="text-xs text-muted-foreground">
									{quote._count.lineItems} line item{quote._count.lineItems === 1 ? '' : 's'}
								</p>
							</td>
							<td class="px-5 py-3 text-muted-foreground">{quote.client.displayName}</td>
							<td class="px-5 py-3 text-muted-foreground">{formatDate(quote.createdAt)}</td>
							<td class="px-5 py-3 text-muted-foreground">{formatTzs(quote.totalTzs)}</td>
							<td class="px-5 py-3 text-right">
								<div class="flex items-center justify-end gap-3">
									<a
										href="/admin/quotes/{quote.id}"
										class="text-xs font-medium text-brand-700 transition hover:text-brand-800"
										>View</a
									>
									<a
										href="/admin/quotes/{quote.id}?print=1"
										class="text-xs font-medium text-accent-700 transition hover:text-accent-800"
										>Download</a
									>
									<button
										type="button"
										class="text-xs text-muted-foreground transition hover:text-danger"
										onclick={() => (pendingDelete = { id: quote.id, number: quote.quoteNumber })}
									>
										Delete
									</button>
								</div>
							</td>
						</tr>
					{:else}
						<tr><td class="px-5 py-6 text-muted-foreground" colspan="5">No quotes yet.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:catch}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			Could not load quotes. Please refresh the page.
		</p>
	{/await}
</div>

<form
	method="POST"
	action="?/delete"
	use:enhance={() => {
		deletingQuote = true;
		return async ({ result, update }) => {
			await update();
			deletingQuote = false;
			if (result.type === 'success') {
				pendingDelete = null;
				toast.success('Quote deleted.');
			}
		};
	}}
	bind:this={deleteForm}
	class="hidden"
>
	<input type="hidden" name="id" value={pendingDelete?.id ?? ''} />
</form>

<ConfirmDialog
	open={pendingDelete !== null}
	loading={deletingQuote}
	title="Delete quote?"
	message={`Are you sure you want to delete ${pendingDelete?.number ?? 'this quote'}? This cannot be undone.`}
	confirmLabel="Delete quote"
	oncancel={() => (pendingDelete = null)}
	onconfirm={() => deleteForm?.requestSubmit()}
/>
