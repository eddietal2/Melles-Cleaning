<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Gallery · Melles Cleaning Services</title>
	<meta name="description" content="Before-and-after photos of our cleaning work across Dodoma." />
</svelte:head>

<section class="border-b border-border bg-surface">
	<div class="container-page py-14 lg:py-20">
		<p class="text-sm font-semibold tracking-wide text-brand-700 uppercase">Our work</p>
		<h1 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Gallery</h1>
		<p class="mt-4 max-w-2xl text-lg text-muted-foreground">
			A look at recent jobs across Dodoma — residential deep cleans, office resets and short-stay
			turnovers.
		</p>
	</div>
</section>

<section class="container-page py-12 lg:py-16">
	{#if data.items.length}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.items as item (item.id)}
				<figure
					class="overflow-hidden rounded-brand border border-border bg-background shadow-card"
				>
					<img
						src={item.media.url}
						alt={item.media.altText ?? item.caption ?? 'Cleaning work by Melles Cleaning Services'}
						loading="lazy"
						class="aspect-4/3 w-full object-cover"
					/>
					{#if item.caption}
						<figcaption class="px-4 py-3 text-sm text-muted-foreground">{item.caption}</figcaption>
					{/if}
				</figure>
			{/each}
		</div>
	{:else}
		<div
			class="rounded-brand border border-dashed border-border-strong bg-surface p-10 text-center"
		>
			<p class="text-sm text-muted-foreground">
				Photos are on the way. In the meantime,
				<a class="text-brand-700 underline" href="/contact">get in touch</a> and we will share recent
				work directly.
			</p>
		</div>
	{/if}
</section>
