<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatDateTime } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import { BOOKING_STATUS_LABELS, RECURRENCE_LABELS, badgeClass, bookingStatusTone } from '$lib/utils/status';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
	const message = $derived((form as { message?: string } | null)?.message);
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Bookings</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Scheduled jobs. Each booking carries the QC checklist and can be invoiced once verified.
		</p>
	</div>

	{#if message}
		<p class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
			{message}
		</p>
	{/if}

	{#await data.streamed}
		<TableSkeleton rows={6} columns={5} />
	{:then payload}
		<details class="rounded-brand border border-border bg-background shadow-card">
			<summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-foreground"
				>Schedule a job</summary
			>
			<form method="POST" action="?/create" class="grid gap-4 border-t border-border p-5 sm:grid-cols-2" use:enhance>
				<div>
					<label for="clientId" class="block text-sm font-medium text-foreground">Client</label>
					<select id="clientId" name="clientId" required class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">
						<option value="">Select a client</option>
						{#each payload.clients as client (client.id)}
							<option value={client.id}>{client.displayName}</option>
						{/each}
					</select>
					{#if errors.clientId}<p class="mt-1 text-xs text-danger">{errors.clientId}</p>{/if}
				</div>
				<div>
					<label for="serviceId" class="block text-sm font-medium text-foreground">Service</label>
					<select id="serviceId" name="serviceId" required class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">
						<option value="">Select a service</option>
						{#each payload.services as service (service.id)}
							<option value={service.id}>{service.name}</option>
						{/each}
					</select>
					{#if errors.serviceId}<p class="mt-1 text-xs text-danger">{errors.serviceId}</p>{/if}
				</div>
				<div>
					<label for="scheduledDate" class="block text-sm font-medium text-foreground">Date</label>
					<input id="scheduledDate" name="scheduledDate" type="date" required class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
				</div>
				<div>
					<label for="scheduledTime" class="block text-sm font-medium text-foreground">Start time (EAT)</label>
					<input id="scheduledTime" name="scheduledTime" type="time" value="08:00" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
				</div>
				<div>
					<label for="durationMinutes" class="block text-sm font-medium text-foreground">Duration (minutes)</label>
					<input id="durationMinutes" name="durationMinutes" type="number" min="30" step="30" value="120" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
				</div>
				<div>
					<label for="recurrenceFrequency" class="block text-sm font-medium text-foreground">Recurrence</label>
					<select id="recurrenceFrequency" name="recurrenceFrequency" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">
						<option value="ONE_TIME">One-time</option>
						<option value="WEEKLY">Weekly</option>
						<option value="BI_WEEKLY">Bi-weekly</option>
						<option value="MONTHLY">Monthly</option>
					</select>
				</div>
				<div>
					<label for="quotedTotalTzs" class="block text-sm font-medium text-foreground">Quoted total (TZS)</label>
					<input id="quotedTotalTzs" name="quotedTotalTzs" type="number" min="0" step="1000" value="0" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
				</div>
				<div>
					<label for="addressSnapshot" class="block text-sm font-medium text-foreground">Address</label>
					<input id="addressSnapshot" name="addressSnapshot" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
				</div>
				<div class="sm:col-span-2">
					<label for="specialInstructions" class="block text-sm font-medium text-foreground">Instructions</label>
					<textarea id="specialInstructions" name="specialInstructions" rows="2" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"></textarea>
				</div>
				<div class="sm:col-span-2">
					<button type="submit" class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
						Schedule job
					</button>
				</div>
			</form>
		</details>

		<div class="overflow-hidden rounded-brand border border-border bg-background shadow-card">
			<table class="min-w-full divide-y divide-border text-sm">
				<thead class="bg-surface-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
					<tr>
						<th class="px-5 py-3 font-medium">Job</th>
						<th class="px-5 py-3 font-medium">Client</th>
						<th class="px-5 py-3 font-medium">Scheduled</th>
						<th class="px-5 py-3 font-medium">Total</th>
						<th class="px-5 py-3 font-medium">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each payload.bookings as booking (booking.id)}
						<tr>
							<td class="px-5 py-3">
								<a href="/admin/bookings/{booking.id}" class="font-medium text-foreground hover:text-brand-700">{booking.bookingNumber}</a>
								<p class="text-xs text-muted-foreground">{booking.service.name}</p>
							</td>
							<td class="px-5 py-3 text-muted-foreground">{booking.client.displayName}</td>
							<td class="px-5 py-3 text-muted-foreground">
								{formatDateTime(booking.scheduledStart)}
								{#if booking.recurrenceFrequency !== 'ONE_TIME'}
									<span class="block text-xs">{RECURRENCE_LABELS[booking.recurrenceFrequency]}</span>
								{/if}
							</td>
							<td class="px-5 py-3 text-muted-foreground">{formatTzs(booking.quotedTotalTzs)}</td>
							<td class="px-5 py-3">
								<span class={badgeClass(bookingStatusTone(booking.status))}>{BOOKING_STATUS_LABELS[booking.status]}</span>
							</td>
						</tr>
					{:else}
						<tr><td class="px-5 py-6 text-muted-foreground" colspan="5">No bookings yet.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:catch}
		<p class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">
			Could not load bookings. Please refresh the page.
		</p>
	{/await}
</div>
