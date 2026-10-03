<script lang="ts">
	import type { PageProps } from './$types';
	import { formatTzsRange } from '../../../lib/utils/currency';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Cleaning Services in Dodoma · Melles Cleaning Services</title>
	<meta
		name="description"
		content="Residential cleaning, deep cleans, Airbnb turnovers and office cleaning packages in Dodoma, Tanzania."
	/>
</svelte:head>

<section class="border-b border-border bg-surface">
	<div class="container-page py-14 lg:py-20">
		<p class="text-sm font-semibold tracking-wide text-brand-700 uppercase">Our services</p>
		<h1 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
			Structured cleaning packages for every space
		</h1>
		<p class="mt-4 max-w-2xl text-lg text-muted-foreground">
			Every visit follows a documented checklist and is signed off by a supervisor. Choose a package
			below or request a custom quote.
		</p>
	</div>
</section>

<section class="container-page py-12 lg:py-16">
	<div class="grid gap-6 md:grid-cols-2">
		{#each data.services as service (service.id)}
			<article
				class="flex h-full flex-col rounded-brand border border-border bg-background p-6 shadow-card"
			>
				<h2 class="text-lg font-semibold text-foreground">{service.name}</h2>
				{#if service.shortDescription}
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">
						{service.shortDescription}
					</p>
				{/if}

				{#if service.pricingPackages.length}
					<ul class="mt-5 space-y-2 border-t border-border pt-5 text-sm">
						{#each service.pricingPackages as pkg (pkg.id)}
							<li class="flex items-baseline justify-between gap-4">
								<span class="text-muted-foreground">{pkg.name}</span>
								<span class="font-semibold whitespace-nowrap text-brand-700">
									{formatTzsRange(pkg.priceMinTzs, pkg.priceMaxTzs)}
									{#if pkg.unit}<span class="font-normal text-muted-foreground">
											· {pkg.unit}</span
										>{/if}
								</span>
							</li>
						{/each}
					</ul>
				{/if}

				<div class="mt-6 flex flex-wrap gap-3 pt-1">
					<a
						href="/services/{service.slug}"
						class="rounded-brand border border-border-strong px-4 py-2 text-sm font-semibold text-foreground transition hover:border-brand-500 hover:text-brand-700"
						>Details</a
					>
					<a
						href="/book?service={service.id}"
						class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
						>Book this</a
					>
				</div>
			</article>
		{:else}
			<p class="text-muted-foreground">
				Services are being updated. Please check back shortly or
				<a class="text-brand-700 underline" href="/contact">contact us</a>.
			</p>
		{/each}
	</div>
</section>
