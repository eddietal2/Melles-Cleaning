<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const nav = [
		{ href: '/portal', label: 'Overview' },
		{ href: '/portal/bookings', label: 'Bookings' },
		{ href: '/portal/invoices', label: 'Invoices' },
		{ href: '/portal/feedback', label: 'Feedback' }
	];
</script>

<svelte:head>
	<title>Client portal · Melles Cleaning Services</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-dvh flex-col bg-surface">
	<header class="border-b border-border bg-background">
		<div class="container-page flex h-16 items-center justify-between gap-4">
			<a href="/portal" class="flex items-center gap-2">
				<span
					class="grid h-9 w-9 place-items-center rounded-brand bg-brand-600 font-bold text-white"
					aria-hidden="true">M</span
				>
				<span class="text-base font-semibold text-foreground">Client portal</span>
			</a>
			<div class="flex items-center gap-3">
				<span class="hidden text-sm text-muted-foreground sm:inline">{data.client.displayName}</span
				>
				<form method="POST" action="/logout">
					<button
						type="submit"
						class="rounded-brand border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-danger hover:text-danger"
					>
						Sign out
					</button>
				</form>
			</div>
		</div>
		{#if data.isPreview}
			<div
				class="border-t border-accent-200 bg-accent-50 px-4 py-2 text-center text-xs text-accent-900"
			>
				Previewing as {data.client.displayName}.
				<a class="underline" href="/admin/clients/{data.client.id}">Open in CRM</a>
			</div>
		{/if}
	</header>

	<div class="container-page flex flex-1 flex-col gap-8 py-8">
		<nav class="flex flex-wrap gap-2" aria-label="Portal">
			{#each nav as item (item.href)}
				<a
					href={item.href}
					class="rounded-pill border border-border bg-background px-3 py-1.5 text-sm font-medium text-muted-foreground transition hover:border-brand-500 hover:text-brand-700"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<main class="flex-1">{@render children()}</main>
	</div>
</div>
