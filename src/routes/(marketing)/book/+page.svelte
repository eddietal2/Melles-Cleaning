<script lang="ts">
	import type { PageProps } from './$types';
	import LeadForm from '$lib/components/marketing/lead-form.svelte';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
	const success = $derived(Boolean((form as { success?: boolean } | null)?.success));

	const values = $derived({
		serviceInterestId: data.preselectedServiceId,
		...((form as { values?: Record<string, string> } | null)?.values ?? {})
	});

	const steps = [
		'Tell us about your space and preferred date',
		'We confirm availability and send a fixed quote',
		'A vetted, uniformed team arrives on schedule',
		'Walkthrough and sign-off against the 20-point checklist'
	];
</script>

<svelte:head>
	<title>Book a Clean · Melles Cleaning Services</title>
	<meta
		name="description"
		content="Request a cleaning booking in Dodoma. Tell us your preferred date and receive a fixed quote in TZS."
	/>
</svelte:head>

<section class="border-b border-border bg-surface">
	<div class="container-page py-12 lg:py-16">
		<p class="text-sm font-semibold tracking-wide text-brand-700 uppercase">Booking</p>
		<h1 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
			Request a clean
		</h1>
		<p class="mt-4 max-w-2xl text-lg text-muted-foreground">
			Fill in the form and we will confirm your booking by phone or WhatsApp.
		</p>
	</div>
</section>

<section class="container-page py-12 lg:py-16">
	<div class="grid gap-10 lg:grid-cols-3">
		<div class="lg:col-span-2">
			<LeadForm
				services={data.services}
				{errors}
				{values}
				{success}
				showSchedule
				submitLabel="Request booking"
			/>
		</div>

		<aside class="rounded-brand border border-border bg-surface p-6">
			<p class="text-sm font-semibold text-foreground">How it works</p>
			<ol class="mt-4 space-y-4 text-sm">
				{#each steps as step, index (step)}
					<li class="flex gap-3">
						<span
							class="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-semibold text-brand-800"
							aria-hidden="true">{index + 1}</span
						>
						<span class="text-muted-foreground">{step}</span>
					</li>
				{/each}
			</ol>
		</aside>
	</div>
</section>
