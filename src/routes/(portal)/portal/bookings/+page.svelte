<script lang="ts">
	import type { PageProps } from './$types';
	import { formatDateTime } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import {
		BOOKING_STATUS_LABELS,
		RECURRENCE_LABELS,
		badgeClass,
		bookingStatusTone
	} from '$lib/utils/status';

	let { data }: PageProps = $props();
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Your bookings</h1>
		<p class="mt-1 text-sm text-muted-foreground">Every visit we have scheduled for you.</p>
	</div>

	<div class="space-y-3">
		{#each data.bookings as booking (booking.id)}
			<article class="rounded-brand border border-border bg-background p-5 shadow-card">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<div class="flex items-center gap-2">
							<h2 class="text-sm font-semibold text-foreground">{booking.service.name}</h2>
							<span class={badgeClass(bookingStatusTone(booking.status))}>
								{BOOKING_STATUS_LABELS[booking.status]}
							</span>
						</div>
						<p class="mt-1 text-xs text-muted-foreground">
							{formatDateTime(booking.scheduledStart)} · {booking.durationMinutes} minutes
							{#if booking.recurrenceFrequency !== 'ONE_TIME'}
								· {RECURRENCE_LABELS[booking.recurrenceFrequency]}
							{/if}
						</p>
						{#if booking.addressSnapshot}
							<p class="mt-1 text-xs text-muted-foreground">{booking.addressSnapshot}</p>
						{/if}
					</div>
					<div class="text-right">
						<p class="text-sm font-medium text-foreground">{formatTzs(booking.quotedTotalTzs)}</p>
						<p class="text-xs text-muted-foreground">{booking.bookingNumber}</p>
						{#if booking.invoice}
							<a class="text-xs text-brand-700 hover:underline" href="/portal/invoices">
								{booking.invoice.invoiceNumber}
							</a>
						{/if}
					</div>
				</div>
			</article>
		{:else}
			<p class="rounded-brand border border-border bg-background p-6 text-sm text-muted-foreground shadow-card">
				No bookings yet. <a class="text-brand-700 hover:underline" href="/book">Request a clean</a>.
			</p>
		{/each}
	</div>
</div>
