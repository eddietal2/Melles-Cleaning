<script lang="ts">
	import './layout.css';
	import { navigating } from '$app/state';

	let { children } = $props();

	// A thin indeterminate bar while a client-side navigation is in flight, so slow
	// server loads still feel responsive.
	const busy = $derived(navigating.type !== null);
</script>

<svelte:head>
	<link rel="icon" type="image/png" href="/favicon.png" />
	<link rel="apple-touch-icon" href="/favicon.png" />
</svelte:head>

{#if busy}
	<div class="fixed inset-x-0 top-0 z-[100] h-0.5 bg-brand-100" role="presentation">
		<div class="nav-progress h-full bg-brand-600"></div>
	</div>
{/if}

{@render children()}
