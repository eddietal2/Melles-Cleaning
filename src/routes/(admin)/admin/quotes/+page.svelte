<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatDate } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import { QUOTE_STATUS_LABELS, badgeClass, quoteStatusTone } from '$lib/utils/status';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Quotes</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Line-item quotes with server-side totals. Totals are always recalculated on save.
		</p>
	</div>

	<details class="rounded-brand border border-border bg-background shadow-card">
		<summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-foreground">New quote</summary>
		<form method="POST" action="?/create" class="space-y-4 border-t border-border p-5" use:enhance>
			<div class="grid gap-4 sm:grid-cols-3">
				<div class="sm:col-span-2">
					<label for="clientId" class="block text-sm font-medium text-foreground">Client</label>
					<select id="clientId" name="clientId" required class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">
						<option value="">Select a client</option>
						{#each data.clients as client (client.id)}
							<option value={client.id}>{client.displayName}</option>
						{/each}
					</select>
					{#if errors.clientId}<p class="mt-1 text-xs text-danger">{errors.clientId}</p>{/if}
				</div>
				<div>
					<label for="validUntil" class="block text-sm font-medium text-foreground">Valid until</label>
					<input id="validUntil" name="validUntil" type="date" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
				</div>
			</div>

			<div class="rounded-brand border border-border">
				<div class="grid grid-cols-12 gap-2 border-b border-border bg-surface-muted px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
					<span class="col-span-6">Description</span>
					<span class="col-span-2">Qty</span>
					<span class="col-span-4">Unit price (TZS)</span>
				</div>
				<div class="grid grid-cols-12 gap-2 p-3">
					<input name="description" placeholder="e.g. Deep clean" class="col-span-6 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
					<input name="quantity" type="number" min="1" value="1" class="col-span-2 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
					<input name="unitPriceTzs" type="number" min="0" step="1000" value="0" class="col-span-4 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
				</div>
			</div>

			<button type="submit" class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
				Create quote
			</button>
		</form>
	</details>

	<div class="overflow-hidden rounded-brand border border-border bg-background shadow-card">
		<table class="min-w-full divide-y divide-border text-sm">
			<thead class="bg-surface-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
				<tr>
					<th class="px-5 py-3 font-medium">Quote</th>
					<th class="px-5 py-3 font-medium">Client</th>
					<th class="px-5 py-3 font-medium">Created</th>
					<th class="px-5 py-3 font-medium">Total</th>
					<th class="px-5 py-3 font-medium">Status</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-border">
				{#each data.quotes as quote (quote.id)}
					<tr>
						<td class="px-5 py-3">
							<a href="/admin/quotes/{quote.id}" class="font-medium text-foreground hover:text-brand-700">{quote.quoteNumber}</a>
							<p class="text-xs text-muted-foreground">{quote._count.lineItems} line item{quote._count.lineItems === 1 ? '' : 's'}</p>
						</td>
						<td class="px-5 py-3 text-muted-foreground">{quote.client.displayName}</td>
						<td class="px-5 py-3 text-muted-foreground">{formatDate(quote.createdAt)}</td>
						<td class="px-5 py-3 text-muted-foreground">{formatTzs(quote.totalTzs)}</td>
						<td class="px-5 py-3">
							<span class={badgeClass(quoteStatusTone(quote.status))}>{QUOTE_STATUS_LABELS[quote.status]}</span>
						</td>
					</tr>
				{:else}
					<tr><td class="px-5 py-6 text-muted-foreground" colspan="5">No quotes yet.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
