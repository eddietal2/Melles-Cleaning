<script lang="ts">
	import type { PageProps } from './$types';
	import { formatTzsRange } from '$lib/utils/currency';

	let { data }: PageProps = $props();

	interface Group {
		serviceId: string;
		serviceName: string;
		packages: typeof data.packages;
	}

	const groups = $derived(
		data.packages.reduce<Group[]>((acc, pkg) => {
			let group = acc.find((entry) => entry.serviceId === pkg.serviceId);
			if (!group) {
				group = { serviceId: pkg.serviceId, serviceName: pkg.service.name, packages: [] };
				acc.push(group);
			}
			group.packages.push(pkg);
			return acc;
		}, [])
	);
</script>

<svelte:head>
	<title>Pricing · Melles Cleaning Services</title>
	<meta
		name="description"
		content="Transparent cleaning prices in Tanzanian Shillings for homes, offices and short-stay rentals in Dodoma."
	/>
</svelte:head>

<section class="border-b border-border bg-surface">
	<div class="container-page py-14 lg:py-20">
		<p class="text-sm font-semibold tracking-wide text-brand-700 uppercase">Pricing</p>
		<h1 class="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
			Transparent, tiered pricing in TZS
		</h1>
		<p class="mt-4 max-w-2xl text-lg text-muted-foreground">
			Fixed-rate menu pricing with no hidden costs. Heavy-duty or specialised work —
			post-construction, event cleanup, large facilities — is quoted individually.
		</p>
	</div>
</section>

<section class="container-page py-12 lg:py-16">
	<div class="space-y-10">
		{#each groups as group (group.serviceId)}
			<div>
				<h2 class="text-lg font-semibold text-foreground">{group.serviceName}</h2>
				<div class="mt-4 overflow-hidden rounded-brand border border-border bg-background">
					<table class="w-full text-left text-sm">
						<thead class="bg-surface-muted text-xs tracking-wide text-muted-foreground uppercase">
							<tr>
								<th class="px-5 py-3 font-medium">Package</th>
								<th class="px-5 py-3 font-medium">Scope</th>
								<th class="px-5 py-3 font-medium">Price</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-border">
							{#each group.packages as pkg (pkg.id)}
								<tr>
									<td class="px-5 py-4 font-medium text-foreground">{pkg.name}</td>
									<td class="px-5 py-4 text-muted-foreground">{pkg.scope ?? '—'}</td>
									<td class="px-5 py-4 font-semibold whitespace-nowrap text-brand-700">
										{formatTzsRange(pkg.priceMinTzs, pkg.priceMaxTzs)}
										{#if pkg.unit}<span class="block text-xs font-normal text-muted-foreground"
												>{pkg.unit}</span
											>{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>
		{:else}
			<p class="text-muted-foreground">
				Pricing is being finalised.
				<a class="text-brand-700 underline" href="/contact">Ask us for a quote</a>.
			</p>
		{/each}
	</div>

	<div class="mt-12 rounded-brand bg-brand-700 px-8 py-10 text-center text-white">
		<h2 class="text-xl font-semibold">
			First office clean at {data.settings.firstCleanDiscountPercent}% off
		</h2>
		<p class="mx-auto mt-2 max-w-xl text-sm text-brand-50">
			Refer a recurring client and receive {data.settings.referralCreditTzs.toLocaleString('en-TZ')} TZS
			off your next service.
		</p>
		<a
			href="/book"
			class="mt-6 inline-block rounded-brand bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
			>Request a quote</a
		>
	</div>
</section>
