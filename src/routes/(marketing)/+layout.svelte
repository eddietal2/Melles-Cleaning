<script lang="ts">
	import type { LayoutProps } from './$types';
	import { jsonLdScript } from '$lib/utils/jsonld';

	let { data, children }: LayoutProps = $props();

	const nav = [
		{ href: '/', label: 'Home' },
		{ href: '/services', label: 'Services' },
		{ href: '/pricing', label: 'Pricing' },
		{ href: '/gallery', label: 'Gallery' },
		{ href: '/about', label: 'About' },
		{ href: '/contact', label: 'Contact' }
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
</svelte:head>

<div class="flex min-h-dvh flex-col">
	<header class="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
		<div class="container-page flex h-16 items-center justify-between gap-4">
			<a href="/" class="flex items-center gap-2">
				<span
					class="grid h-9 w-9 place-items-center rounded-brand bg-brand-600 font-bold text-white"
					aria-hidden="true">M</span
				>
				<span class="text-base font-semibold tracking-tight text-foreground"
					>{settings.businessName}</span
				>
			</a>

			<nav class="hidden items-center gap-6 md:flex" aria-label="Main">
				{#each nav as item (item.href)}
					<a
						href={item.href}
						class="text-sm font-medium text-muted-foreground transition hover:text-brand-700"
					>
						{item.label}
					</a>
				{/each}
			</nav>

			<div class="flex items-center gap-2">
				{#if whatsappHref}
					<a
						href={whatsappHref}
						class="hidden rounded-brand border border-border px-3 py-2 text-sm font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700 sm:inline-block"
						rel="noopener noreferrer"
						target="_blank">WhatsApp</a
					>
				{/if}
				<a
					href="/book"
					class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
					>Get a quote</a
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
					Professional residential and commercial cleaning across {settings.city},
					{settings.country}.
				</p>
			</div>
			<div>
				<p class="text-sm font-semibold text-white">Services</p>
				<ul class="mt-3 space-y-2 text-sm">
					<li><a class="hover:text-white" href="/services">Standard residential</a></li>
					<li><a class="hover:text-white" href="/services">Deep cleans</a></li>
					<li><a class="hover:text-white" href="/services">Airbnb turnovers</a></li>
					<li><a class="hover:text-white" href="/services">Office cleaning</a></li>
				</ul>
			</div>
			<div>
				<p class="text-sm font-semibold text-white">Company</p>
				<ul class="mt-3 space-y-2 text-sm">
					<li><a class="hover:text-white" href="/pricing">Pricing</a></li>
					<li><a class="hover:text-white" href="/gallery">Gallery</a></li>
					<li><a class="hover:text-white" href="/about">About</a></li>
					<li><a class="hover:text-white" href="/contact">Contact</a></li>
				</ul>
			</div>
			<div>
				<p class="text-sm font-semibold text-white">Get in touch</p>
				<ul class="mt-3 space-y-2 text-sm">
					{#if settings.phone}
						<li><a class="hover:text-white" href="tel:{settings.phone}">{settings.phone}</a></li>
					{/if}
					{#if whatsappHref}
						<li>
							<a
								class="hover:text-white"
								href={whatsappHref}
								rel="noopener noreferrer"
								target="_blank">WhatsApp us</a
							>
						</li>
					{/if}
					{#if settings.email}
						<li><a class="hover:text-white" href="mailto:{settings.email}">{settings.email}</a></li>
					{/if}
					<li>{settings.address}</li>
					<li>{settings.hours}</li>
				</ul>
			</div>
		</div>
		<div class="border-t border-white/10 py-5">
			<p class="container-page text-xs text-slate-400">
				© {new Date().getFullYear()}
				{settings.businessName}. All rights reserved.
			</p>
		</div>
	</footer>
</div>
