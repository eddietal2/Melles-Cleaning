<script lang="ts">
	import QuoteDocument from './quote-document.svelte';
	import type { QuoteItemRow } from '$lib/schemas/quote';

	/** A scrollable, zoomable A4 preview of the quote document. */
	let {
		clientName = 'Select a client',
		items = [],
		discountTzs = 0,
		terms,
		initialZoom = 0.6
	}: {
		clientName?: string;
		items?: QuoteItemRow[];
		discountTzs?: number;
		terms?: string;
		initialZoom?: number;
	} = $props();

	// svelte-ignore state_referenced_locally
	let zoom = $state(initialZoom);

	function zoomBy(delta: number) {
		zoom = Math.min(1.5, Math.max(0.3, Math.round((zoom + delta) * 100) / 100));
	}
</script>

<div class="flex h-full flex-col gap-3">
	<div class="flex items-center justify-between gap-2">
		<span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Preview</span>
		<div class="flex items-center gap-1">
			<button
				type="button"
				class="grid h-7 w-7 place-items-center rounded-brand border border-border text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
				aria-label="Zoom out"
				disabled={zoom <= 0.3}
				onclick={() => zoomBy(-0.1)}
			>
				−
			</button>
			<span class="w-11 text-center text-xs text-muted-foreground tabular-nums"
				>{Math.round(zoom * 100)}%</span
			>
			<button
				type="button"
				class="grid h-7 w-7 place-items-center rounded-brand border border-border text-muted-foreground transition hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
				aria-label="Zoom in"
				disabled={zoom >= 1.5}
				onclick={() => zoomBy(0.1)}
			>
				+
			</button>
		</div>
	</div>
	<div class="min-h-0 flex-1 overflow-auto rounded-brand bg-slate-200 p-4">
		<div class="quote-preview-zoom mx-auto w-fit" style="zoom: {zoom}">
			<QuoteDocument {clientName} {items} {discountTzs} {terms} />
		</div>
	</div>
</div>
