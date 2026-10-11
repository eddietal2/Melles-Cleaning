<script lang="ts">
	import QuoteDocument from './quote-document.svelte';
	import type { QuoteDocumentLang, QuoteItemRow, QuoteTerms } from '$lib/schemas/quote';

	/**
	 * A scrollable, zoomable A4 preview of the quote document. `lang` is bindable
	 * so a parent (e.g. the download menu) can render the document in a chosen
	 * language before capturing it.
	 */
	let {
		clientName = '',
		items = [],
		discountTzs = 0,
		terms,
		initialZoom = 0.6,
		lang = $bindable<QuoteDocumentLang>('en'),
		zoom = $bindable(initialZoom)
	}: {
		clientName?: string;
		items?: QuoteItemRow[];
		discountTzs?: number;
		terms?: QuoteTerms;
		initialZoom?: number;
		lang?: QuoteDocumentLang;
		zoom?: number;
	} = $props();

	/** Segmented control options; `en` is the default. */
	const languages: { value: QuoteDocumentLang; label: string; aria: string }[] = [
		{ value: 'en', label: 'English', aria: 'Show document in English' },
		{ value: 'sw', label: 'Swahili', aria: 'Show document in Swahili' }
	];

	function zoomBy(delta: number) {
		zoom = Math.min(1.5, Math.max(0.3, Math.round((zoom + delta) * 100) / 100));
	}
</script>

<div class="flex h-full flex-col gap-3">
	<div class="flex flex-wrap items-center justify-between gap-2">
		<div class="flex items-center gap-2">
			<span class="text-xs font-semibold tracking-wide text-muted-foreground uppercase"
				>Preview</span
			>
			<div
				class="flex items-center rounded-pill border border-border bg-surface-muted p-0.5 text-xs"
				role="group"
				aria-label="Document language"
			>
				{#each languages as option (option.value)}
					<button
						type="button"
						class="rounded-pill px-2.5 py-0.5 font-medium transition {lang === option.value
							? 'bg-brand-600 text-white shadow-sm'
							: 'text-muted-foreground hover:text-foreground'}"
						aria-pressed={lang === option.value}
						title={option.aria}
						onclick={() => (lang = option.value)}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>
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
			<QuoteDocument {clientName} {items} {discountTzs} {terms} {lang} />
		</div>
	</div>
</div>
