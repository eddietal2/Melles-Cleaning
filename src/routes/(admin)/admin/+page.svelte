<script lang="ts">
	const kpis = [
		{ label: 'Pipeline value', value: '—', hint: 'Open quotes and qualified leads' },
		{ label: 'Jobs this week', value: '—', hint: 'Scheduled across all teams' },
		{ label: 'Revenue this month', value: '—', hint: 'Payments recorded in TZS' },
		{ label: 'Unpaid invoices', value: '—', hint: 'Issued and overdue' }
	];

	const upcoming = [
		'Lead pipeline with WhatsApp follow-ups',
		'Client records and recurring schedules',
		'Quote and invoice generation',
		'Checklist sign-off and feedback'
	];
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Dashboard</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Your operational overview. Metrics populate once jobs and invoices are recorded.
		</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
		{#each kpis as kpi (kpi.label)}
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<p class="text-xs tracking-wide text-muted-foreground uppercase">{kpi.label}</p>
				<p class="mt-2 text-3xl font-semibold text-foreground">{kpi.value}</p>
				<p class="mt-1 text-xs text-muted-foreground">{kpi.hint}</p>
			</div>
		{/each}
	</div>

	<div class="rounded-brand border border-border bg-background p-6 shadow-card">
		<h2 class="text-lg font-semibold text-foreground">Foundation complete</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Phase 0 set up authentication, the database schema and the admin shell. Next up:
		</p>
		<ul class="mt-4 space-y-2 text-sm text-foreground">
			{#each upcoming as item (item)}
				<li class="flex items-start gap-2">
					<span class="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" aria-hidden="true"
					></span>
					<span>{item}</span>
				</li>
			{/each}
		</ul>
	</div>
</div>
