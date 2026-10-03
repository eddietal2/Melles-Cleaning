<script lang="ts">
	import { PUBLIC_BUSINESS_PHONE, PUBLIC_WHATSAPP_NUMBER } from '$app/env/public';

	let { children } = $props();

	const nav = [
		{ href: '/', label: 'Home' },
		{ href: '/services', label: 'Services' },
		{ href: '/pricing', label: 'Pricing' },
		{ href: '/gallery', label: 'Gallery' },
		{ href: '/contact', label: 'Contact' }
	];

	const whatsappDigits = PUBLIC_WHATSAPP_NUMBER.replace(/[^0-9]/g, '');
	const whatsappHref = whatsappDigits ? `https://wa.me/${whatsappDigits}` : null;
</script>

<div class="flex min-h-dvh flex-col">
	<header class="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
		<div class="container-page flex h-16 items-center justify-between gap-4">
			<a href="/" class="flex items-center gap-2">
				<span
					class="grid h-9 w-9 place-items-center rounded-brand bg-brand-600 font-bold text-white"
					aria-hidden="true">M</span
				>
				<span class="text-base font-semibold tracking-tight text-foreground">Melles Cleaning</span>
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
					href="/contact"
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
				<p class="text-base font-semibold text-white">Melles Cleaning Services</p>
				<p class="mt-2 text-sm leading-relaxed">
					Professional residential and commercial cleaning across Dodoma, Tanzania.
				</p>
			</div>
			<div>
				<p class="text-sm font-semibold text-white">Services</p>
				<ul class="mt-3 space-y-2 text-sm">
					<li>Standard residential cleaning</li>
					<li>Deep clean and move-in/move-out</li>
					<li>Airbnb and guest house turnovers</li>
					<li>Small office and commercial resets</li>
				</ul>
			</div>
			<div>
				<p class="text-sm font-semibold text-white">Company</p>
				<ul class="mt-3 space-y-2 text-sm">
					<li><a class="hover:text-white" href="/pricing">Pricing</a></li>
					<li><a class="hover:text-white" href="/gallery">Gallery</a></li>
					<li><a class="hover:text-white" href="/contact">Contact</a></li>
				</ul>
			</div>
			<div>
				<p class="text-sm font-semibold text-white">Get in touch</p>
				<ul class="mt-3 space-y-2 text-sm">
					{#if PUBLIC_BUSINESS_PHONE}
						<li>
							<a class="hover:text-white" href="tel:{PUBLIC_BUSINESS_PHONE}"
								>{PUBLIC_BUSINESS_PHONE}</a
							>
						</li>
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
					<li>Dodoma, Tanzania</li>
				</ul>
			</div>
		</div>
		<div class="border-t border-white/10 py-5">
			<p class="container-page text-xs text-slate-400">
				© {new Date().getFullYear()} Melles Cleaning Services. All rights reserved.
			</p>
		</div>
	</footer>
</div>
