<script lang="ts">
	import type { PageProps } from './$types';
	import { formatTzs } from '$lib/utils/currency';
	import Skeleton from '$lib/components/ui/skeleton.svelte';

	let { data }: PageProps = $props();

	const placeholderIndexes = [0, 1, 2];
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Reports</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Revenue, retention, job value and team utilisation, all in TZS and EAT.
		</p>
	</div>

	{#await data.streamed}
		<div class="grid gap-4 sm:grid-cols-3">
			{#each placeholderIndexes as index (index)}
				<div class="rounded-brand border border-border bg-background p-5 shadow-card">
					<Skeleton class="h-3 w-32" />
					<Skeleton class="mt-3 h-7 w-28" />
				</div>
			{/each}
		</div>
		<div class="rounded-brand border border-border bg-background p-5 shadow-card">
			<Skeleton class="h-4 w-40" />
			<div class="mt-4 flex h-40 items-end gap-6">
				{#each [0, 1, 2, 3, 4, 5] as bar (bar)}
					<Skeleton class="h-full flex-1" />
				{/each}
			</div>
		</div>
		<div class="grid gap-6 lg:grid-cols-2">
			{#each [0, 1] as panel (panel)}
				<div class="rounded-brand border border-border bg-background p-5 shadow-card">
					<Skeleton class="h-4 w-40" />
					<div class="mt-4 space-y-3">
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-5/6" />
						<Skeleton class="h-4 w-4/6" />
					</div>
				</div>
			{/each}
		</div>
	{:then reports}
		{@const maxRevenue = Math.max(...reports.revenueByMonth.map((month) => month.totalTzs), 1)}
		{@const segmentTotal = reports.segmentTotals.RESIDENTIAL + reports.segmentTotals.COMMERCIAL}

		<div class="grid gap-4 sm:grid-cols-3">
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<p class="text-xs tracking-wide text-muted-foreground uppercase">Average job value</p>
				<p class="mt-2 text-2xl font-semibold text-foreground">
					{formatTzs(reports.averageJobValueTzs)}
				</p>
			</div>
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<p class="text-xs tracking-wide text-muted-foreground uppercase">Client retention</p>
				<p class="mt-2 text-2xl font-semibold text-foreground">{reports.retentionPercent}%</p>
				<p class="text-xs text-muted-foreground">
					{reports.recurringClients} of {reports.activeClients} active clients repeat
				</p>
			</div>
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<p class="text-xs tracking-wide text-muted-foreground uppercase">Outstanding balance</p>
				<p class="mt-2 text-2xl font-semibold text-foreground">
					{formatTzs(
						reports.aging.current +
							reports.aging.days30 +
							reports.aging.days60 +
							reports.aging.days90Plus
					)}
				</p>
			</div>
		</div>

		<section class="rounded-brand border border-border bg-background p-5 shadow-card">
			<h2 class="text-sm font-semibold text-foreground">Revenue by month</h2>
			<div class="mt-4 flex items-end gap-3 sm:gap-6">
				{#each reports.revenueByMonth as month (month.key)}
					<div class="flex flex-1 flex-col items-center gap-2">
						<div class="flex h-40 w-full items-end">
							<div
								class="w-full rounded-t-brand bg-brand-500"
								style={`height: ${Math.max((month.totalTzs / maxRevenue) * 100, month.totalTzs > 0 ? 4 : 0)}%`}
								title={formatTzs(month.totalTzs)}
							></div>
						</div>
						<span class="text-xs text-muted-foreground">{month.label}</span>
						<span class="text-xs font-medium text-foreground">{formatTzs(month.totalTzs)}</span>
					</div>
				{/each}
			</div>
		</section>

		<div class="grid gap-6 lg:grid-cols-2">
			<section class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Invoiced by segment</h2>
				<div class="mt-4 space-y-3">
					{#each [['RESIDENTIAL', 'Residential'], ['COMMERCIAL', 'Commercial']] as const as [key, label] (key)}
						{@const value = reports.segmentTotals[key]}
						<div>
							<div class="flex justify-between text-sm">
								<span class="text-foreground">{label}</span>
								<span class="text-muted-foreground">{formatTzs(value)}</span>
							</div>
							<div class="mt-1 h-2 rounded-pill bg-surface-muted">
								<div
									class="h-2 rounded-pill bg-accent-500"
									style={`width: ${segmentTotal > 0 ? (value / segmentTotal) * 100 : 0}%`}
								></div>
							</div>
						</div>
					{/each}
				</div>
			</section>

			<section class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Invoice aging</h2>
				<dl class="mt-4 space-y-2 text-sm">
					<div class="flex justify-between">
						<dt class="text-muted-foreground">Current</dt>
						<dd class="text-foreground">{formatTzs(reports.aging.current)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-muted-foreground">1–30 days</dt>
						<dd class="text-foreground">{formatTzs(reports.aging.days30)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-muted-foreground">31–60 days</dt>
						<dd class="text-foreground">{formatTzs(reports.aging.days60)}</dd>
					</div>
					<div class="flex justify-between">
						<dt class="text-muted-foreground">90+ days</dt>
						<dd class="text-danger">{formatTzs(reports.aging.days90Plus)}</dd>
					</div>
				</dl>
			</section>
		</div>

		<section class="rounded-brand border border-border bg-background p-5 shadow-card">
			<h2 class="text-sm font-semibold text-foreground">Team utilisation (last 30 days)</h2>
			<ul class="mt-4 space-y-2 text-sm">
				{#each reports.teamUtilisation as member (member.name)}
					<li class="flex items-center justify-between">
						<span class="text-foreground">{member.name}</span>
						<span class="text-muted-foreground"
							>{member.jobs} job{member.jobs === 1 ? '' : 's'}</span
						>
					</li>
				{:else}
					<li class="text-muted-foreground">No assignments recorded yet.</li>
				{/each}
			</ul>
		</section>
	{:catch}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			Could not load the reports. Please refresh the page.
		</p>
	{/await}
</div>
