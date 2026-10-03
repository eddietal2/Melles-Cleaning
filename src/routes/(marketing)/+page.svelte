<script lang="ts">
	const services = [
		{
			title: 'Standard Residential Cleaning',
			body: 'Dusting, sweeping, mopping, bathroom sanitisation, kitchen deep cleaning and routine bed-making.'
		},
		{
			title: 'Deep Clean & Move-In / Move-Out',
			body: 'Intensive scrub downs for tenants, property owners and agencies preparing a unit for occupancy.'
		},
		{
			title: 'Airbnb & Guest House Turnovers',
			body: 'Fast-turnaround cleaning, linen replacement and amenity restocking for short-term rental hosts.'
		},
		{
			title: 'Small Office & Commercial Resets',
			body: 'Evening or early-morning maintenance cleans for offices, agencies and professional spaces.'
		}
	];

	const pricing = [
		{ name: 'Standard House Clean', scope: '2–3 bedroom home', price: '40,000 – 60,000 TZS' },
		{
			name: 'Deep / Move-In Clean',
			scope: 'Appliances, baseboards, sills',
			price: '60,000 – 120,000 TZS'
		},
		{ name: 'Sofa / Upholstery', scope: 'Per set, stain removal', price: '30,000 – 60,000 TZS' },
		{
			name: 'Small Office Reset',
			scope: '1–2 visits per week',
			price: '150,000 – 250,000 TZS / month'
		}
	];

	const pillars = [
		{
			title: 'Vetted, uniformed staff',
			body: 'Background-checked cleaners arrive in branded uniform with a documented service agreement.'
		},
		{
			title: '20-point quality checklist',
			body: 'Every visit is signed off against a standard checklist, then followed up within 24 hours.'
		},
		{
			title: 'Transparent tiered pricing',
			body: 'Fixed-rate menu pricing with no hidden costs, plus custom quotes for heavy-duty work.'
		}
	];
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
					href="/pricing"
					class="rounded-brand border border-border-strong px-5 py-3 text-sm font-semibold text-foreground transition hover:border-brand-500 hover:text-brand-700"
					>See pricing</a
				>
			</div>
		</div>
		<div class="grid gap-4 sm:grid-cols-2">
			{#each pillars as pillar (pillar.title)}
				<div class="rounded-brand border border-border bg-background p-5 shadow-card">
					<p class="text-sm font-semibold text-foreground">{pillar.title}</p>
					<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
				</div>
			{/each}
		</div>
	</div>
</section>

<section class="container-page py-16 lg:py-20">
	<h2 class="text-2xl font-semibold tracking-tight text-foreground">Services</h2>
	<p class="mt-2 max-w-2xl text-muted-foreground">
		Structured packages for homes, rentals and small businesses across Dodoma.
	</p>
	<div class="mt-8 grid gap-6 sm:grid-cols-2">
		{#each services as service (service.title)}
			<article class="rounded-brand border border-border bg-background p-6 shadow-card">
				<h3 class="text-lg font-semibold text-foreground">{service.title}</h3>
				<p class="mt-2 text-sm leading-relaxed text-muted-foreground">{service.body}</p>
			</article>
		{/each}
	</div>
</section>

<section class="border-y border-border bg-surface">
	<div class="container-page py-16 lg:py-20">
		<h2 class="text-2xl font-semibold tracking-tight text-foreground">Transparent pricing</h2>
		<p class="mt-2 max-w-2xl text-muted-foreground">
			Menu prices in Tanzanian Shillings. Custom quotes available for post-construction and event
			cleanup.
		</p>
		<div class="mt-8 overflow-hidden rounded-brand border border-border bg-background">
			<table class="w-full text-left text-sm">
				<thead class="bg-surface-muted text-xs tracking-wide text-muted-foreground uppercase">
					<tr>
						<th class="px-5 py-3 font-medium">Service</th>
						<th class="px-5 py-3 font-medium">Scope</th>
						<th class="px-5 py-3 font-medium">Price</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each pricing as row (row.name)}
						<tr>
							<td class="px-5 py-4 font-medium text-foreground">{row.name}</td>
							<td class="px-5 py-4 text-muted-foreground">{row.scope}</td>
							<td class="px-5 py-4 font-semibold text-brand-700">{row.price}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>

<section class="container-page py-16 lg:py-20">
	<div class="rounded-brand bg-brand-700 px-8 py-12 text-center text-white sm:px-12 sm:py-16">
		<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">First office clean at 20% off</h2>
		<p class="mx-auto mt-3 max-w-2xl text-brand-50">
			Newly opening offices get a discounted first clean. Refer a recurring client and receive
			10,000&nbsp;TZS off your next service.
		</p>
		<div class="mt-8 flex flex-wrap justify-center gap-3">
			<a
				href="/contact"
				class="rounded-brand bg-white px-5 py-3 text-sm font-semibold text-brand-800 transition hover:bg-brand-50"
				>Book your first clean</a
			>
		</div>
	</div>
</section>
