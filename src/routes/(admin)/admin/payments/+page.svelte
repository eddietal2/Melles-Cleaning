<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatDateTime } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import { PAYMENT_METHOD_LABELS } from '$lib/utils/status';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});

	function balanceOf(invoice: { totalTzs: number; payments: { amountTzs: number }[] }) {
		const paid = invoice.payments.reduce((sum, payment) => sum + payment.amountTzs, 0);
		return Math.max(invoice.totalTzs - paid, 0);
	}
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Payments</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Cash and mobile-money receipts. Recording a payment automatically reconciles its invoice.
		</p>
	</div>

	<details class="rounded-brand border border-border bg-background shadow-card" open>
		<summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-foreground">Record a payment</summary>
		<form method="POST" action="?/create" class="grid gap-4 border-t border-border p-5 sm:grid-cols-2" use:enhance>
			<div class="sm:col-span-2">
				<label for="invoiceId" class="block text-sm font-medium text-foreground">Invoice</label>
				<select id="invoiceId" name="invoiceId" required class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">
					<option value="">Select an open invoice</option>
					{#each data.openInvoices as invoice (invoice.id)}
						<option value={invoice.id}>
							{invoice.invoiceNumber} · {invoice.client.displayName} · balance {formatTzs(balanceOf(invoice))}
						</option>
					{/each}
				</select>
				{#if errors.invoiceId}<p class="mt-1 text-xs text-danger">{errors.invoiceId}</p>{/if}
			</div>
			<div>
				<label for="amountTzs" class="block text-sm font-medium text-foreground">Amount (TZS)</label>
				<input id="amountTzs" name="amountTzs" type="number" min="1" step="1000" required class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
				{#if errors.amountTzs}<p class="mt-1 text-xs text-danger">{errors.amountTzs}</p>{/if}
			</div>
			<div>
				<label for="method" class="block text-sm font-medium text-foreground">Method</label>
				<select id="method" name="method" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">
					{#each Object.entries(PAYMENT_METHOD_LABELS) as [value, label] (value)}
						<option {value}>{label}</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="reference" class="block text-sm font-medium text-foreground">Reference</label>
				<input id="reference" name="reference" placeholder="e.g. M-Pesa code" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
			</div>
			<div>
				<label for="receivedAt" class="block text-sm font-medium text-foreground">Received on</label>
				<input id="receivedAt" name="receivedAt" type="date" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
			</div>
			<div class="sm:col-span-2">
				<button type="submit" class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
					Record payment
				</button>
			</div>
		</form>
	</details>

	<div class="overflow-hidden rounded-brand border border-border bg-background shadow-card">
		<table class="min-w-full divide-y divide-border text-sm">
			<thead class="bg-surface-muted text-left text-xs tracking-wide text-muted-foreground uppercase">
				<tr>
					<th class="px-5 py-3 font-medium">Received</th>
					<th class="px-5 py-3 font-medium">Invoice</th>
					<th class="px-5 py-3 font-medium">Client</th>
					<th class="px-5 py-3 font-medium">Method</th>
					<th class="px-5 py-3 font-medium">Reference</th>
					<th class="px-5 py-3 font-medium">Amount</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-border">
				{#each data.payments as payment (payment.id)}
					<tr>
						<td class="px-5 py-3 text-muted-foreground">{formatDateTime(payment.receivedAt)}</td>
						<td class="px-5 py-3">
							<a href="/admin/invoices/{payment.invoiceId}" class="text-foreground hover:text-brand-700">{payment.invoice.invoiceNumber}</a>
						</td>
						<td class="px-5 py-3 text-muted-foreground">{payment.invoice.client.displayName}</td>
						<td class="px-5 py-3 text-muted-foreground">{PAYMENT_METHOD_LABELS[payment.method]}</td>
						<td class="px-5 py-3 text-muted-foreground">{payment.reference ?? '—'}</td>
						<td class="px-5 py-3 font-medium text-foreground">{formatTzs(payment.amountTzs)}</td>
					</tr>
				{:else}
					<tr><td class="px-5 py-6 text-muted-foreground" colspan="6">No payments recorded.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>
