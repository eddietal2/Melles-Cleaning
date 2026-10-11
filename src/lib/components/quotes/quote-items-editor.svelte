<script lang="ts">
	import { MAX_QUOTE_LINE_ITEMS, type QuoteItemRow } from '$lib/schemas/quote';

	/**
	 * The shared line-item editor used by the New Quote modal and the quote detail
	 * page: an accordion of items with an "Add item" action, capped at `maxItems`.
	 * Each item has a short Title and an optional Description. Inputs keep the
	 * parallel `title`/`cleaningType`/`description`/`quantity`/`unitPriceTzs` names
	 * so they submit as arrays for `readLineItems`.
	 */
	let {
		items = $bindable(),
		maxItems = MAX_QUOTE_LINE_ITEMS,
		sticky = false
	}: {
		items: QuoteItemRow[];
		maxItems?: number;
		/** Pin the header (with the "Add item" button) to the top of the scroll area. */
		sticky?: boolean;
	} = $props();

	const TITLE_MAX = 120;
	const CLEANING_TYPE_MAX = 120;
	const DESCRIPTION_MAX = 500;
	const DESCRIPTION_PLACEHOLDER =
		'e.g. 3-bedroom apartment\n* Kitchen and bathrooms\n* Windows and mirrors';

	/**
	 * Shared field styling. The accordion card uses a muted background, so fields
	 * take a slightly darker fill to stay legible and clearly delineated (proximity).
	 */
	const fieldClass =
		'mt-1 block w-full rounded-brand border-border bg-slate-200 shadow-sm focus:border-brand-600 focus:ring-brand-600 dark:bg-slate-900';

	function addItem() {
		if (items.length >= maxItems) return;
		const nextId = items.reduce((max, item) => Math.max(max, item.id), -1) + 1;
		items.push({
			id: nextId,
			title: '',
			cleaningType: '',
			description: '',
			quantity: 1,
			unitPriceTzs: 0,
			open: true
		});
	}

	function toggleItem(id: number) {
		const item = items.find((candidate) => candidate.id === id);
		if (item) item.open = !item.open;
	}

	function removeItem(id: number) {
		items = items.filter((item) => item.id !== id);
	}

	/** Formats whole-TZS amounts with thousand separators, e.g. 1000 -> "1,000". */
	const amountFormatter = new Intl.NumberFormat('en-US');
	function formatAmount(value: number): string {
		return amountFormatter.format(value);
	}

	/** Keeps the unit-price field comma-formatted while storing the raw number. */
	function handleUnitPriceInput(event: Event, item: QuoteItemRow) {
		const input = event.currentTarget as HTMLInputElement;
		const digits = input.value.replace(/[^0-9]/g, '');
		const value = Math.min(digits ? Number(digits) : 0, 1_000_000_000);
		item.unitPriceTzs = value;
		input.value = formatAmount(value);
	}
</script>

<div class="space-y-3">
	<div
		class="flex items-center justify-between gap-2 {sticky
			? 'sticky top-0 z-10 -mx-5 -mt-5 border-b border-border bg-background px-5 pt-5 pb-3'
			: ''}"
	>
		<h3 class="text-sm font-semibold text-foreground">
			Items
			<span class="ml-1 text-xs font-normal text-muted-foreground">{items.length}/{maxItems}</span>
		</h3>
		<button
			type="button"
			class="rounded-brand border border-brand-500 px-3 py-1.5 text-xs font-medium text-brand-700 transition hover:border-brand-600 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={items.length >= maxItems}
			onclick={addItem}
		>
			Add item
		</button>
	</div>

	{#each items as item, index (item.id)}
		<div class="rounded-brand border border-border bg-surface-muted">
			<div class="flex items-center gap-2 px-3 py-2">
				<button
					type="button"
					class="flex min-w-0 flex-1 items-center gap-2 text-left"
					aria-expanded={item.open}
					onclick={() => toggleItem(item.id)}
				>
					<span class="shrink-0 text-xs font-medium tracking-wide text-muted-foreground uppercase"
						>Item {index + 1}</span
					>
					{#if item.title}
						<span class="truncate text-sm text-foreground">{item.title}</span>
					{:else if item.description}
						<span class="truncate text-sm text-muted-foreground">{item.description}</span>
					{:else}
						<span class="truncate text-sm text-muted-foreground italic">No title</span>
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
						<label for="title-{item.id}" class="block text-sm font-medium text-foreground"
							>Title</label
						>
						<span class="text-xs text-muted-foreground">{item.title.length}/{TITLE_MAX}</span>
					</div>
					<input
						id="title-{item.id}"
						name="title"
						maxlength={TITLE_MAX}
						required={item.open}
						bind:value={item.title}
						placeholder="e.g. Deep clean"
						class={fieldClass}
					/>
				</div>
				<div>
					<div class="flex items-center justify-between">
						<label for="description-{item.id}" class="block text-sm font-medium text-foreground"
							>Description</label
						>
						<span class="text-xs text-muted-foreground"
							>{item.description.length}/{DESCRIPTION_MAX}</span
						>
					</div>
					<textarea
						id="description-{item.id}"
						name="description"
						rows="3"
						maxlength={DESCRIPTION_MAX}
						bind:value={item.description}
						placeholder={DESCRIPTION_PLACEHOLDER}
						class={fieldClass}></textarea>
					<p class="mt-1 text-xs text-muted-foreground">
						Optional. Start a line with
						<code class="rounded bg-surface-muted px-1 font-mono text-foreground">*</code>
						to make it a bullet point, e.g.
						<code class="rounded bg-surface-muted px-1 font-mono text-foreground"
							>* Windows and mirrors</code
						>.
					</p>
				</div>
				<div class="grid gap-3 sm:grid-cols-3">
					<div>
						<label for="cleaningType-{item.id}" class="block text-sm font-medium text-foreground"
							>Type of cleaning</label
						>
						<input
							id="cleaningType-{item.id}"
							name="cleaningType"
							maxlength={CLEANING_TYPE_MAX}
							bind:value={item.cleaningType}
							placeholder="e.g. Deep clean"
							class={fieldClass}
						/>
					</div>
					<div>
						<label for="quantity-{item.id}" class="block text-sm font-medium text-foreground"
							>Qty</label
						>
						<input
							id="quantity-{item.id}"
							name="quantity"
							type="number"
							min="1"
							required={item.open}
							bind:value={item.quantity}
							class={fieldClass}
						/>
					</div>
					<div>
						<label for="unitPrice-{item.id}" class="block text-sm font-medium text-foreground"
							>Unit price (TZS)</label
						>
						<input
							id="unitPrice-{item.id}"
							type="text"
							inputmode="numeric"
							required={item.open}
							value={formatAmount(item.unitPriceTzs)}
							oninput={(event) => handleUnitPriceInput(event, item)}
							class={fieldClass}
						/>
						<input type="hidden" name="unitPriceTzs" value={item.unitPriceTzs} />
					</div>
				</div>
			</div>
		</div>
	{/each}
</div>
