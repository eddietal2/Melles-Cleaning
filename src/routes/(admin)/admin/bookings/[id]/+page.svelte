<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatDateTime } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import {
		BOOKING_STATUS_LABELS,
		CHECKLIST_STATUS_LABELS,
		INVOICE_STATUS_LABELS,
		PAYMENT_METHOD_LABELS,
		RECURRENCE_LABELS,
		badgeClass,
		bookingStatusTone,
		checklistStatusTone,
		invoiceStatusTone
	} from '$lib/utils/status';

	let { data, form }: PageProps = $props();

	const message = $derived((form as { message?: string } | null)?.message);
	const checkedCount = $derived(
		data.booking.checklist?.results.filter((result) => result.isChecked).length ?? 0
	);
	const totalCount = $derived(data.booking.checklist?.results.length ?? 0);
</script>

<div class="space-y-8">
	<div>
		<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/bookings">← Bookings</a>
		<div class="mt-1 flex flex-wrap items-center gap-3">
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">{data.booking.bookingNumber}</h1>
			<span class={badgeClass(bookingStatusTone(data.booking.status))}>{BOOKING_STATUS_LABELS[data.booking.status]}</span>
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			{data.booking.service.name} for {data.booking.client.displayName}
		</p>
	</div>

	{#if message}
		<p class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">{message}</p>
	{/if}

	<div class="grid gap-6 lg:grid-cols-3">
		<section class="rounded-brand border border-border bg-background p-5 shadow-card lg:col-span-2">
			<h2 class="text-sm font-semibold text-foreground">Job details</h2>
			<dl class="mt-4 grid gap-3 sm:grid-cols-2">
				<div>
					<dt class="text-xs tracking-wide text-muted-foreground uppercase">Scheduled</dt>
					<dd class="text-sm text-foreground">{formatDateTime(data.booking.scheduledStart)}</dd>
				</div>
				<div>
					<dt class="text-xs tracking-wide text-muted-foreground uppercase">Duration</dt>
					<dd class="text-sm text-foreground">{data.booking.durationMinutes} minutes</dd>
				</div>
				<div>
					<dt class="text-xs tracking-wide text-muted-foreground uppercase">Recurrence</dt>
					<dd class="text-sm text-foreground">{RECURRENCE_LABELS[data.booking.recurrenceFrequency]}</dd>
				</div>
				<div>
					<dt class="text-xs tracking-wide text-muted-foreground uppercase">Quoted total</dt>
					<dd class="text-sm text-foreground">{formatTzs(data.booking.quotedTotalTzs)}</dd>
				</div>
				<div class="sm:col-span-2">
					<dt class="text-xs tracking-wide text-muted-foreground uppercase">Address</dt>
					<dd class="text-sm text-foreground">{data.booking.addressSnapshot ?? '—'}</dd>
				</div>
				{#if data.booking.specialInstructions}
					<div class="sm:col-span-2">
						<dt class="text-xs tracking-wide text-muted-foreground uppercase">Instructions</dt>
						<dd class="text-sm whitespace-pre-line text-foreground">{data.booking.specialInstructions}</dd>
					</div>
				{/if}
			</dl>

			<div class="mt-5 flex flex-wrap gap-2 border-t border-border pt-5">
				{#each data.nextStatuses as status (status)}
					<form method="POST" action="?/setStatus" use:enhance>
						<input type="hidden" name="status" value={status} />
						<button type="submit" class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700">
							Mark {BOOKING_STATUS_LABELS[status]}
						</button>
					</form>
				{/each}
				{#if data.booking.invoice}
					<a href="/admin/invoices/{data.booking.invoice.id}" class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:border-brand-500 hover:text-brand-700">
						View invoice
					</a>
				{:else if ['VERIFIED', 'COMPLETED', 'IN_PROGRESS'].includes(data.booking.status)}
					<form method="POST" action="?/generateInvoice" use:enhance>
						<button type="submit" class="rounded-brand bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700">
							Generate invoice
						</button>
					</form>
				{/if}
			</div>
		</section>

		<section class="space-y-6">
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Quality checklist</h2>
				{#if data.booking.checklist}
					<div class="mt-3 flex items-center justify-between text-sm">
						<span class={badgeClass(checklistStatusTone(data.booking.checklist.status))}>
							{CHECKLIST_STATUS_LABELS[data.booking.checklist.status]}
						</span>
						<span class="text-muted-foreground">{checkedCount}/{totalCount} items</span>
					</div>
					<a href="/admin/checklists/{data.booking.checklist.id}" class="mt-3 inline-block text-sm text-brand-700 hover:underline">
						Open checklist →
					</a>
				{:else}
					<p class="mt-2 text-sm text-muted-foreground">No checklist attached.</p>
				{/if}
			</div>

			{#if data.booking.invoice}
				<div class="rounded-brand border border-border bg-background p-5 shadow-card">
					<h2 class="text-sm font-semibold text-foreground">Invoice</h2>
					<div class="mt-3 flex items-center justify-between text-sm">
						<a href="/admin/invoices/{data.booking.invoice.id}" class="text-foreground hover:text-brand-700">
							{data.booking.invoice.invoiceNumber}
						</a>
						<span class={badgeClass(invoiceStatusTone(data.booking.invoice.status))}>
							{INVOICE_STATUS_LABELS[data.booking.invoice.status]}
						</span>
					</div>
					<p class="mt-2 text-sm text-muted-foreground">{formatTzs(data.booking.invoice.totalTzs)}</p>
				</div>
			{/if}

			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Feedback</h2>
				<ul class="mt-3 space-y-3 text-sm">
					{#each data.booking.feedbacks as entry (entry.id)}
						<li>
							<p class="font-medium text-foreground">{entry.rating} / 5</p>
							<p class="text-muted-foreground">{entry.comment ?? 'No comment.'}</p>
						</li>
					{:else}
						<li class="text-muted-foreground">No feedback yet.</li>
					{/each}
				</ul>
				{#if data.booking.invoice?.payments?.length}
					<div class="mt-4 border-t border-border pt-3">
						<h3 class="text-xs tracking-wide text-muted-foreground uppercase">Payments</h3>
						<ul class="mt-2 space-y-1 text-sm">
							{#each data.booking.invoice.payments as payment (payment.id)}
								<li class="flex justify-between text-muted-foreground">
									<span>{PAYMENT_METHOD_LABELS[payment.method]}</span>
									<span>{formatTzs(payment.amountTzs)}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</div>
		</section>
	</div>
</div>
