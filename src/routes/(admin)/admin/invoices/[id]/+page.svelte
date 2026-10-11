<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import * as m from '$lib/paraglide/messages.js';
	import { formatDate, formatDateTime, toDateInputValue } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import {
		PAYMENT_METHOD_CODES,
		badgeClass,
		invoiceStatusLabel,
		invoiceStatusTone,
		paymentMethodLabel
	} from '$lib/utils/status';

	let { data, form }: PageProps = $props();

	const message = $derived((form as { message?: string } | null)?.message);

	const paid = $derived(data.invoice.payments.reduce((sum, payment) => sum + payment.amountTzs, 0));
	const balance = $derived(Math.max(data.invoice.totalTzs - paid, 0));

	const rows = $derived([
		...data.invoice.lineItems,
		{ id: 'blank-1', description: '', quantity: 1, unitPriceTzs: 0 }
	]);
</script>

<div class="space-y-8">
	<div>
		<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/invoices"
			>{m.admin_invoices_back()}</a
		>
		<div class="mt-1 flex flex-wrap items-center gap-3">
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">
				{data.invoice.invoiceNumber}
			</h1>
			<span class={badgeClass(invoiceStatusTone(data.invoice.status))}
				>{invoiceStatusLabel(data.invoice.status)}</span
			>
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			{m.admin_invoices_due_line({
				client: data.invoice.client.displayName,
				date: formatDate(data.invoice.dueDate)
			})}
		</p>
	</div>

	{#if message}
		<p
			class="rounded-brand border border-border bg-surface-muted px-3 py-2 text-sm text-foreground"
			role="status"
		>
			{message}
		</p>
	{/if}

	<div class="grid gap-6 lg:grid-cols-3">
		<section class="rounded-brand border border-border bg-background p-5 shadow-card lg:col-span-2">
			<h2 class="text-sm font-semibold text-foreground">{m.admin_invoices_line_items()}</h2>
			<form method="POST" action="?/update" class="mt-4 space-y-4" use:enhance>
				<input type="hidden" name="bookingId" value={data.invoice.bookingId ?? ''} />
				<div class="grid gap-4 sm:grid-cols-2">
					<div>
						<label for="clientId" class="block text-sm font-medium text-foreground"
							>{m.common_client()}</label
						>
						<select
							id="clientId"
							name="clientId"
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						>
							{#each data.clients as client (client.id)}
								<option value={client.id} selected={client.id === data.invoice.clientId}
									>{client.displayName}</option
								>
							{/each}
						</select>
					</div>
					<div>
						<label for="dueDate" class="block text-sm font-medium text-foreground"
							>{m.admin_invoices_due_date()}</label
						>
						<input
							id="dueDate"
							name="dueDate"
							type="date"
							value={toDateInputValue(data.invoice.dueDate)}
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						/>
					</div>
				</div>

				<div class="rounded-brand border border-border">
					<div
						class="grid grid-cols-12 gap-2 border-b border-border bg-surface-muted px-3 py-2 text-xs font-medium tracking-wide text-muted-foreground uppercase"
					>
						<span class="col-span-6">{m.common_description()}</span>
						<span class="col-span-2">{m.common_quantity()}</span>
						<span class="col-span-4">{m.common_unit_price()}</span>
					</div>
					{#each rows as row (row.id)}
						<div class="grid grid-cols-12 gap-2 border-b border-border p-3 last:border-b-0">
							<input
								name="description"
								value={row.description}
								placeholder={m.common_description()}
								class="col-span-6 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
							/>
							<input
								name="quantity"
								type="number"
								min="1"
								value={row.quantity}
								class="col-span-2 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
							/>
							<input
								name="unitPriceTzs"
								type="number"
								min="0"
								step="1000"
								value={row.unitPriceTzs}
								class="col-span-4 rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
							/>
						</div>
					{/each}
				</div>

				<div>
					<label for="discountTzs" class="block text-sm font-medium text-foreground"
						>{m.common_discount_tzs()}</label
					>
					<input
						id="discountTzs"
						name="discountTzs"
						type="number"
						min="0"
						step="1000"
						value={data.invoice.discountTzs}
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600 sm:max-w-xs"
					/>
				</div>

				<div class="flex flex-wrap items-center justify-between gap-3">
					<button
						type="submit"
						class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
					>
						{m.admin_invoices_save()}
					</button>
					<dl class="text-right text-sm">
						<div class="flex justify-end gap-6">
							<dt class="text-muted-foreground">{m.common_subtotal()}</dt>
							<dd>{formatTzs(data.invoice.subtotalTzs)}</dd>
						</div>
						<div class="flex justify-end gap-6">
							<dt class="text-muted-foreground">{m.common_discount()}</dt>
							<dd>− {formatTzs(data.invoice.discountTzs)}</dd>
						</div>
						<div class="mt-1 flex justify-end gap-6 text-base font-semibold">
							<dt>{m.common_total()}</dt>
							<dd>{formatTzs(data.invoice.totalTzs)}</dd>
						</div>
					</dl>
				</div>
			</form>
		</section>

		<section class="space-y-6">
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">{m.common_balance()}</h2>
				<p class="mt-2 text-2xl font-semibold text-foreground">{formatTzs(balance)}</p>
				<p class="text-xs text-muted-foreground">
					{m.admin_invoices_paid_of({
						paid: formatTzs(paid),
						total: formatTzs(data.invoice.totalTzs)
					})}
				</p>

				<div class="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
					{#if ['DRAFT', 'ISSUED', 'PARTIAL', 'OVERDUE'].includes(data.invoice.status)}
						<form method="POST" action="?/issue" use:enhance>
							<button
								type="submit"
								class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700"
							>
								{m.admin_invoices_issue()}
							</button>
						</form>
					{/if}
					{#if data.invoice.status !== 'VOID'}
						<form method="POST" action="?/void" use:enhance>
							<button
								type="submit"
								class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-danger hover:text-danger"
							>
								{m.admin_invoices_void()}
							</button>
						</form>
					{/if}
				</div>
			</div>

			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">{m.admin_invoices_promotions()}</h2>
				<div class="mt-3 flex flex-wrap gap-2">
					<form method="POST" action="?/applyFirstClean" use:enhance>
						<button
							type="submit"
							class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700"
						>
							{m.admin_invoices_apply_first_clean()}
						</button>
					</form>
					<form method="POST" action="?/applyReferralCredit" use:enhance>
						<button
							type="submit"
							class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700"
						>
							{m.admin_invoices_apply_referral()}
						</button>
					</form>
				</div>

				<h2 class="mt-5 text-sm font-semibold text-foreground">
					{m.admin_invoices_request_mobile()}
				</h2>
				<form
					method="POST"
					action="?/requestMobileMoney"
					class="mt-2 flex flex-wrap gap-2"
					use:enhance
				>
					<input
						name="phone"
						placeholder={m.admin_invoices_phone_placeholder()}
						class="min-w-40 flex-1 rounded-brand border-border text-sm shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
					<button
						type="submit"
						class="rounded-brand border border-border px-3 py-2 text-xs font-medium text-foreground hover:border-brand-500 hover:text-brand-700"
					>
						{m.admin_invoices_send_request()}
					</button>
				</form>

				<h2 class="mt-5 text-sm font-semibold text-foreground">
					{m.admin_invoices_send_to_client()}
				</h2>
				<div class="mt-2 flex flex-wrap gap-2">
					<form method="POST" action="?/notifyIssued" use:enhance>
						<button
							type="submit"
							class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700"
						>
							{m.admin_invoices_send_invoice()}
						</button>
					</form>
					<form method="POST" action="?/notifyReminder" use:enhance>
						<button
							type="submit"
							class="rounded-brand border border-border px-3 py-1.5 text-xs font-medium text-foreground transition hover:border-brand-500 hover:text-brand-700"
						>
							{m.admin_invoices_send_reminder()}
						</button>
					</form>
				</div>
			</div>

			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">
					{m.admin_invoices_record_payment_heading()}
				</h2>
				<form method="POST" action="?/recordPayment" class="mt-3 space-y-3" use:enhance>
					<input
						name="amountTzs"
						type="number"
						min="1"
						step="1000"
						placeholder={m.common_amount_tzs()}
						value={balance}
						required
						class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
					<select
						name="method"
						class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>
						{#each PAYMENT_METHOD_CODES as value (value)}
							<option {value}>{paymentMethodLabel(value)}</option>
						{/each}
					</select>
					<input
						name="reference"
						placeholder={m.common_reference_optional()}
						class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
					<input
						name="receivedAt"
						type="date"
						class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
					<button
						type="submit"
						class="w-full rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
					>
						{m.admin_invoices_record_payment()}
					</button>
				</form>
			</div>

			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">{m.common_payments()}</h2>
				<ul class="mt-3 space-y-3 text-sm">
					{#each data.invoice.payments as payment (payment.id)}
						<li class="flex items-start justify-between gap-3">
							<div>
								<p class="font-medium text-foreground">{formatTzs(payment.amountTzs)}</p>
								<p class="text-xs text-muted-foreground">
									{paymentMethodLabel(payment.method)} · {formatDateTime(payment.receivedAt)}
									{#if payment.reference}· {payment.reference}{/if}
								</p>
							</div>
							<form method="POST" action="?/deletePayment" use:enhance>
								<input type="hidden" name="id" value={payment.id} />
								<button type="submit" class="text-xs text-muted-foreground hover:text-danger"
									>{m.common_remove()}</button
								>
							</form>
						</li>
					{:else}
						<li class="text-muted-foreground">{m.admin_invoices_no_payments()}</li>
					{/each}
				</ul>
			</div>
		</section>
	</div>
</div>
