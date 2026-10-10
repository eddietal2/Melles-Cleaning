<script lang="ts">
	import { formatTzs } from '$lib/utils/currency';
	import { formatDate } from '$lib/utils/dates';

	export type QuoteDocumentItem = {
		description: string;
		quantity: number;
		unitPriceTzs: number;
	};

	/**
	 * A live, print-ready quote document styled after the "Color Rounded" template.
	 * It mirrors the new-quote form so it can later be exported or emailed as a PDF.
	 * Colours are intentionally fixed (always a light "paper") so it renders the same
	 * regardless of the app theme.
	 */
	let {
		issuedAt = new Date(),
		clientName = 'Select a client',
		items = [],
		discountTzs = 0,
		terms = 'All rates quoted are valid for 15 days.\n40% payment should be done in advance.\nThe remaining amount should be paid within 20 days of delivery.'
	}: {
		issuedAt?: Date | string;
		clientName?: string;
		items?: QuoteDocumentItem[];
		discountTzs?: number;
		terms?: string;
	} = $props();

	const subtotal = $derived(
		items.reduce((sum, item) => sum + item.quantity * item.unitPriceTzs, 0)
	);
	const total = $derived(Math.max(0, subtotal - discountTzs));
</script>

<div
	class="quote-document mx-auto min-h-[297mm] w-[210mm] rounded-2xl bg-white p-10 text-slate-900 shadow-xl"
>
	<div class="flex items-start justify-between gap-4">
		<div class="flex items-center gap-2.5">
			<img src="/brand/MC_Logo_Dark.png" alt="" class="h-9" />
			<div>
				<p class="text-sm font-semibold">Melles Cleaning Services</p>
				<p class="text-xs text-slate-500">Dodoma, Tanzania</p>
			</div>
		</div>
		<div class="text-right">
			<p class="text-2xl font-bold tracking-tight text-brand-600">QUOTE</p>
		</div>
	</div>

	<div
		class="mt-5 flex items-center justify-between gap-4 rounded-xl bg-brand-600 px-4 py-3 text-white"
	>
		<div>
			<p class="text-[0.65rem] font-semibold tracking-wider uppercase opacity-80">Billed to</p>
			<p class="text-sm font-semibold">{clientName}</p>
		</div>
		<div class="text-right">
			<p class="text-[0.65rem] font-semibold tracking-wider uppercase opacity-80">Date</p>
			<p class="text-sm font-semibold">{formatDate(issuedAt)}</p>
		</div>
	</div>

	<table class="mt-5 w-full border-collapse text-sm">
		<thead>
			<tr class="text-left text-[0.65rem] tracking-wider text-slate-500 uppercase">
				<th class="pb-2 font-semibold">Item description</th>
				<th class="pb-2 text-center font-semibold">Qty</th>
				<th class="pb-2 text-right font-semibold">Price</th>
				<th class="pb-2 text-right font-semibold">Total</th>
			</tr>
		</thead>
		<tbody>
			{#each items as item, index (index)}
				<tr class="border-t border-slate-100">
					<td class="py-2 pr-2 align-top">{item.description || 'Untitled item'}</td>
					<td class="py-2 text-center align-top text-slate-500">{item.quantity}</td>
					<td class="py-2 text-right align-top text-slate-500">{formatTzs(item.unitPriceTzs)}</td>
					<td class="py-2 text-right align-top font-medium">
						{formatTzs(item.quantity * item.unitPriceTzs)}
					</td>
				</tr>
			{:else}
				<tr class="border-t border-slate-100">
					<td class="py-3 text-slate-400" colspan="4">No items yet.</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="mt-5 flex justify-end">
		<div class="w-full max-w-[220px] space-y-2">
			<div class="flex items-center justify-between text-sm text-slate-500">
				<span>Sub total</span>
				<span>{formatTzs(subtotal)}</span>
			</div>
			{#if discountTzs > 0}
				<div class="flex items-center justify-between text-sm text-slate-500">
					<span>Discount</span>
					<span>− {formatTzs(discountTzs)}</span>
				</div>
			{/if}
			<div class="flex items-center justify-between rounded-xl bg-slate-900 px-3 py-2 text-white">
				<span class="text-xs font-semibold tracking-wider uppercase">Grand total</span>
				<span class="text-sm font-bold">{formatTzs(total)}</span>
			</div>
		</div>
	</div>

	{#if terms.trim()}
		<div class="mt-5 border-t border-slate-200 pt-3 text-[0.7rem] text-slate-500">
			<p class="font-semibold text-slate-700">Terms and conditions</p>
			{#each terms.split('\n').filter((line) => line.trim()) as line, index (index)}
				<p class="mt-1">{line}</p>
			{/each}
		</div>
	{/if}
</div>
