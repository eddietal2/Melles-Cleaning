<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatDate } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import { INVOICE_STATUS_LABELS, badgeClass, invoiceStatusTone } from '$lib/utils/status';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});
	const message = $derived((form as { message?: string } | null)?.message);

	function paidOf(payments: { amountTzs: number }[]) {
		return payments.reduce((sum, payment) => sum + payment.amountTzs, 0);
	}
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Invoices</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Generate from a booking or build manually. Balances update automatically as payments are
			recorded.
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
		<TableSkeleton rows={6} columns={6} />
	{:then payload}
		<details class="rounded-brand border border-border bg-background shadow-card">
			<summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-foreground"
				>New invoice</summary
			>
			<form
				method="POST"
				action="?/create"
				class="space-y-4 border-t border-border p-5"
				use:enhance
			>
				<div class="grid gap-4 sm:grid-cols-3">
					<div>
						<label for="clientId" class="block text-sm font-medium text-foreground">Client</label>
						<select
							id="clientId"
							name="clientId"
							required
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						>
							<option value="">Select a client</option>
							{#each payload.clients as client (client.id)}
								<option value={client.id}>{client.displayName}</option>
							{/each}
						</select>
						{#if errors.clientId}<p class="mt-1 text-xs text-danger">{errors.clientId}</p>{/if}
					</div>
					<div>
						<label for="bookingId" class="block text-sm font-medium text-foreground"
							>From booking</label
						>
						<select
							id="bookingId"
							name="bookingId"
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						>
							<option value="">None — build manually</option>
							{#each payload.bookings as booking (booking.id)}
								<option value={booking.id}
									>{booking.bookingNumber} · {booking.client.displayName} · {formatTzs(
										booking.quotedTotalTzs
									)}</option
								>
							{/each}
						</select>
					</div>
					<div>
						<label for="dueDate" class="block text-sm font-medium text-foreground">Due date</label>
						<input
							id="dueDate"
							name="dueDate"
							type="date"
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						/>
					</div>
				</div>

				<div class="rounded-brand border border-border">
					<div
						class="grid grid-cols-12 gap-2 border-b border-border bg-surface-muted px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
					>
						<span class="col-span-6">Description</span>
						<span class="col-span-2">Qty</span>
						<span class="col-span-4">Unit price (TZS)</span>
					</div>
					<div class="grid grid-cols-12 gap-2 p-3">
						<input
							name="description"
							placeholder="Optional when a booking is chosen"
							class="col-span-6 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						/>
						<input
							name="quantity"
							type="number"
							min="1"
							value="1"
							class="col-span-2 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						/>
						<input
							name="unitPriceTzs"
							type="number"
							min="0"
							step="1000"
							value="0"
							class="col-span-4 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						/>
					</div>
				</div>

				<button
					type="submit"
					class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
				>
					Create invoice
				</button>
			</form>
		</details>

		<div class="overflow-hidden rounded-brand border border-border bg-background shadow-card">
			<table class="min-w-full divide-y divide-border text-sm">
				<thead
					class="bg-surface-muted text-left text-xs tracking-wide text-muted-foreground uppercase"
				>
					<tr>
						<th class="px-5 py-3 font-medium">Invoice</th>
						<th class="px-5 py-3 font-medium">Client</th>
						<th class="px-5 py-3 font-medium">Issued</th>
						<th class="px-5 py-3 font-medium">Total</th>
						<th class="px-5 py-3 font-medium">Balance</th>
						<th class="px-5 py-3 font-medium">Status</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each payload.invoices as invoice (invoice.id)}
						{@const balance = Math.max(invoice.totalTzs - paidOf(invoice.payments), 0)}
						<tr>
							<td class="px-5 py-3">
								<a
									href="/admin/invoices/{invoice.id}"
									class="font-medium text-foreground hover:text-brand-700"
									>{invoice.invoiceNumber}</a
								>
								{#if invoice.booking}<p class="text-xs text-muted-foreground">
										{invoice.booking.bookingNumber}
									</p>{/if}
							</td>
							<td class="px-5 py-3 text-muted-foreground">{invoice.client.displayName}</td>
							<td class="px-5 py-3 text-muted-foreground"
								>{formatDate(invoice.issuedAt ?? invoice.createdAt)}</td
							>
							<td class="px-5 py-3 text-muted-foreground">{formatTzs(invoice.totalTzs)}</td>
							<td class="px-5 py-3 {balance > 0 ? 'text-foreground' : 'text-success'}"
								>{formatTzs(balance)}</td
							>
							<td class="px-5 py-3">
								<span class={badgeClass(invoiceStatusTone(invoice.status))}
									>{INVOICE_STATUS_LABELS[invoice.status]}</span
								>
							</td>
						</tr>
					{:else}
						<tr><td class="px-5 py-6 text-muted-foreground" colspan="6">No invoices yet.</td></tr>
					{/each}
				</tbody>
			</table>
		</div>
	{:catch}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			Could not load invoices. Please refresh the page.
		</p>
	{/await}
</div>
