<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const sections = $derived([
		{
			href: '/admin/website/services',
			title: 'Services & pricing',
			description: 'Edit service pages and the TZS pricing packages shown on the website.',
			count: data.counts.services,
			countLabel: 'services'
		},
		{
			href: '/admin/website/faq',
			title: 'FAQ',
			description: 'Questions and answers displayed on the site.',
			count: data.counts.faq,
			countLabel: 'items'
		},
		{
			href: '/admin/website/testimonials',
			title: 'Testimonials',
			description: 'Client reviews shown on the homepage.',
			count: data.counts.testimonials,
			countLabel: 'reviews'
		},
		{
			href: '/admin/media',
			title: 'Media library',
			description: 'Upload photos and manage the public gallery.',
			count: data.counts.media,
			countLabel: 'images'
		},
		{
			href: '/admin/settings',
			title: 'Business settings',
			description: 'Contact details, hours and promotion values.',
			count: null,
			countLabel: ''
		}
	]);
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Website content</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Update everything visitors see without touching code. Changes appear on the live site
			immediately.
		</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
		{#each sections as section (section.href)}
			<a
				href={section.href}
				class="group rounded-brand border border-border bg-background p-5 shadow-card transition hover:border-brand-400"
			>
				<div class="flex items-start justify-between gap-3">
					<p class="text-base font-semibold text-foreground group-hover:text-brand-700">
						{section.title}
					</p>
					{#if section.count !== null}
						<span
							class="rounded-pill bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
							>{section.count} {section.countLabel}</span
						>
					{/if}
				</div>
				<p class="mt-2 text-sm text-muted-foreground">{section.description}</p>
			</a>
		{/each}
	</div>
</div>
