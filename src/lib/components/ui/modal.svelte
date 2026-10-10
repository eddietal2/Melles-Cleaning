<script lang="ts">
	import type { Snippet } from 'svelte';

	/**
	 * A themed modal built on the native <dialog> element for focus trapping.
	 * Content is passed via the default snippet; closing (button, Esc or backdrop)
	 * calls `onclose`, so the parent owns the `open` state.
	 */
	let {
		open = false,
		title = '',
		onclose,
		children
	}: {
		open?: boolean;
		title?: string;
		onclose?: () => void;
		children?: Snippet;
	} = $props();

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
	class="m-auto w-[calc(100%-2rem)] max-w-lg rounded-brand border border-border bg-background p-0 text-left shadow-overlay backdrop:bg-foreground/40"
>
	<header class="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
		<h2 class="text-base font-semibold text-foreground">{title}</h2>
		<button
			type="button"
			class="text-muted-foreground transition hover:text-foreground"
			aria-label="Close dialog"
			onclick={() => onclose?.()}
		>
			✕
		</button>
	</header>
	<div class="p-5">
		{@render children?.()}
	</div>
</dialog>
