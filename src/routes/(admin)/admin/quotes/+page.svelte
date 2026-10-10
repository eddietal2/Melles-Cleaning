<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import Modal from '$lib/components/ui/modal.svelte';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';
	import { formatTzs } from '$lib/utils/currency';
	import { formatDate } from '$lib/utils/dates';
	import { QUOTE_STATUS_LABELS, badgeClass, quoteStatusTone } from '$lib/utils/status';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});

	/** The new-quote modal is opened from the header action. */
	let showForm = $state(false);

	/** Line-item descriptions are capped to match quoteLineItemSchema. */
	const DESCRIPTION_MAX = 240;

	type QuoteItem = {
		id: number;
		description: string;
		quantity: number;
		unitPriceTzs: number;
		open: boolean;
	};

	/** The line items listed in the "Items" accordion of the new-quote form. */
	let nextItemId = 1;
	let items = $state<QuoteItem[]>([
		{ id: 0, description: '', quantity: 1, unitPriceTzs: 0, open: true }
	]);

	function addItem() {
		items.push({ id: nextItemId++, description: '', quantity: 1, unitPriceTzs: 0, open: true });
	}

	function toggleItem(id: number) {
		const item = items.find((candidate) => candidate.id === id);
		if (item) item.open = !item.open;
	}

	function removeItem(id: number) {
		items = items.filter((item) => item.id !== id);
	}
</script>

<div class="space-y-8">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">Quotes</h1>
			<p class="mt-1 text-sm text-muted-foreground">
				Line-item quotes with server-side totals. Totals are always recalculated on save.
			</p>
		</div>
		<button
			type="button"
			class="inline-flex shrink-0 items-center gap-2 rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-accent-700"
			onclick={() => (showForm = true)}
		>
			Add quote
		</button>
	</div>

	{#await data.streamed}
		<TableSkeleton rows={6} columns={5} />
	{:then payload}
		<Modal open={showForm} title="New quote" size="xl" tall onclose={() => (showForm = false)}>
			{#snippet preview()}
				<!-- Quote document preview will render here. -->
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
						class="rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700"
					>
						Create quote
					</button>
				</div>
			{/snippet}
			<form id="quote-form" method="POST" action="?/create" class="space-y-4" use:enhance>
				<div>
					<label for="clientId" class="block text-sm font-medium text-foreground">Client</label>
					<select
						id="clientId"
						name="clientId"
						required
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						<option value="">Select a client</option>
						{#each payload.clients as client (client.id)}
							<option value={client.id}>{client.displayName}</option>
						{/each}
					</select>
					{#if errors.clientId}<p class="mt-1 text-xs text-danger">{errors.clientId}</p>{/if}
				</div>

				<div class="space-y-3">
					<div class="flex items-center justify-between">
						<h3 class="text-sm font-semibold text-foreground">Items</h3>
						<button
							type="button"
							class="rounded-brand border border-brand-500 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:border-brand-600 hover:bg-brand-50"
							onclick={addItem}
						>
							Add item
						</button>
					</div>

					{#each items as item, index (item.id)}
						<div class="rounded-brand border border-border">
							<div class="flex items-center gap-2 px-3 py-2">
								<button
									type="button"
									class="flex min-w-0 flex-1 items-center gap-2 text-left"
									aria-expanded={item.open}
									onclick={() => toggleItem(item.id)}
								>
									<span
										class="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase"
										>Item {index + 1}</span
									>
									{#if item.description}
										<span class="truncate text-sm text-foreground">{item.description}</span>
									{:else}
										<span class="truncate text-sm text-muted-foreground italic">No description</span
										>
									{/if}
									<svg
										class="ml-auto h-4 w-4 shrink-0 text-muted-foreground transition {item.open
											? 'rotate-180'
											: ''}"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										stroke-width="2"
										stroke-linecap="round"
										stroke-linejoin="round"
										aria-hidden="true"
									>
										<path d="m6 9 6 6 6-6" />
									</svg>
								</button>
								{#if items.length > 1}
									<button
										type="button"
										class="text-xs text-muted-foreground transition hover:text-danger"
										onclick={() => removeItem(item.id)}
									>
										Remove
									</button>
								{/if}
							</div>
							<div class="space-y-3 border-t border-border p-3 {item.open ? '' : 'hidden'}">
								<div>
									<div class="flex items-center justify-between">
										<label
											for="description-{item.id}"
											class="block text-sm font-medium text-foreground">Description</label
										>
										<span class="text-xs text-muted-foreground"
											>{item.description.length}/{DESCRIPTION_MAX}</span
										>
									</div>
									<input
										id="description-{item.id}"
										name="description"
										maxlength={DESCRIPTION_MAX}
										required={item.open}
										bind:value={item.description}
										placeholder="e.g. Deep clean"
										class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
									/>
								</div>
								<div class="grid grid-cols-2 gap-3">
									<div>
										<label
											for="quantity-{item.id}"
											class="block text-sm font-medium text-foreground">Qty</label
										>
										<input
											id="quantity-{item.id}"
											name="quantity"
											type="number"
											min="1"
											required={item.open}
											bind:value={item.quantity}
											class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
										/>
									</div>
									<div>
										<label
											for="unitPrice-{item.id}"
											class="block text-sm font-medium text-foreground">Unit price (TZS)</label
										>
										<input
											id="unitPrice-{item.id}"
											name="unitPriceTzs"
											type="number"
											min="0"
											step="1000"
											required={item.open}
											bind:value={item.unitPriceTzs}
											class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
										/>
									</div>
								</div>
							</div>
						</div>
					{/each}
				</div>
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
						<th class="px-5 py-3 font-medium">Status</th>
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
							<td class="px-5 py-3">
								<span class={badgeClass(quoteStatusTone(quote.status))}
									>{QUOTE_STATUS_LABELS[quote.status]}</span
								>
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
