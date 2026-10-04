<script lang="ts">
	import type { PageProps } from './$types';
	import SliderGallery from '$lib/components/marketing/slider-gallery.svelte';
	import { formatTzsRange } from '$lib/utils/currency';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Melles Cleaning Services · Professional Cleaning in Dodoma</title>
	<meta
		name="description"
		content="Professional residential and commercial cleaning in Dodoma, Tanzania. Weekly home maintenance, deep cleans, Airbnb turnovers and office resets."
	/>
</svelte:head>

<section class="border-b border-border bg-surface">
	<div class="container-page grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
		<div>
			<p class="text-sm font-semibold tracking-wide text-brand-700 uppercase">
				Dodoma · Residential & Commercial
			</p>
			<h1 class="mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
				Punctual, thorough, trustworthy cleaning
			</h1>
			<p class="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
				Melles Cleaning Services helps busy households, offices and short-stay hosts across Dodoma
				keep their spaces pristine — with vetted staff, transparent pricing and a checklist-backed
				guarantee.
			</p>
			<div class="mt-8 flex flex-wrap gap-3">
				<a
					href="/contact"
					class="rounded-brand bg-brand-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
					>Request a quote</a
				>
				<a
					href="/services"
					class="rounded-brand border border-border-strong px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand-500 hover:text-brand-700"
					>Browse services</a
				>
			</div>
		</div>
	</div>
</section>

<section class="container-page py-16 lg:py-20">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h2 class="text-2xl font-semibold tracking-tight text-foreground">Services & pricing</h2>
			<p class="mt-2 max-w-2xl text-muted-foreground">
				Menu prices in Tanzanian Shillings. Custom quotes are available for post-construction and
				event cleanup.
			</p>
		</div>
		<a href="/services" class="text-sm font-medium text-brand-700 hover:underline">View all services →</a>
	</div>

	<div class="mt-8 grid gap-6 lg:grid-cols-2">
		{#each data.services as service (service.id)}
			<article class="flex flex-col rounded-brand border border-border bg-background p-6 shadow-card">
				<h3 class="text-lg font-semibold text-foreground">{service.name}</h3>
				{#if service.shortDescription}
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
						{service.shortDescription}
					</p>
				{/if}

				{#if service.pricingPackages.length > 0}
					<ul class="mt-5 space-y-4 border-t border-border pt-5">
						{#each service.pricingPackages as pkg (pkg.id)}
							<li class="flex items-baseline justify-between gap-4">
								<div>
									<p class="text-sm font-medium text-foreground">{pkg.name}</p>
									{#if pkg.scope}
										<p class="text-xs text-muted-foreground">{pkg.scope}</p>
									{/if}
								</div>
								<p class="text-right text-sm font-semibold text-brand-700">
									{formatTzsRange(pkg.priceMinTzs, pkg.priceMaxTzs)}
									{#if pkg.unit}
										<span class="block text-xs font-normal text-muted-foreground">{pkg.unit}</span>
									{/if}
								</p>
							</li>
						{/each}
					</ul>
				{/if}

				<a
					href="/services/{service.slug}"
					class="mt-5 inline-block text-sm font-medium text-brand-700 hover:underline"
					>Learn more →</a
				>
			</article>
		{:else}
			<p class="rounded-brand border border-border bg-surface-muted p-6 text-sm text-muted-foreground">
				Our service catalogue is being updated. <a class="text-brand-700 underline" href="/contact"
					>Ask us for a quote</a
				>.
			</p>
		{/each}
	</div>
</section>

<SliderGallery title="Recent work" subtitle="A look at the homes and offices we care for." />

<section class="border-y border-border bg-surface">
	<div class="container-page py-16 lg:py-20">
		<div class="rounded-brand bg-brand-700 px-8 py-12 text-center text-white sm:px-12 sm:py-16">
			<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">First office clean at 20% off</h2>
			<p class="mx-auto mt-3 max-w-2xl text-brand-50">
				Newly opening offices get a discounted first clean. Refer a recurring client and receive
				10,000&nbsp;TZS off your next service.
			</p>
			<div class="mt-8 flex flex-wrap justify-center gap-3">
				<a
					href="/book"
					class="rounded-brand bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
					>Book your first clean</a
				>
			</div>
		</div>
	</div>
</section>
