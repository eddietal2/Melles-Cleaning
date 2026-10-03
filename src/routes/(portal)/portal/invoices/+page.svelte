<script lang="ts">
	import type { PageProps } from './$types';
	import { formatDate } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import { INVOICE_STATUS_LABELS, badgeClass, invoiceStatusTone } from '$lib/utils/status';

	let { data }: PageProps = $props();

	function balanceOf(invoice: { totalTzs: number; payments: { amountTzs: number }[] }) {
		const paid = invoice.payments.reduce((sum, payment) => sum + payment.amountTzs, 0);
		return Math.max(invoice.totalTzs - paid, 0);
	}
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight text-foreground">Your invoices</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Balances update as soon as a payment is recorded. Pay by cash or mobile money.
		</p>
	</div>

	<div class="space-y-3">
		{#each data.invoices as invoice (invoice.id)}
			{@const balance = balanceOf(invoice)}
			<article class="rounded-brand border border-border bg-background p-5 shadow-card">
				<div class="flex flex-wrap items-start justify-between gap-3">
					<div>
						<div class="flex items-center gap-2">
							<h2 class="text-sm font-semibold text-foreground">{invoice.invoiceNumber}</h2>
							<span class={badgeClass(invoiceStatusTone(invoice.status))}>
								{INVOICE_STATUS_LABELS[invoice.status]}
							</span>
						</div>
						<p class="mt-1 text-xs text-muted-foreground">
							Issued {formatDate(invoice.issuedAt ?? invoice.createdAt)} · due {formatDate(invoice.dueDate)}
							{#if invoice.booking}· {invoice.booking.bookingNumber}{/if}
						</p>
					</div>
					<div class="text-right">
						<p class="text-sm text-muted-foreground">Total {formatTzs(invoice.totalTzs)}</p>
						<p class="text-sm font-semibold {balance > 0 ? 'text-foreground' : 'text-success'}">
							{balance > 0 ? `Balance ${formatTzs(balance)}` : 'Paid in full'}
						</p>
					</div>
				</div>

				<ul class="mt-3 divide-y divide-border border-t border-border pt-2 text-sm">
					{#each invoice.lineItems as item (item.id)}
						<li class="flex items-center justify-between py-1">
							<span class="text-muted-foreground">{item.description}</span>
							<span class="text-foreground">{formatTzs(item.lineTotalTzs)}</span>
						</li>
					{/each}
				</ul>

				{#if invoice.payments.length > 0}
					<div class="mt-3 border-t border-border pt-2">
						<p class="text-xs tracking-wide text-muted-foreground uppercase">Payments received</p>
						<ul class="mt-1 space-y-1 text-sm">
							{#each invoice.payments as payment (payment.id)}
								<li class="flex items-center justify-between text-muted-foreground">
									<span>{formatDate(payment.receivedAt)}</span>
									<span>{formatTzs(payment.amountTzs)}</span>
								</li>
							{/each}
						</ul>
					</div>
				{/if}
			</article>
		{:else}
			<p class="rounded-brand border border-border bg-background p-6 text-sm text-muted-foreground shadow-card">
				You have no invoices yet.
			</p>
		{/each}
	</div>
</div>
