<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const pillars = [
		{
			title: 'Hybrid service packages',
			body: 'Structured residential and small-office packages — the reliability of an agency at a price informal cleaners cannot match.'
		},
		{
			title: 'Professional image and safety first',
			body: 'Branded uniforms, background-checked staff, transparent checklists and written service agreements on every job.'
		},
		{
			title: 'Quality control and follow-up',
			body: 'Every visit is measured against a 20-point checklist, signed off by a supervisor and followed up within 24 hours.'
		},
		{
			title: 'Transparent, tiered pricing',
			body: 'Fixed-rate menu pricing for standard jobs, with custom quotes for heavy-duty or specialised cleaning.'
		}
	];

	const sections = [
		{
			title: 'Living & general areas',
			detail: '7 checkpoints including touchpoint sanitisation and floor care'
		},
		{ title: 'Kitchen', detail: '5 checkpoints including degreasing and appliance exteriors' },
		{
			title: 'Bathrooms & restrooms',
			detail: '5 checkpoints including full disinfection and descaling'
		},
		{
			title: 'Touchpoints & finishing',
			detail: '3 checkpoints ending in a supervisor walkthrough with you'
		}
	];
</script>

<svelte:head>
	<title>About · Melles Cleaning Services</title>
	<meta
		name="description"
		content="Melles Cleaning Services is a professional residential and commercial cleaning company based in Dodoma, Tanzania."
	/>
</svelte:head>

<section class="border-b border-border bg-surface">
	<div class="container-page py-14 lg:py-20">
		<p class="text-sm font-semibold tracking-wide text-brand-700 uppercase">About us</p>
		<h1 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
			A cleaning company built on trust
		</h1>
		<p class="mt-4 max-w-3xl text-lg text-muted-foreground">
			Melles Cleaning Services provides punctual, thorough and trustworthy cleaning to busy
			households, commercial spaces and rental properties across {data.settings.city}. Our mission
			is simple: help clients maintain pristine spaces effortlessly.
		</p>
	</div>
</section>

<section class="container-page py-12 lg:py-16">
	<h2 class="text-2xl font-semibold tracking-tight text-foreground">How we are different</h2>
	<div class="mt-8 grid gap-6 sm:grid-cols-2">
		{#each pillars as pillar (pillar.title)}
			<article class="rounded-brand border border-border bg-background p-6 shadow-card">
				<h3 class="text-base font-semibold text-foreground">{pillar.title}</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
			</article>
		{/each}
	</div>
</section>

<section class="border-y border-border bg-surface">
	<div class="container-page py-12 lg:py-16">
		<h2 class="text-2xl font-semibold tracking-tight text-foreground">
			The 20-point quality checklist
		</h2>
		<p class="mt-3 max-w-2xl text-muted-foreground">
			Every job follows the same documented standard, and a supervisor reviews it with you before we
			leave.
		</p>
		<div class="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			{#each sections as section, index (section.title)}
				<div class="rounded-brand border border-border bg-background p-5">
					<p class="text-xs font-semibold text-brand-700">0{index + 1}</p>
					<p class="mt-2 text-sm font-semibold text-foreground">{section.title}</p>
					<p class="mt-1 text-xs leading-relaxed text-muted-foreground">{section.detail}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="container-page py-14 lg:py-20">
	<div class="rounded-brand bg-brand-700 px-8 py-12 text-center text-white sm:px-12">
		<h2 class="text-2xl font-semibold tracking-tight">Ready for a cleaner space?</h2>
		<p class="mx-auto mt-3 max-w-xl text-brand-50">
			Tell us about your home or office and we will send a clear, fixed quote in Tanzanian
			Shillings.
		</p>
		<a
			href="/book"
			class="mt-8 inline-block rounded-brand bg-white px-6 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
			>Request a quote</a
		>
	</div>
</section>
