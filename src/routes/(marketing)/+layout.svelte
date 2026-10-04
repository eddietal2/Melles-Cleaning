<script lang="ts">
	import { invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';
	import { locales, setLocale } from '$lib/paraglide/runtime';
	import * as m from '$lib/paraglide/messages.js';
	import WhatsAppIcon from '$lib/components/icons/whatsapp-icon.svelte';
	import { jsonLdScript } from '$lib/utils/jsonld';

	let { data, children }: LayoutProps = $props();

	/**
	 * Persist the locale in the Paraglide cookie and re-run load functions so the
	 * server renders in the new language. The layout is keyed on `data.locale`
	 * (below) so message calls re-evaluate — Paraglide's locale isn't a Svelte
	 * signal, so without a remount the stale text would persist. The plain link
	 * still works without JavaScript via the `?lang` handler in hooks.
	 */
	let pendingLocale = $state<(typeof locales)[number] | null>(null);
	const activeLocale = $derived(pendingLocale ?? data.locale);

	/** Full language names for the segmented switcher. */
	const localeLabels: Record<(typeof locales)[number], () => string> = {
		en: m.lang_en,
		sw: m.lang_sw
	};

	/** The nav link for the current route, matching nested paths too. */
	function isActive(href: string): boolean {
		const pathname = page.url.pathname;
		return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
	}

	async function switchLocale(event: MouseEvent, locale: (typeof locales)[number]) {
		if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
			return;
		}
		if (locale === activeLocale) {
			return;
		}

		event.preventDefault();
		// Highlight the choice immediately, then persist and re-render.
		pendingLocale = locale;

		try {
			await setLocale(locale, { reload: false });
			await invalidateAll();
		} finally {
			pendingLocale = null;
		}
	}

	const nav = [
		{ href: '/', label: m.nav_home },
		{ href: '/services', label: m.nav_services },
		{ href: '/gallery', label: m.nav_gallery },
		{ href: '/about', label: m.nav_about },
		{ href: '/contact', label: m.nav_contact }
	];

	const settings = $derived(data.settings);
	const whatsappDigits = $derived(settings.whatsapp.replace(/[^0-9]/g, ''));
	const whatsappHref = $derived(whatsappDigits ? `https://wa.me/${whatsappDigits}` : null);

	const localBusiness = $derived({
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		name: settings.businessName,
		description: 'Professional residential and commercial cleaning services in Dodoma, Tanzania.',
		areaServed: settings.city,
		address: {
			'@type': 'PostalAddress',
			addressLocality: settings.city,
			addressCountry: 'TZ'
		},
		openingHours: settings.hours,
		...(settings.phone ? { telephone: settings.phone } : {}),
		...(settings.email ? { email: settings.email } : {})
	});

	const jsonLd = $derived(jsonLdScript(localBusiness));
</script>

<svelte:head>
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- JSON-LD is built from trusted, server-owned data -->
	{@html jsonLd}
	<!-- eslint-disable-next-line svelte/no-at-html-tags -- static analytics snippet from a public env var -->
	{@html data.analytics}
</svelte:head>

{#key data.locale}
	<div class="flex min-h-dvh flex-col">
		<header class="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
			<div class="container-page flex h-16 items-center justify-between gap-4">
				<a href="/" class="flex items-center gap-2">
					<img
						src="/brand/MC_Logo_Dark.png"
						alt="Melles Cleaning Logo"
						class="relative bottom-1 h-8"
					/>
					<span class="text-base font-semibold tracking-tight text-foreground"
						>{settings.businessName}</span
					>
				</a>

				<nav class="hidden items-center gap-6 md:flex" aria-label={m.nav_main()}>
					{#each nav as item (item.href)}
						<a
							href={item.href}
							class="relative text-sm font-medium transition {isActive(item.href)
								? 'text-brand-700 after:absolute after:inset-x-0 after:-bottom-1.5 after:h-0.5 after:rounded-pill after:bg-brand-600'
								: 'text-muted-foreground hover:text-brand-700'}"
							aria-current={isActive(item.href) ? 'page' : undefined}
						>
							{item.label()}
						</a>
					{/each}
				</nav>

				<div class="flex items-center gap-3">
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

					{#if whatsappHref}
						<a
							href={whatsappHref}
							aria-label={m.cta_whatsapp()}
							class="hidden items-center gap-2 rounded-brand bg-whatsapp px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-whatsapp-dark sm:inline-flex"
							rel="noopener noreferrer"
							target="_blank"
						>
							<WhatsAppIcon class="h-4 w-4 shrink-0" />
							<span class="hidden lg:inline">{m.cta_whatsapp()}</span>
						</a>
					{/if}
					<a
						href="/book"
						class="rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-accent-700"
						>{m.cta_quote()}</a
					>
				</div>
			</div>
		</header>

		<main class="flex-1">{@render children()}</main>

		<footer class="border-t border-border bg-surface-inverse text-slate-300">
			<div class="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
				<div>
					<p class="text-base font-semibold text-white">{settings.businessName}</p>
					<p class="mt-2 text-sm leading-relaxed">
						{m.footer_tagline({ city: settings.city, country: settings.country })}
					</p>
				</div>
				<div>
					<p class="text-sm font-semibold text-white">{m.footer_services()}</p>
					<ul class="mt-3 space-y-2 text-sm">
						<li>
							<a class="hover:text-white" href="/services">{m.footer_service_residential()}</a>
						</li>
						<li><a class="hover:text-white" href="/services">{m.footer_service_deep()}</a></li>
						<li><a class="hover:text-white" href="/services">{m.footer_service_airbnb()}</a></li>
						<li><a class="hover:text-white" href="/services">{m.footer_service_office()}</a></li>
					</ul>
				</div>
				<div>
					<p class="text-sm font-semibold text-white">{m.footer_company()}</p>
					<ul class="mt-3 space-y-2 text-sm">
						<li><a class="hover:text-white" href="/gallery">{m.nav_gallery()}</a></li>
						<li><a class="hover:text-white" href="/about">{m.nav_about()}</a></li>
						<li><a class="hover:text-white" href="/contact">{m.nav_contact()}</a></li>
					</ul>
				</div>
				<div>
					<p class="text-sm font-semibold text-white">{m.footer_get_in_touch()}</p>
					<ul class="mt-3 space-y-2 text-sm">
						{#if settings.phone}
							<li><a class="hover:text-white" href="tel:{settings.phone}">{settings.phone}</a></li>
						{/if}
						{#if whatsappHref}
							<li>
								<a
									class="inline-flex items-center gap-1.5 hover:text-white"
									href={whatsappHref}
									rel="noopener noreferrer"
									target="_blank"
								>
									<WhatsAppIcon class="h-3.5 w-3.5 shrink-0 text-whatsapp" />
									{m.cta_whatsapp_us()}
								</a>
							</li>
						{/if}
						{#if settings.email}
							<li>
								<a class="hover:text-white" href="mailto:{settings.email}">{settings.email}</a>
							</li>
						{/if}
						<li>{settings.address}</li>
						<li>{settings.hours}</li>
					</ul>
				</div>
			</div>
			<div class="border-t border-white/10 py-5">
				<p class="container-page text-xs text-slate-400">
					{m.footer_rights({
						year: String(new Date().getFullYear()),
						business: settings.businessName
					})}
				</p>
			</div>
		</footer>
	</div>
{/key}
