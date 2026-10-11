<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import Modal from '$lib/components/ui/modal.svelte';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';
	import type { QuoteDocumentLang, QuoteTerms } from '$lib/schemas/quote';
	import { formatTzs } from '$lib/utils/currency';
	import { formatDate } from '$lib/utils/dates';
	import { toast } from '$lib/utils/toast';

	let { data }: PageProps = $props();

	/** Default quote terms, edited here and reused as the starting text for a new quote. */
	// svelte-ignore state_referenced_locally
	let terms = $state<QuoteTerms>({ ...data.defaultTerms });

	/** Which language's terms the modal is currently editing. */
	let termsLang = $state<QuoteDocumentLang>('en');

	/** Language options for the terms editor. */
	const termsLanguages: { value: QuoteDocumentLang; label: string }[] = [
		{ value: 'en', label: 'English' },
		{ value: 'sw', label: 'Kiswahili' }
	];

	/** Maximum length of the free-text terms shown on the document. */
	const TERMS_MAX = 1000;

	/** Whether the Terms & Conditions editor is open. */
	let showTerms = $state(false);

	/** True while the terms are being saved. */
	let savingTerms = $state(false);

	/** The quote awaiting delete confirmation, or null when the dialog is closed. */
	let pendingDelete = $state<{ id: string; number: string } | null>(null);

	/** Submitted programmatically once the owner confirms the deletion. */
	let deleteForm = $state<HTMLFormElement | null>(null);

	/** True while the quote deletion request is in flight. */
	let deletingQuote = $state(false);
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
			<a
				href="/admin/quotes/new"
				class="inline-flex shrink-0 items-center gap-2 rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-accent-700"
			>
				Add quote
			</a>
		</div>
	</div>

	<Modal open={showTerms} title="Terms & Conditions" onclose={() => (showTerms = false)}>
		<form
			method="POST"
			action="?/terms"
			class="space-y-3"
			use:enhance={() => {
				savingTerms = true;
				return async ({ result, update }) => {
					await update();
					savingTerms = false;
					if (result.type === 'success') {
						showTerms = false;
						toast.success('Default terms saved.');
					}
				};
			}}
		>
			<div
				class="flex w-fit items-center rounded-pill border border-border bg-surface-muted p-0.5 text-xs"
				role="group"
				aria-label="Terms language"
			>
				{#each termsLanguages as option (option.value)}
					<button
						type="button"
						class="rounded-pill px-3 py-1 font-medium transition {termsLang === option.value
							? 'bg-brand-600 text-white shadow-sm'
							: 'text-muted-foreground hover:text-foreground'}"
						aria-pressed={termsLang === option.value}
						onclick={() => (termsLang = option.value)}
					>
						{option.label}
					</button>
				{/each}
			</div>
			<div class="flex items-center justify-between">
				<label for="terms" class="block text-sm font-medium text-foreground">
					Default terms ({termsLang === 'en' ? 'English' : 'Kiswahili'})
				</label>
				<span class="text-xs text-muted-foreground">{terms[termsLang].length}/{TERMS_MAX}</span>
			</div>
			<textarea
				id="terms"
				bind:value={terms[termsLang]}
				rows="8"
				maxlength={TERMS_MAX}
				placeholder="All rates quoted are valid for 15 days."
				class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
			></textarea>
			<input type="hidden" name="termsEn" value={terms.en} />
			<input type="hidden" name="termsSw" value={terms.sw} />
			<p class="text-xs text-muted-foreground">
				Used as the starting terms on every new quote. Each language keeps its own text.
			</p>
			<div class="flex justify-end">
				<button
					type="submit"
					disabled={savingTerms}
					class="rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-70"
				>
					Save terms
				</button>
			</div>
		</form>
	</Modal>

	{#await data.streamed}
		<TableSkeleton rows={6} columns={5} />
	{:then payload}
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
