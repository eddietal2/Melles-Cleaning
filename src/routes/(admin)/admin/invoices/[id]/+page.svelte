<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatDate, formatDateTime, toDateInputValue } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import {
		INVOICE_STATUS_LABELS,
		PAYMENT_METHOD_LABELS,
		badgeClass,
		invoiceStatusTone
	} from '$lib/utils/status';

	let { data }: PageProps = $props();

	const paid = $derived(data.invoice.payments.reduce((sum, payment) => sum + payment.amountTzs, 0));
	const balance = $derived(Math.max(data.invoice.totalTzs - paid, 0));

	const rows = $derived([
		...data.invoice.lineItems,
		{ id: 'blank-1', description: '', quantity: 1, unitPriceTzs: 0 }
	]);
</script>

<div class="space-y-8">
	<div>
		<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/invoices">← Invoices</a>
		<div class="mt-1 flex flex-wrap items-center gap-3">
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">{data.invoice.invoiceNumber}</h1>
			<span class={badgeClass(invoiceStatusTone(data.invoice.status))}>{INVOICE_STATUS_LABELS[data.invoice.status]}</span>
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			{data.invoice.client.displayName} · due {formatDate(data.invoice.dueDate)}
		</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-3">
		<section class="rounded-brand border border-border bg-background p-5 shadow-card lg:col-span-2">
			<h2 class="text-sm font-semibold text-foreground">Line items</h2>
			<form method="POST" action="?/update" class="mt-4 space-y-4" use:enhance>
				<input type="hidden" name="bookingId" value={data.invoice.bookingId ?? ''} />
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="clientId" class="block text-sm font-medium text-foreground">Client</label>
						<select id="clientId" name="clientId" class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">
							{#each data.clients as client (client.id)}
								<option value={client.id} selected={client.id === data.invoice.clientId}>{client.displayName}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="dueDate" class="block text-sm font-medium text-foreground">Due date</label>
						<input id="dueDate" name="dueDate" type="date" value={toDateInputValue(data.invoice.dueDate)} class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
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

				<div>
					<label for="discountTzs" class="block text-sm font-medium text-foreground">Discount (TZS)</label>
					<input id="discountTzs" name="discountTzs" type="number" min="0" step="1000" value={data.invoice.discountTzs} class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600 sm:max-w-xs" />
				</div>

				<div class="flex flex-wrap items-center justify-between gap-3">
					<button type="submit" class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
						Save invoice
					</button>
					<dl class="text-right text-sm">
						<div class="flex justify-end gap-6">
							<dt class="text-muted-foreground">Subtotal</dt>
							<dd>{formatTzs(data.invoice.subtotalTzs)}</dd>
						</div>
						<div class="flex justify-end gap-6">
							<dt class="text-muted-foreground">Discount</dt>
							<dd>− {formatTzs(data.invoice.discountTzs)}</dd>
						</div>
						<div class="mt-1 flex justify-end gap-6 text-base font-semibold">
							<dt>Total</dt>
							<dd>{formatTzs(data.invoice.totalTzs)}</dd>
						</div>
					</dl>
				</div>
			</form>
		</section>

		<section class="space-y-6">
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Balance</h2>
				<p class="mt-2 text-2xl font-semibold text-foreground">{formatTzs(balance)}</p>
				<p class="text-xs text-muted-foreground">Paid {formatTzs(paid)} of {formatTzs(data.invoice.totalTzs)}</p>

				<div class="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
					{#if ['DRAFT', 'ISSUED', 'PARTIAL', 'OVERDUE'].includes(data.invoice.status)}
						<form method="POST" action="?/issue" use:enhance>
							<button type="submit" class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700">
								Issue invoice
							</button>
						</form>
					{/if}
					{#if data.invoice.status !== 'VOID'}
						<form method="POST" action="?/void" use:enhance>
							<button type="submit" class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-danger hover:text-danger">
								Void
							</button>
						</form>
					{/if}
				</div>
			</div>

			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Record a payment</h2>
				<form method="POST" action="?/recordPayment" class="mt-3 space-y-3" use:enhance>
					<input name="amountTzs" type="number" min="1" step="1000" placeholder="Amount (TZS)" value={balance} required class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
					<select name="method" class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600">
						{#each Object.entries(PAYMENT_METHOD_LABELS) as [value, label] (value)}
							<option {value}>{label}</option>
						{/each}
					</select>
					<input name="reference" placeholder="Reference (optional)" class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
					<input name="receivedAt" type="date" class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600" />
					<button type="submit" class="w-full rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700">
						Record payment
					</button>
				</form>
			</div>

			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Payments</h2>
				<ul class="mt-3 space-y-3 text-sm">
					{#each data.invoice.payments as payment (payment.id)}
						<li class="flex items-start justify-between gap-3">
							<div>
								<p class="font-medium text-foreground">{formatTzs(payment.amountTzs)}</p>
								<p class="text-xs text-muted-foreground">
									{PAYMENT_METHOD_LABELS[payment.method]} · {formatDateTime(payment.receivedAt)}
									{#if payment.reference}· {payment.reference}{/if}
								</p>
							</div>
							<form method="POST" action="?/deletePayment" use:enhance>
								<input type="hidden" name="id" value={payment.id} />
								<button type="submit" class="text-xs text-muted-foreground hover:text-danger">Remove</button>
							</form>
						</li>
					{:else}
						<li class="text-muted-foreground">No payments recorded.</li>
					{/each}
				</ul>
			</div>
		</section>
	</div>
</div>
