<script lang="ts">
	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages.js';

	let { data }: PageProps = $props();

	const sections = $derived([
		{
			href: '/admin/website/services',
			title: m.admin_website_services_title(),
			description: m.admin_website_services_desc(),
			count: data.counts.services,
			countLabel: m.admin_website_services_count()
		},
		{
			href: '/admin/website/faq',
			title: m.admin_website_faq_title(),
			description: m.admin_website_faq_desc(),
			count: data.counts.faq,
			countLabel: m.admin_website_faq_count()
		},
		{
			href: '/admin/website/testimonials',
			title: m.admin_website_testimonials_title(),
			description: m.admin_website_testimonials_desc(),
			count: data.counts.testimonials,
			countLabel: m.admin_website_testimonials_count()
		},
		{
			href: '/admin/media',
			title: m.admin_website_media_title(),
			description: m.admin_website_media_desc(),
			count: data.counts.media,
			countLabel: m.admin_website_media_count()
		},
		{
			href: '/admin/settings',
			title: m.admin_website_settings_title(),
			description: m.admin_website_settings_desc(),
			count: null,
			countLabel: ''
		}
	]);
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">
			{m.admin_website_title()}
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">{m.admin_website_intro()}</p>
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
