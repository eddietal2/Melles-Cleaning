<script lang="ts">
	import { page } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import type { LayoutProps } from './$types';
	import ThemeToggle from '$lib/components/ui/theme-toggle.svelte';
	import Toaster from '$lib/components/ui/toaster.svelte';
	import { locales, setLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages.js';
	import { pageTitle } from '$lib/utils/page-title';

	let { data, children }: LayoutProps = $props();

	const nav = [
		{ href: '/admin', label: m.admin_nav_dashboard },
		{ href: '/admin/website', label: m.admin_nav_website },
		{ href: '/admin/clients', label: m.admin_nav_clients },
		{ href: '/admin/quotes', label: m.admin_nav_quotes },
		{ href: '/admin/bookings', label: m.admin_nav_bookings },
		{ href: '/admin/invoices', label: m.admin_nav_invoices },
		{ href: '/admin/payments', label: m.admin_nav_payments },
		{ href: '/admin/checklists', label: m.admin_nav_checklists },
		{ href: '/admin/feedback', label: m.admin_nav_feedback },
		{ href: '/admin/reports', label: m.admin_nav_reports },
		{ href: '/admin/media', label: m.admin_nav_media },
		{ href: '/admin/settings', label: m.admin_nav_settings }
	];

	/** Highlight the choice immediately, then persist and re-run load functions. */
	let pendingLocale = $state<(typeof locales)[number] | null>(null);
	const activeLocale = $derived(pendingLocale ?? data.locale);

	/** Full language names for the segmented switcher. */
	const localeLabels: Record<(typeof locales)[number], () => string> = {
		en: m.lang_en,
		sw: m.lang_sw
	};

	async function switchLocale(event: MouseEvent, locale: (typeof locales)[number]) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
			return;
		}
		if (locale === activeLocale) {
			return;
		}

		pendingLocale = locale;

		try {
			await setLocale(locale, { reload: false });
			await invalidateAll();
		} finally {
			pendingLocale = null;
		}
	}

	/** The sidebar link for the current route; `/admin` only matches exactly. */
	function isActive(href: string): boolean {
		const pathname = page.url.pathname;
		return href === '/admin'
			? pathname === '/admin'
			: pathname === href || pathname.startsWith(`${href}/`);
	}

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
	<title>{$pageTitle ?? m.admin_title()}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#key data.locale}
	<div class="flex h-dvh overflow-hidden bg-surface">
		<aside
			class="hidden h-full w-60 shrink-0 flex-col border-r border-border bg-background lg:flex"
		>
			<div class="flex h-16 items-center gap-2 border-b border-border px-5">
				<img
					src="/brand/MC_Logo_Dark.png"
					alt="Melles Cleaning Logo"
					class="relative bottom-1 h-8 dark:invert"
				/>
			</div>

			<nav class="flex-1 space-y-1 overflow-y-auto p-3" aria-label={m.admin_aria()}>
				{#each nav as item (item.href)}
					<a
						href={item.href}
						class="block rounded-brand px-3 py-2 text-sm font-medium transition {isActive(item.href)
							? 'bg-brand-50 text-brand-700'
							: 'text-muted-foreground hover:bg-surface-muted hover:text-foreground'}"
						aria-current={isActive(item.href) ? 'page' : undefined}
					>
						{item.label()}
					</a>
				{/each}
			</nav>

			<div class="border-t border-border p-3">
				<a
					href="/"
					class="block rounded-brand px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
					>{m.admin_view_website()}</a
				>
			</div>
		</aside>

		<div class="flex min-w-0 flex-1 flex-col overflow-hidden">
			<header
				class="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-border bg-background px-5"
			>
				<p class="text-sm font-semibold text-foreground lg:hidden">{m.admin_crm()}</p>
				<div class="ml-auto flex items-center gap-3">
					<div
						class="hidden items-center rounded-pill border border-border bg-surface-muted p-0.5 text-xs sm:flex"
						role="group"
						aria-label={m.language()}
					>
						{#each locales as locale (locale)}
							<a
								href="{page.url.pathname}?lang={locale}"
								onclick={(event) => switchLocale(event, locale)}
								class="rounded-pill px-3 py-1 font-medium transition {activeLocale === locale
									? 'bg-brand-600 text-white shadow-sm'
									: 'text-muted-foreground hover:text-foreground'}"
								aria-current={activeLocale === locale ? 'true' : undefined}
							>
								{localeLabels[locale]()}
							</a>
						{/each}
					</div>
					<ThemeToggle />
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
							{m.admin_sign_out()}
						</button>
					</form>
				</div>
			</header>

			<main class="flex-1 overflow-y-auto">
				<div class="p-5 lg:p-8">
					{@render children()}
				</div>
			</main>
		</div>
	</div>
{/key}

<Toaster />
