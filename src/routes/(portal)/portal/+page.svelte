<script lang="ts">
	import type { PageProps } from './$types';
	import { formatDateTime } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';

	let { data }: PageProps = $props();
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Welcome back</h1>
		<p class="mt-1 text-sm text-muted-foreground">Your cleans, invoices and feedback in one place.</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-3">
		<div class="rounded-brand border border-border bg-background p-5 shadow-card">
			<p class="text-xs tracking-wide text-muted-foreground uppercase">Upcoming cleans</p>
			<p class="mt-2 text-2xl font-semibold text-foreground">{data.overview.upcomingCount}</p>
		</div>
		<div class="rounded-brand border border-border bg-background p-5 shadow-card">
			<p class="text-xs tracking-wide text-muted-foreground uppercase">Outstanding</p>
			<p class="mt-2 text-2xl font-semibold text-foreground">
				{formatTzs(data.overview.outstandingTzs)}
			</p>
		</div>
		<div class="rounded-brand border border-border bg-background p-5 shadow-card">
			<p class="text-xs tracking-wide text-muted-foreground uppercase">Paid to date</p>
			<p class="mt-2 text-2xl font-semibold text-foreground">{formatTzs(data.overview.paidTzs)}</p>
		</div>
	</div>

	<section class="grid gap-6 lg:grid-cols-2">
		<div class="rounded-brand border border-border bg-background p-5 shadow-card">
			<div class="flex items-center justify-between">
				<h2 class="text-sm font-semibold text-foreground">Next visits</h2>
				<a class="text-xs text-brand-700 hover:underline" href="/portal/bookings">View all</a>
			</div>
			<ul class="mt-3 divide-y divide-border">
				{#each data.overview.nextBookings as booking (booking.id)}
					<li class="py-2 text-sm">
						<p class="font-medium text-foreground">{booking.service.name}</p>
						<p class="text-xs text-muted-foreground">{formatDateTime(booking.scheduledStart)}</p>
					</li>
				{:else}
					<li class="py-3 text-sm text-muted-foreground">No upcoming visits scheduled.</li>
				{/each}
			</ul>
		</div>

		<div class="rounded-brand border border-border bg-background p-5 shadow-card">
			<div class="flex items-center justify-between">
				<h2 class="text-sm font-semibold text-foreground">Recent feedback</h2>
				<a class="text-xs text-brand-700 hover:underline" href="/portal/feedback">View all</a>
			</div>
			<ul class="mt-3 divide-y divide-border">
				{#each data.overview.recentFeedback as entry (entry.id)}
					<li class="py-2 text-sm">
						<div class="flex items-center justify-between">
							<span class="font-medium text-foreground">{entry.booking.service.name}</span>
							<span class="text-muted-foreground">{entry.rating} / 5</span>
						</div>
						<p class="text-xs text-muted-foreground">{entry.comment ?? 'No comment.'}</p>
					</li>
				{:else}
					<li class="py-3 text-sm text-muted-foreground">You have not left feedback yet.</li>
				{/each}
			</ul>
		</div>
	</section>

	<section class="rounded-brand border border-border bg-background p-5 shadow-card">
		<h2 class="text-sm font-semibold text-foreground">Need another clean?</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Request a quote and we will confirm a time that suits you.
		</p>
		<a
			href="/book"
			class="mt-3 inline-block rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
		>
			Request a booking
		</a>
	</section>
</div>
