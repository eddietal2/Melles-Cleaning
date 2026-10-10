<script lang="ts">
	import { onMount } from 'svelte';
	import { syncThemeFromDocument, theme, toggleTheme } from '$lib/utils/theme';

	// The inline script in app.html applies the saved theme before paint; mirror it.
	onMount(syncThemeFromDocument);

	const label = $derived($theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
</script>

<button
	type="button"
	class="grid h-9 w-9 place-items-center rounded-brand border border-border text-muted-foreground transition hover:text-foreground"
	aria-label={label}
	title={label}
	onclick={toggleTheme}
>
	{#if $theme === 'dark'}
		<svg
			class="h-4 w-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<circle cx="12" cy="12" r="4" />
			<path
				d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
			/>
		</svg>
	{:else}
		<svg
			class="h-4 w-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	{/if}
</button>
