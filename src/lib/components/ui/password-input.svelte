<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props {
		id: string;
		name: string;
		label: string;
		autocomplete?: HTMLInputAttributes['autocomplete'];
		required?: boolean;
		error?: string;
		placeholder?: string;
	}

	let {
		id,
		name,
		label,
		autocomplete = 'current-password',
		required = false,
		error,
		placeholder
	}: Props = $props();

	// The value lives in component state so it survives re-rendering the input when
	// the `type` attribute changes (switching type otherwise clears the DOM value).
	let visible = $state(false);
	let text = $state('');
</script>

<div>
	<label for={id} class="block text-sm font-medium text-foreground">{label}</label>
	<div class="relative mt-1">
		{#key visible}
			<input
				{id}
				{name}
				{placeholder}
				type={visible ? 'text' : 'password'}
				{autocomplete}
				{required}
				bind:value={text}
				class="block w-full rounded-brand border-border pr-10 shadow-sm focus:border-brand-600 focus:ring-brand-600"
			/>
		{/key}
		<button
			type="button"
			onclick={() => (visible = !visible)}
			class="absolute inset-y-0 right-0 grid w-10 place-items-center rounded-r-brand text-muted-foreground transition hover:text-foreground"
			aria-label={visible ? 'Hide password' : 'Show password'}
			aria-pressed={visible}
		>
			{#if visible}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-4 w-4"
					aria-hidden="true"
				>
					<path d="m3 3 18 18" />
					<path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
					<path d="M9.4 5.6A9.8 9.8 0 0 1 12 5c5 0 9 4.5 9 7a11.8 11.8 0 0 1-2.4 3.3" />
					<path d="M6.1 6.1C3.9 7.6 3 9.7 3 12c0 2.5 4 7 9 7a9.7 9.7 0 0 0 3.5-.6" />
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="1.8"
					stroke-linecap="round"
					stroke-linejoin="round"
					class="h-4 w-4"
					aria-hidden="true"
				>
					<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
					<circle cx="12" cy="12" r="3" />
				</svg>
			{/if}
		</button>
	</div>
	{#if error}
		<p class="mt-1 text-xs text-danger">{error}</p>
	{/if}
</div>
