<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { formatDateTime } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import {
		badgeClass,
		bookingStatusLabel,
		bookingStatusTone,
		recurrenceLabel
	} from '$lib/utils/status';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
	const message = $derived((form as { message?: string } | null)?.message);
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">
			{m.admin_bookings_title()}
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			{m.admin_bookings_intro()}
		</p>
	</div>

	{#if message}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{message}
		</p>
	{/if}

	{#await data.streamed}
		<TableSkeleton rows={6} columns={5} />
	{:then payload}
		<details class="rounded-brand border border-border bg-background shadow-card">
			<summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-foreground"
				>{m.admin_bookings_schedule_heading()}</summary
			>
			<form
				method="POST"
				action="?/create"
				class="grid gap-4 border-t border-border p-5 sm:grid-cols-2"
				use:enhance
			>
				<div>
					<label for="clientId" class="block text-sm font-medium text-foreground"
						>{m.common_client()}</label
					>
					<select
						id="clientId"
						name="clientId"
						required
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						<option value="">{m.common_select_client()}</option>
						{#each payload.clients as client (client.id)}
							<option value={client.id}>{client.displayName}</option>
						{/each}
					</select>
					{#if errors.clientId}<p class="mt-1 text-xs text-danger">{errors.clientId}</p>{/if}
				</div>
				<div>
					<label for="serviceId" class="block text-sm font-medium text-foreground"
						>{m.common_service()}</label
					>
					<select
						id="serviceId"
						name="serviceId"
						required
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						<option value="">{m.common_select_service()}</option>
						{#each payload.services as service (service.id)}
							<option value={service.id}>{service.name}</option>
						{/each}
					</select>
					{#if errors.serviceId}<p class="mt-1 text-xs text-danger">{errors.serviceId}</p>{/if}
				</div>
				<div>
					<label for="scheduledDate" class="block text-sm font-medium text-foreground"
						>{m.common_date()}</label
					>
					<input
						id="scheduledDate"
						name="scheduledDate"
						type="date"
						required
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div>
					<label for="scheduledTime" class="block text-sm font-medium text-foreground"
						>{m.admin_bookings_start_time()}</label
					>
					<input
						id="scheduledTime"
						name="scheduledTime"
						type="time"
						value="08:00"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div>
					<label for="durationMinutes" class="block text-sm font-medium text-foreground"
						>{m.admin_bookings_duration()}</label
					>
					<input
						id="durationMinutes"
						name="durationMinutes"
						type="number"
						min="30"
						step="30"
						value="120"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div>
					<label for="recurrenceFrequency" class="block text-sm font-medium text-foreground"
						>{m.admin_bookings_recurrence()}</label
					>
					<select
						id="recurrenceFrequency"
						name="recurrenceFrequency"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						<option value="ONE_TIME">{m.status_recurrence_one_time()}</option>
						<option value="WEEKLY">{m.status_recurrence_weekly()}</option>
						<option value="BI_WEEKLY">{m.status_recurrence_bi_weekly()}</option>
						<option value="MONTHLY">{m.status_recurrence_monthly()}</option>
					</select>
				</div>
				<div>
					<label for="quotedTotalTzs" class="block text-sm font-medium text-foreground"
						>{m.admin_bookings_quoted_total()}</label
					>
					<input
						id="quotedTotalTzs"
						name="quotedTotalTzs"
						type="number"
						min="0"
						step="1000"
						value="0"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div>
					<label for="addressSnapshot" class="block text-sm font-medium text-foreground"
						>{m.common_address()}</label
					>
					<input
						id="addressSnapshot"
						name="addressSnapshot"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div class="sm:col-span-2">
					<label for="specialInstructions" class="block text-sm font-medium text-foreground"
						>{m.admin_bookings_instructions()}</label
					>
					<textarea
						id="specialInstructions"
						name="specialInstructions"
						rows="2"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					></textarea>
				</div>
				<div class="sm:col-span-2">
					<button
						type="submit"
						class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
					>
						{m.admin_bookings_schedule()}
					</button>
				</div>
			</form>
		</details>

		<div class="overflow-hidden rounded-brand border border-border bg-background shadow-card">
			<table class="min-w-full divide-y divide-border text-sm">
				<thead
					class="bg-surface-muted text-left text-xs tracking-wide text-muted-foreground uppercase"
				>
					<tr>
						<th class="px-5 py-3 font-medium">{m.common_job()}</th>
						<th class="px-5 py-3 font-medium">{m.common_client()}</th>
						<th class="px-5 py-3 font-medium">{m.admin_bookings_col_scheduled()}</th>
						<th class="px-5 py-3 font-medium">{m.common_total()}</th>
						<th class="px-5 py-3 font-medium">{m.common_status()}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each payload.bookings as booking (booking.id)}
						<tr>
							<td class="px-5 py-3">
								<a
									href="/admin/bookings/{booking.id}"
									class="font-medium text-foreground hover:text-brand-700"
									>{booking.bookingNumber}</a
								>
								<p class="text-xs text-muted-foreground">{booking.service.name}</p>
							</td>
							<td class="px-5 py-3 text-muted-foreground">{booking.client.displayName}</td>
							<td class="px-5 py-3 text-muted-foreground">
								{formatDateTime(booking.scheduledStart)}
								{#if booking.recurrenceFrequency !== 'ONE_TIME'}
									<span class="block text-xs">{recurrenceLabel(booking.recurrenceFrequency)}</span>
								{/if}
							</td>
							<td class="px-5 py-3 text-muted-foreground">{formatTzs(booking.quotedTotalTzs)}</td>
							<td class="px-5 py-3">
								<span class={badgeClass(bookingStatusTone(booking.status))}
									>{bookingStatusLabel(booking.status)}</span
								>
							</td>
						</tr>
					{:else}
						<tr>
							<td class="px-5 py-6 text-muted-foreground" colspan="5">{m.admin_bookings_empty()}</td
							>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:catch}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{m.admin_bookings_error()}
		</p>
	{/await}
</div>
