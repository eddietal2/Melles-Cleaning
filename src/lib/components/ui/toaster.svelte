<script lang="ts">
	import { dismissToast, toasts, type ToastTone } from '$lib/utils/toast';

	const toneClasses: Record<ToastTone, string> = {
		success: 'bg-success text-success-foreground',
		error: 'bg-danger text-danger-foreground',
		info: 'bg-info text-info-foreground'
	};
</script>

<div class="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-end gap-2 p-4">
	{#each $toasts as item (item.id)}
		<div
			class="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-brand px-4 py-3 shadow-overlay {toneClasses[
				item.tone
			]}"
			role="status"
		>
			<p class="flex-1 text-sm font-medium">{item.message}</p>
			<button
				type="button"
				class="text-current opacity-80 transition hover:opacity-100"
				aria-label="Dismiss notification"
				onclick={() => dismissToast(item.id)}
			>
				✕
			</button>
		</div>
	{/each}
</div>
