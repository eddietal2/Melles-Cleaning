<script lang="ts">
	import type { PageProps } from './$types';
	import LeadForm from '$lib/components/marketing/lead-form.svelte';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
	const values = $derived((form as { values?: Record<string, string> } | null)?.values ?? {});
	const success = $derived(Boolean((form as { success?: boolean } | null)?.success));

	const whatsappDigits = $derived(data.settings.whatsapp.replace(/[^0-9]/g, ''));
</script>

<svelte:head>
	<title>Contact · Melles Cleaning Services</title>
	<meta
		name="description"
		content="Contact Melles Cleaning Services in Dodoma for a free cleaning quote. Call, WhatsApp or send us a message."
	/>
</svelte:head>

<section class="border-b border-border bg-surface">
	<div class="container-page py-12 lg:py-16">
		<p class="text-sm font-semibold tracking-wide text-brand-700 uppercase">Contact</p>
		<h1 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
			Let's talk about your space
		</h1>
		<p class="mt-4 max-w-2xl text-lg text-muted-foreground">
			Send us a message and we will get back to you with a fixed quote in Tanzanian Shillings.
		</p>
	</div>
</section>

<section class="container-page py-12 lg:py-16">
	<div class="grid gap-10 lg:grid-cols-3">
		<div class="lg:col-span-2">
			<LeadForm services={data.services} {errors} {values} {success} submitLabel="Send message" />
		</div>

		<aside class="space-y-6">
			<div class="rounded-brand border border-border bg-surface p-6">
				<p class="text-sm font-semibold text-foreground">Reach us directly</p>
				<ul class="mt-4 space-y-3 text-sm">
					{#if data.settings.phone}
						<li>
							<span class="block text-xs text-muted-foreground">Phone</span>
							<a class="font-medium text-brand-700" href="tel:{data.settings.phone}"
								>{data.settings.phone}</a
							>
						</li>
					{/if}
					{#if whatsappDigits}
						<li>
							<span class="block text-xs text-muted-foreground">WhatsApp</span>
							<a
								class="font-medium text-brand-700"
								href="https://wa.me/{whatsappDigits}"
								rel="noopener noreferrer"
								target="_blank">Chat with us</a
							>
						</li>
					{/if}
					{#if data.settings.email}
						<li>
							<span class="block text-xs text-muted-foreground">Email</span>
							<a class="font-medium text-brand-700" href="mailto:{data.settings.email}"
								>{data.settings.email}</a
							>
						</li>
					{/if}
					<li>
						<span class="block text-xs text-muted-foreground">Area</span>
						<span class="font-medium text-foreground">{data.settings.address}</span>
					</li>
					<li>
						<span class="block text-xs text-muted-foreground">Hours</span>
						<span class="font-medium text-foreground">{data.settings.hours}</span>
					</li>
				</ul>
			</div>

			<div class="rounded-brand border border-brand-200 bg-brand-50 p-6">
				<p class="text-sm font-semibold text-brand-900">Prefer a full quote?</p>
				<p class="mt-1 text-sm text-brand-800">
					Use the booking form to tell us your preferred date and we will confirm availability.
				</p>
				<a
					href="/book"
					class="mt-4 inline-block rounded-brand bg-brand-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-800"
					>Request a booking</a
				>
			</div>
		</aside>
	</div>
</section>
