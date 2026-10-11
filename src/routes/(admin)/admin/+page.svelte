<script lang="ts">
	import type { PageProps } from './$types';
	import { formatDateTime } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import { badgeClass, bookingStatusLabel, bookingStatusTone } from '$lib/utils/status';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import * as m from '$lib/paraglide/messages.js';

	let { data }: PageProps = $props();

	const placeholderIndexes = [0, 1, 2, 3];
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">
			{m.admin_dashboard_title()}
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">{m.admin_dashboard_intro()}</p>
	</div>

	{#await data.streamed}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			{#each placeholderIndexes as index (index)}
				<div class="rounded-brand border border-border bg-background p-5 shadow-card">
					<Skeleton class="h-3 w-24" />
					<Skeleton class="mt-3 h-7 w-32" />
					<Skeleton class="mt-2 h-3 w-28" />
				</div>
			{/each}
		</div>
		<div class="grid gap-6 lg:grid-cols-2">
			{#each [0, 1] as column (column)}
				<div class="rounded-brand border border-border bg-background p-5 shadow-card">
					<Skeleton class="h-4 w-32" />
					<div class="mt-4 space-y-3">
						<Skeleton class="h-4 w-full" />
						<Skeleton class="h-4 w-5/6" />
						<Skeleton class="h-4 w-4/6" />
					</div>
				</div>
			{/each}
		</div>
	{:then metrics}
		<div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
			<a
				href="/admin/quotes"
				class="rounded-brand border border-border bg-background p-5 shadow-card transition hover:border-brand-500"
			>
				<p class="text-xs tracking-wide text-muted-foreground uppercase">
					{m.admin_dashboard_pipeline_value()}
				</p>
				<p class="mt-2 text-2xl font-semibold text-foreground">
					{formatTzs(metrics.pipelineValueTzs)}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">{m.admin_dashboard_open_quotes()}</p>
			</a>
			<a
				href="/admin/bookings"
				class="rounded-brand border border-border bg-background p-5 shadow-card transition hover:border-brand-500"
			>
				<p class="text-xs tracking-wide text-muted-foreground uppercase">
					{m.admin_dashboard_jobs_week()}
				</p>
				<p class="mt-2 text-2xl font-semibold text-foreground">{metrics.jobsThisWeek}</p>
				<p class="mt-1 text-xs text-muted-foreground">{m.admin_dashboard_scheduled_7()}</p>
			</a>
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<p class="text-xs tracking-wide text-muted-foreground uppercase">
					{m.admin_dashboard_revenue_month()}
				</p>
				<p class="mt-2 text-2xl font-semibold text-foreground">
					{formatTzs(metrics.monthlyRevenueTzs)}
				</p>
				<p class="mt-1 text-xs text-muted-foreground">{m.admin_dashboard_payments_tzs()}</p>
			</div>
			<a
				href="/admin/invoices"
				class="rounded-brand border border-border bg-background p-5 shadow-card transition hover:border-brand-500"
			>
				<p class="text-xs tracking-wide text-muted-foreground uppercase">
					{m.admin_dashboard_unpaid_invoices()}
				</p>
				<p class="mt-2 text-2xl font-semibold text-foreground">{metrics.unpaidInvoiceCount}</p>
				<p class="mt-1 text-xs text-muted-foreground">
					{m.admin_dashboard_outstanding({ amount: formatTzs(metrics.unpaidInvoiceTzs) })}
				</p>
			</a>
		</div>

		<div class="grid gap-6 lg:grid-cols-2">
			<section class="rounded-brand border border-border bg-background p-5 shadow-card">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-semibold text-foreground">
						{m.admin_dashboard_upcoming_jobs()}
					</h2>
					<a href="/admin/bookings" class="text-xs text-brand-700 hover:underline"
						>{m.common_view_all()}</a
					>
				</div>
				<ul class="mt-3 divide-y divide-border">
					{#each metrics.upcomingBookings as booking (booking.id)}
						<li class="flex items-center justify-between gap-3 py-2 text-sm">
							<div>
								<a
									href="/admin/bookings/{booking.id}"
									class="font-medium text-foreground hover:text-brand-700"
								>
									{booking.client.displayName}
								</a>
								<p class="text-xs text-muted-foreground">
									{booking.service.name} · {formatDateTime(booking.scheduledStart)}
								</p>
							</div>
							<span class={badgeClass(bookingStatusTone(booking.status))}>
								{bookingStatusLabel(booking.status)}
							</span>
						</li>
					{:else}
						<li class="py-3 text-sm text-muted-foreground">
							{m.admin_dashboard_no_upcoming()}
						</li>
					{/each}
				</ul>
			</section>

			<section class="rounded-brand border border-border bg-background p-5 shadow-card">
				<div class="flex items-center justify-between">
					<h2 class="text-sm font-semibold text-foreground">
						{m.admin_dashboard_recent_feedback()}
					</h2>
					<a href="/admin/feedback" class="text-xs text-brand-700 hover:underline"
						>{m.common_view_all()}</a
					>
				</div>
				<ul class="mt-3 divide-y divide-border">
					{#each metrics.recentFeedback as entry (entry.id)}
						<li class="py-2 text-sm">
							<div class="flex items-center justify-between">
								<span class="font-medium text-foreground">{entry.booking.client.displayName}</span>
								<span class="text-muted-foreground">{entry.rating} / 5</span>
							</div>
							<p class="text-xs text-muted-foreground">
								{entry.comment ?? m.common_no_comment()}
							</p>
						</li>
					{:else}
						<li class="py-3 text-sm text-muted-foreground">{m.admin_dashboard_no_feedback()}</li>
					{/each}
				</ul>
			</section>
		</div>
	{:catch}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{m.admin_dashboard_error()}
		</p>
	{/await}
</div>
