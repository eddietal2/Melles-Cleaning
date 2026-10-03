<script lang="ts">
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const nav = [
		{ href: '/admin', label: 'Dashboard' },
		{ href: '/admin/clients', label: 'Clients' },
		{ href: '/admin/bookings', label: 'Bookings' },
		{ href: '/admin/quotes', label: 'Quotes' },
		{ href: '/admin/invoices', label: 'Invoices' },
		{ href: '/admin/payments', label: 'Payments' },
		{ href: '/admin/checklists', label: 'Checklists' },
		{ href: '/admin/feedback', label: 'Feedback' },
		{ href: '/admin/reports', label: 'Reports' },
		{ href: '/admin/content', label: 'Content' },
		{ href: '/admin/media', label: 'Media' },
		{ href: '/admin/settings', label: 'Settings' }
	];

	const initials = $derived(
		data.user.name
			.split(' ')
			.map((part) => part[0])
			.join('')
			.slice(0, 2)
			.toUpperCase()
	);
</script>

<svelte:head>
	<title>Admin · Melles Cleaning Services</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-dvh bg-surface">
	<aside class="hidden w-60 shrink-0 flex-col border-r border-border bg-background lg:flex">
		<div class="flex h-16 items-center gap-2 border-b border-border px-5">
			<span
				class="grid h-8 w-8 place-items-center rounded-brand bg-brand-600 text-sm font-bold text-white"
				aria-hidden="true">M</span
			>
			<span class="text-sm font-semibold text-foreground">Melles CRM</span>
		</div>

		<nav class="flex-1 space-y-1 p-3" aria-label="Admin">
			{#each nav as item (item.href)}
				<a
					href={item.href}
					class="block rounded-brand px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-surface-muted hover:text-foreground"
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<div class="border-t border-border p-3">
			<a
				href="/"
				class="block rounded-brand px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
				>View website</a
			>
		</div>
	</aside>

	<div class="flex min-w-0 flex-1 flex-col">
		<header
			class="flex h-16 items-center justify-between gap-4 border-b border-border bg-background px-5"
		>
			<p class="text-sm font-semibold text-foreground lg:hidden">Melles CRM</p>
			<div class="ml-auto flex items-center gap-3">
				<div class="text-right">
					<p class="text-sm font-medium text-foreground">{data.user.name}</p>
					<p class="text-xs text-muted-foreground">{data.user.role}</p>
				</div>
				<span
					class="grid h-9 w-9 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800"
					aria-hidden="true">{initials}</span
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
		</header>

		<main class="flex-1 p-5 lg:p-8">
			{@render children()}
		</main>
	</div>
</div>
