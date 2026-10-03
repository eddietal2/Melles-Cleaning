<script lang="ts">
	import type { PageProps } from './$types';
	import { formatTzsRange } from '$lib/utils/currency';

	let { data }: PageProps = $props();

	const paragraphs = $derived(
		(data.service.bodyMarkdown ?? '')
			.split('\n')
			.map((line) => line.trim())
			.filter(Boolean)
	);
</script>

<svelte:head>
	<title>{data.service.name} · Melles Cleaning Services</title>
	<meta
		name="description"
		content={data.service.shortDescription ?? `Professional ${data.service.name} in Dodoma.`}
	/>
</svelte:head>

<article class="container-page py-12 lg:py-16">
	<nav class="text-sm text-muted-foreground" aria-label="Breadcrumb">
		<a class="hover:text-brand-700" href="/services">Services</a>
		<span aria-hidden="true"> / </span>
		<span class="text-foreground">{data.service.name}</span>
	</nav>

	<div class="mt-6 grid gap-10 lg:grid-cols-3">
		<div class="lg:col-span-2">
			<h1 class="text-3xl font-bold tracking-tight text-foreground">{data.service.name}</h1>
			{#if data.service.shortDescription}
				<p class="mt-3 text-lg text-muted-foreground">{data.service.shortDescription}</p>
			{/if}

			<div class="mt-6 space-y-4 text-base leading-relaxed text-foreground">
				{#each paragraphs as paragraph (paragraph)}
					<p>{paragraph}</p>
				{/each}
			</div>

			{#if data.faq.length}
				<section class="mt-12">
					<h2 class="text-xl font-semibold text-foreground">Frequently asked questions</h2>
					<div class="mt-4 divide-y divide-border rounded-brand border border-border bg-background">
						{#each data.faq as item (item.id)}
							<details class="group px-5 py-4">
								<summary
									class="cursor-pointer list-none text-sm font-medium text-foreground marker:hidden"
								>
									{item.question}
								</summary>
								<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
							</details>
						{/each}
					</div>
				</section>
			{/if}
		</div>

		<aside class="lg:col-span-1">
			<div class="rounded-brand border border-border bg-surface p-6 shadow-card">
				<p class="text-sm font-semibold text-foreground">Pricing</p>
				<ul class="mt-4 space-y-4">
					{#each data.service.pricingPackages as pkg (pkg.id)}
						<li>
							<p class="text-sm font-medium text-foreground">{pkg.name}</p>
							{#if pkg.scope}
								<p class="text-xs text-muted-foreground">{pkg.scope}</p>
							{/if}
							<p class="mt-1 text-sm font-semibold text-brand-700">
								{formatTzsRange(pkg.priceMinTzs, pkg.priceMaxTzs)}
								{#if pkg.unit}<span class="font-normal text-muted-foreground">
										· {pkg.unit}</span
									>{/if}
							</p>
						</li>
					{:else}
						<li class="text-sm text-muted-foreground">Custom quote on request.</li>
					{/each}
				</ul>

				<a
					href="/book?service={data.service.id}"
					class="mt-6 block rounded-brand bg-brand-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-brand-700"
					>Request this service</a
				>
			</div>
		</aside>
	</div>
</article>
