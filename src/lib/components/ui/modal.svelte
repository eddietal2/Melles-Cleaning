<script lang="ts">
	import type { Snippet } from 'svelte';

	type Size = 'sm' | 'lg' | 'xl';

	/**
	 * A themed modal built on the native <dialog> element for focus trapping.
	 * Content is passed via the default snippet; an optional `preview` snippet
	 * renders a second pane on the right, giving a two-column layout at `lg` and
	 * up, and an optional `footer` snippet pins a bar to the bottom of the main
	 * column. Setting `tall` stretches the dialog to near full height, with the
	 * panes scrolling independently. Closing (button, Esc or backdrop) calls `onclose`.
	 */
	let {
		open = false,
		title = '',
		size = 'sm',
		tall = false,
		previewOnly = false,
		onclose,
		children,
		preview,
		footer,
		headerActions
	}: {
		open?: boolean;
		title?: string;
		size?: Size;
		tall?: boolean;
		/** Expand the `preview` pane to fill the dialog, hiding the main column. */
		previewOnly?: boolean;
		onclose?: () => void;
		children?: Snippet;
		preview?: Snippet;
		footer?: Snippet;
		/** Optional controls rendered in the header, before the close button. */
		headerActions?: Snippet;
	} = $props();

	const widths: Record<Size, string> = {
		sm: 'max-w-lg',
		lg: 'max-w-3xl',
		xl: 'max-w-6xl'
	};

	let dialog = $state<HTMLDialogElement | null>(null);

	$effect(() => {
		if (!dialog) return;
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	});

	/** Esc dismisses the dialog; notify the parent rather than closing silently. */
	function handleCancel(event: Event) {
		event.preventDefault();
		onclose?.();
	}
</script>

<dialog
	bind:this={dialog}
	oncancel={handleCancel}
	onclick={(event) => {
		if (event.target === dialog) onclose?.();
	}}
	class="m-auto hidden max-h-[90vh] w-[calc(100%-2rem)] flex-col rounded-brand border border-border bg-background p-0 text-left shadow-overlay backdrop:bg-foreground/40 open:flex {widths[
		size
	]} {tall ? 'h-[88vh]' : ''}"
>
	<header class="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
		<h2 class="text-base font-semibold text-foreground">{title}</h2>
		<div class="flex items-center gap-3">
			{@render headerActions?.()}
			<button
				type="button"
				class="text-muted-foreground transition hover:text-foreground"
				aria-label="Close dialog"
				onclick={() => onclose?.()}
			>
				✕
			</button>
		</div>
	</header>
	{#if preview}
		{#if previewOnly}
			<div class="min-h-0 flex-1 overflow-hidden bg-surface-muted p-5">
				{@render preview()}
			</div>
		{:else}
			<div class="grid min-h-0 flex-1 lg:grid-cols-2">
				<div class="flex min-h-0 flex-col">
					<div class="min-h-0 flex-1 overflow-y-auto p-5">
						{@render children?.()}
					</div>
					{#if footer}
						<div class="shrink-0 border-t border-border p-5">
							{@render footer()}
						</div>
					{/if}
				</div>
				<div
					class="min-h-0 overflow-hidden border-t border-border bg-surface-muted p-5 lg:border-t-0 lg:border-l"
				>
					{@render preview()}
				</div>
			</div>
		{/if}
	{:else}
		<div class="flex min-h-0 flex-1 flex-col">
			<div class="min-h-0 flex-1 overflow-y-auto p-5">
				{@render children?.()}
			</div>
			{#if footer}
				<div class="shrink-0 border-t border-border p-5">
					{@render footer()}
				</div>
			{/if}
		</div>
	{/if}
</dialog>
