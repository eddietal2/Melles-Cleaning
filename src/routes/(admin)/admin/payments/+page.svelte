<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { formatDateTime } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import { PAYMENT_METHOD_CODES, paymentMethodLabel } from '$lib/utils/status';
	import TableSkeleton from '$lib/components/ui/table-skeleton.svelte';

	let { data, form }: PageProps = $props();

	const errors = $derived((form as { errors?: Record<string, string> } | null)?.errors ?? {});

	function balanceOf(invoice: { totalTzs: number; payments: { amountTzs: number }[] }) {
		const paid = invoice.payments.reduce((sum, payment) => sum + payment.amountTzs, 0);
		return Math.max(invoice.totalTzs - paid, 0);
	}
</script>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">
			{m.admin_payments_title()}
		</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			{m.admin_payments_intro()}
		</p>
	</div>

	{#await data.streamed}
		<TableSkeleton rows={6} columns={5} />
	{:then payload}
		<details class="rounded-brand border border-border bg-background shadow-card" open>
			<summary class="cursor-pointer px-5 py-4 text-sm font-semibold text-foreground"
				>{m.admin_invoices_record_payment_heading()}</summary
			>
			<form
				method="POST"
				action="?/create"
				class="grid gap-4 border-t border-border p-5 sm:grid-cols-2"
				use:enhance
			>
				<div class="sm:col-span-2">
					<label for="invoiceId" class="block text-sm font-medium text-foreground"
						>{m.common_invoice()}</label
					>
					<select
						id="invoiceId"
						name="invoiceId"
						required
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						<option value="">{m.admin_payments_select_invoice()}</option>
						{#each payload.openInvoices as invoice (invoice.id)}
							<option value={invoice.id}>
								{m.admin_payments_invoice_option({
									number: invoice.invoiceNumber,
									client: invoice.client.displayName,
									amount: formatTzs(balanceOf(invoice))
								})}
							</option>
						{/each}
					</select>
					{#if errors.invoiceId}<p class="mt-1 text-xs text-danger">{errors.invoiceId}</p>{/if}
				</div>
				<div>
					<label for="amountTzs" class="block text-sm font-medium text-foreground"
						>{m.common_amount_tzs()}</label
					>
					<input
						id="amountTzs"
						name="amountTzs"
						type="number"
						min="1"
						step="1000"
						required
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
					{#if errors.amountTzs}<p class="mt-1 text-xs text-danger">{errors.amountTzs}</p>{/if}
				</div>
				<div>
					<label for="method" class="block text-sm font-medium text-foreground"
						>{m.common_method()}</label
					>
					<select
						id="method"
						name="method"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						{#each PAYMENT_METHOD_CODES as value (value)}
							<option {value}>{paymentMethodLabel(value)}</option>
						{/each}
					</select>
				</div>
				<div>
					<label for="reference" class="block text-sm font-medium text-foreground"
						>{m.common_reference()}</label
					>
					<input
						id="reference"
						name="reference"
						placeholder={m.admin_payments_reference_placeholder()}
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div>
					<label for="receivedAt" class="block text-sm font-medium text-foreground"
						>{m.admin_payments_received_on()}</label
					>
					<input
						id="receivedAt"
						name="receivedAt"
						type="date"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div class="sm:col-span-2">
					<button
						type="submit"
						class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
					>
						{m.admin_invoices_record_payment()}
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
						<th class="px-5 py-3 font-medium">{m.admin_payments_col_received()}</th>
						<th class="px-5 py-3 font-medium">{m.common_invoice()}</th>
						<th class="px-5 py-3 font-medium">{m.common_client()}</th>
						<th class="px-5 py-3 font-medium">{m.common_method()}</th>
						<th class="px-5 py-3 font-medium">{m.common_reference()}</th>
						<th class="px-5 py-3 font-medium">{m.common_amount()}</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-border">
					{#each payload.payments as payment (payment.id)}
						<tr>
							<td class="px-5 py-3 text-muted-foreground">{formatDateTime(payment.receivedAt)}</td>
							<td class="px-5 py-3">
								<a
									href="/admin/invoices/{payment.invoiceId}"
									class="text-foreground hover:text-brand-700">{payment.invoice.invoiceNumber}</a
								>
							</td>
							<td class="px-5 py-3 text-muted-foreground">{payment.invoice.client.displayName}</td>
							<td class="px-5 py-3 text-muted-foreground">{paymentMethodLabel(payment.method)}</td>
							<td class="px-5 py-3 text-muted-foreground">{payment.reference ?? '—'}</td>
							<td class="px-5 py-3 font-medium text-foreground">{formatTzs(payment.amountTzs)}</td>
						</tr>
					{:else}
						<tr>
							<td class="px-5 py-6 text-muted-foreground" colspan="6">
								{m.admin_invoices_no_payments()}
							</td>
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
			{m.admin_payments_error()}
		</p>
	{/await}
</div>
