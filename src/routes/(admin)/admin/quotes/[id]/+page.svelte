<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatDateTime, toDateInputValue } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import { QUOTE_STATUS_LABELS, badgeClass, quoteStatusTone } from '$lib/utils/status';

	let { data, form }: PageProps = $props();

	const message = $derived((form as { message?: string } | null)?.message);
	const rows = $derived([
		...data.quote.lineItems,
		{ id: 'blank-1', description: '', quantity: 1, unitPriceTzs: 0 },
		{ id: 'blank-2', description: '', quantity: 1, unitPriceTzs: 0 }
	]);
</script>

<div class="space-y-8">
	<div>
		<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/quotes">← Quotes</a>
		<div class="mt-1 flex flex-wrap items-center gap-3">
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">{data.quote.quoteNumber}</h1>
			<span class={badgeClass(quoteStatusTone(data.quote.status))}>{QUOTE_STATUS_LABELS[data.quote.status]}</span>
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			{data.quote.client.displayName} · created {formatDateTime(data.quote.createdAt)}
		</p>
	</div>

	{#if message}
		<p class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger" role="alert">{message}</p>
	{/if}

	<div class="grid gap-6 lg:grid-cols-3">
		<section class="rounded-brand border border-border bg-background p-5 shadow-card lg:col-span-2">
			<h2 class="text-sm font-semibold text-foreground">Line items</h2>
			<form method="POST" action="?/update" class="mt-4 space-y-4" use:enhance>
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="clientId" class="block text-sm font-medium text-foreground">Client</label>
						<select id="clientId" name="clientId" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">
							{#each data.clients as client (client.id)}
								<option value={client.id} selected={client.id === data.quote.clientId}>{client.displayName}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="validUntil" class="block text-sm font-medium text-foreground">Valid until</label>
						<input id="validUntil" name="validUntil" type="date" value={toDateInputValue(data.quote.validUntil)} class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
					</div>
				</div>

				<div class="rounded-brand border border-border">
					<div class="grid grid-cols-12 gap-2 border-b border-border bg-surface-muted px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
						<span class="col-span-6">Description</span>
						<span class="col-span-2">Qty</span>
						<span class="col-span-4">Unit price (TZS)</span>
					</div>
					{#each rows as row (row.id)}
						<div class="grid grid-cols-12 gap-2 border-b border-border p-3 last:border-b-0">
							<input name="description" value={row.description} placeholder="Description" class="col-span-6 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
							<input name="quantity" type="number" min="1" value={row.quantity} class="col-span-2 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
							<input name="unitPriceTzs" type="number" min="0" step="1000" value={row.unitPriceTzs} class="col-span-4 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
						</div>
					{/each}
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="discountTzs" class="block text-sm font-medium text-foreground">Discount (TZS)</label>
						<input id="discountTzs" name="discountTzs" type="number" min="0" step="1000" value={data.quote.discountTzs} class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
					</div>
					<div>
						<label for="notes" class="block text-sm font-medium text-foreground">Notes</label>
						<textarea id="notes" name="notes" rows="2" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">{data.quote.notes ?? ''}</textarea>
					</div>
				</div>

				<div class="flex flex-wrap items-center justify-between gap-3">
					<button type="submit" class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
						Save quote
					</button>
					<dl class="text-right text-sm">
						<div class="flex justify-end gap-6">
							<dt class="text-muted-foreground">Subtotal</dt>
							<dd class="text-foreground">{formatTzs(data.quote.subtotalTzs)}</dd>
						</div>
						<div class="flex justify-end gap-6">
							<dt class="text-muted-foreground">Discount</dt>
							<dd class="text-foreground">− {formatTzs(data.quote.discountTzs)}</dd>
						</div>
						<div class="mt-1 flex justify-end gap-6 text-base font-semibold">
							<dt>Total</dt>
							<dd>{formatTzs(data.quote.totalTzs)}</dd>
						</div>
					</dl>
				</div>
			</form>
		</section>

		<section class="space-y-6">
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Status</h2>
				<div class="mt-3 flex flex-wrap gap-2">
					{#each ['SENT', 'ACCEPTED', 'DECLINED', 'EXPIRED'] as status (status)}
						<form method="POST" action="?/setStatus" use:enhance>
							<input type="hidden" name="status" value={status} />
							<button type="submit" class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700">
								{QUOTE_STATUS_LABELS[status]}
							</button>
						</form>
					{/each}
				</div>
			</div>

			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Convert to booking</h2>
				{#if data.quote.booking}
					<p class="mt-2 text-sm text-muted-foreground">
						Already booked as
						<a class="text-brand-700 hover:underline" href="/admin/bookings/{data.quote.booking.id}">{data.quote.booking.bookingNumber}</a>.
					</p>
				{:else}
					<form method="POST" action="?/convert" class="mt-3 space-y-3" use:enhance>
						<input type="hidden" name="clientId" value={data.quote.clientId} />
						<input type="hidden" name="quotedTotalTzs" value={data.quote.totalTzs} />
						<select name="serviceId" required class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">
							<option value="">Select a service</option>
							{#each data.services as service (service.id)}
								<option value={service.id}>{service.name}</option>
							{/each}
						</select>
						<input name="scheduledDate" type="date" required class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
						<input name="scheduledTime" type="time" value="08:00" class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
						<input name="durationMinutes" type="number" min="30" step="30" value="120" class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
						<button type="submit" class="w-full rounded-brand border border-brand-600 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">
							Create booking
						</button>
					</form>
				{/if}
			</div>

			<form method="POST" action="?/delete" use:enhance>
				<button type="submit" class="text-sm text-muted-foreground transition hover:text-danger" onclick={(event) => { if (!confirm('Delete this quote?')) event.preventDefault(); }}>
					Delete quote
				</button>
			</form>
		</section>
	</div>
</div>
