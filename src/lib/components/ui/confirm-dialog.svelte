<script lang="ts">
	import Spinner from '$lib/components/ui/spinner.svelte';

	/** A themed confirmation dialog built on the native <dialog> element for focus trapping. */
	type Tone = 'danger' | 'brand';

	let {
		open = false,
		title = 'Are you sure?',
		message = '',
		confirmLabel = 'Confirm',
		cancelLabel = 'Cancel',
		tone = 'danger',
		loading = false,
		onconfirm,
		oncancel
	}: {
		open?: boolean;
		title?: string;
		message?: string;
		confirmLabel?: string;
		cancelLabel?: string;
		tone?: Tone;
		loading?: boolean;
		onconfirm?: () => void;
		oncancel?: () => void;
	} = $props();

	const confirmTone: Record<Tone, string> = {
		danger: 'bg-danger text-danger-foreground hover:opacity-90',
		brand: 'bg-brand-600 text-white hover:bg-brand-700'
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

	/** Esc dismisses the dialog; treat it as a cancel rather than a silent close. */
	function handleCancel(event: Event) {
		event.preventDefault();
		if (!loading) oncancel?.();
	}
</script>

<dialog
	bind:this={dialog}
	oncancel={handleCancel}
	onclick={(event) => {
		if (event.target === dialog && !loading) oncancel?.();
	}}
	class="m-auto w-[calc(100%-2rem)] max-w-sm rounded-brand border border-border bg-background p-0 text-left shadow-overlay backdrop:bg-foreground/40"
>
	<div class="p-5">
		<h2 class="text-base font-semibold text-foreground">{title}</h2>
		{#if message}
			<p class="mt-2 text-sm text-muted-foreground">{message}</p>
		{/if}
	</div>
	<div class="flex justify-end gap-3 border-t border-border p-4">
		<button
			type="button"
			disabled={loading}
			class="rounded-brand border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted disabled:cursor-not-allowed disabled:opacity-60"
			onclick={() => oncancel?.()}
		>
			{cancelLabel}
		</button>
		<button
			type="button"
			disabled={loading}
			class="inline-flex items-center justify-center gap-2 rounded-brand px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 {confirmTone[
				tone
			]}"
			onclick={() => onconfirm?.()}
		>
			{#if loading}<Spinner class="h-4 w-4" />{/if}
			{confirmLabel}
		</button>
	</div>
</dialog>
