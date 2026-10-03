<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import { formatDate, formatDateTime } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import {
		CLIENT_STATUS_LABELS,
		badgeClass,
		bookingStatusTone,
		quoteStatusTone,
		invoiceStatusTone,
		BOOKING_STATUS_LABELS,
		QUOTE_STATUS_LABELS,
		INVOICE_STATUS_LABELS,
		clientStatusTone
	} from '$lib/utils/status';

	let { data, form }: PageProps = $props();

	const message = $derived((form as { message?: string } | null)?.message);
	const invite = $derived(
		(form as { invite?: { email: string; password: string } } | null)?.invite
	);
</script>

<div class="space-y-8">
	<div>
		<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/clients"
			>← Clients</a
		>
		<div class="mt-1 flex flex-wrap items-center gap-3">
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">
				{data.client.displayName}
			</h1>
			<span class={badgeClass(clientStatusTone(data.client.status))}
				>{CLIENT_STATUS_LABELS[data.client.status]}</span
			>
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			Client since {formatDate(data.client.since)}
		</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<section class="rounded-brand border border-border bg-background p-5 shadow-card">
			<h2 class="text-sm font-semibold text-foreground">Profile</h2>
			<form method="POST" action="?/update" class="mt-4 space-y-3" use:enhance>
				<div>
					<label for="displayName" class="block text-sm font-medium text-foreground">Name</label>
					<input
						id="displayName"
						name="displayName"
						value={data.client.displayName}
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label for="clientType" class="block text-sm font-medium text-foreground">Type</label>
						<select
							id="clientType"
							name="clientType"
							value={data.client.clientType}
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						>
							<option value="RESIDENTIAL">Residential</option>
							<option value="COMMERCIAL">Commercial</option>
						</select>
					</div>
					<div>
						<label for="city" class="block text-sm font-medium text-foreground">City</label>
						<input
							id="city"
							name="city"
							value={data.client.city}
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						/>
					</div>
					<div>
						<label for="area" class="block text-sm font-medium text-foreground">Area</label>
						<input
							id="area"
							name="area"
							value={data.client.area ?? ''}
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						/>
					</div>
					<div>
						<label for="addressLine" class="block text-sm font-medium text-foreground"
							>Address</label
						>
						<input
							id="addressLine"
							name="addressLine"
							value={data.client.addressLine ?? ''}
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						/>
					</div>
				</div>
				<div>
					<label for="notes" class="block text-sm font-medium text-foreground">Notes</label>
					<textarea
						id="notes"
						name="notes"
						rows="3"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					>{data.client.notes ?? ''}</textarea>
				</div>
				<button
					type="submit"
					class="rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
				>
					Save changes
				</button>
			</form>
		</section>

		<section class="space-y-4">
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Contacts</h2>
				<ul class="mt-3 space-y-2">
					{#each data.client.contacts as contact (contact.id)}
						<li class="flex items-start justify-between gap-3 text-sm">
							<div>
								<p class="font-medium text-foreground">
									{contact.name}
									{#if contact.isPrimary}<span class="text-xs text-brand-700">· Primary</span>{/if}
								</p>
								<p class="text-xs text-muted-foreground">
									{contact.phone}{contact.email ? ` · ${contact.email}` : ''}
								</p>
							</div>
							<form method="POST" action="?/deleteContact" use:enhance>
								<input type="hidden" name="id" value={contact.id} />
								<button type="submit" class="text-xs text-muted-foreground hover:text-danger"
									>Remove</button
								>
							</form>
						</li>
					{:else}
						<li class="text-sm text-muted-foreground">No contacts on file.</li>
					{/each}
				</ul>

				<form
					method="POST"
					action="?/addContact"
					class="mt-4 grid gap-3 border-t border-border pt-4 sm:grid-cols-2"
					use:enhance
				>
					<input
						name="name"
						placeholder="Contact name"
						required
						class="rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
					<input
						name="phone"
						placeholder="Phone"
						required
						class="rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
					<input
						name="email"
						type="email"
						placeholder="Email (optional)"
						class="rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
					<button
						type="submit"
						class="rounded-brand border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-brand-500 hover:text-brand-700"
					>
						Add contact
					</button>
				</form>
			</div>

			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">Client portal</h2>
				{#if message}
					<p class="mt-2 text-sm text-danger" role="alert">{message}</p>
				{/if}

				{#if invite}
					<div class="mt-2 rounded-brand border border-success/30 bg-success/5 p-3 text-sm">
						<p class="font-medium text-success">Invite created</p>
						<p class="mt-1 text-foreground">Email: {invite.email}</p>
						<p class="text-foreground">Temporary password: <code>{invite.password}</code></p>
						<p class="mt-1 text-xs text-muted-foreground">
							Share these once — the client should change the password after signing in.
						</p>
					</div>
				{:else if data.portalUser}
					<p class="mt-2 text-sm text-foreground">
						Portal enabled for <span class="font-medium">{data.portalUser.email}</span>
					</p>
					<p class="text-xs text-muted-foreground">
						{data.portalUser.lastLoginAt
							? `Last signed in ${formatDateTime(data.portalUser.lastLoginAt)}`
							: 'Has not signed in yet.'}
					</p>
					<a
						href="/portal?client={data.client.id}"
						class="mt-3 inline-block text-sm text-brand-700 hover:underline">Preview portal →</a
					>
				{:else}
					<p class="mt-2 text-sm text-muted-foreground">
						Create a login for the primary contact so they can follow bookings, invoices and
						feedback.
					</p>
					<form method="POST" action="?/invitePortal" class="mt-3" use:enhance>
						<button
							type="submit"
							class="rounded-brand border border-border px-3 py-2 text-sm font-medium text-foreground hover:border-brand-500 hover:text-brand-700"
						>
							Invite to portal
						</button>
					</form>
				{/if}
			</div>
		</section>
	</div>

	<section class="rounded-brand border border-border bg-background p-5 shadow-card">
		<h2 class="text-sm font-semibold text-foreground">Recent jobs</h2>
		<ul class="mt-3 divide-y divide-border">
			{#each data.client.bookings.slice(0, 6) as booking (booking.id)}
				<li class="flex items-center justify-between gap-3 py-2 text-sm">
					<div>
						<a href="/admin/bookings/{booking.id}" class="font-medium text-foreground hover:text-brand-700"
							>{booking.bookingNumber}</a
						>
						<p class="text-xs text-muted-foreground">
							{booking.service.name} · {formatDateTime(booking.scheduledStart)}
						</p>
					</div>
					<span class={badgeClass(bookingStatusTone(booking.status))}
						>{BOOKING_STATUS_LABELS[booking.status]}</span
					>
				</li>
			{:else}
				<li class="py-3 text-sm text-muted-foreground">No jobs yet.</li>
			{/each}
		</ul>
	</section>

	<section class="grid gap-6 lg:grid-cols-2">
		<div class="rounded-brand border border-border bg-background p-5 shadow-card">
			<h2 class="text-sm font-semibold text-foreground">Quotes</h2>
			<ul class="mt-3 space-y-2 text-sm">
				{#each data.client.quotes as quote (quote.id)}
					<li class="flex items-center justify-between gap-3">
						<a href="/admin/quotes/{quote.id}" class="text-foreground hover:text-brand-700"
							>{quote.quoteNumber}</a
						>
						<span class="text-muted-foreground">{formatTzs(quote.totalTzs)}</span>
						<span class={badgeClass(quoteStatusTone(quote.status))}
							>{QUOTE_STATUS_LABELS[quote.status]}</span
						>
					</li>
				{:else}
					<li class="text-muted-foreground">No quotes yet.</li>
				{/each}
			</ul>
		</div>

		<div class="rounded-brand border border-border bg-background p-5 shadow-card">
			<h2 class="text-sm font-semibold text-foreground">Invoices</h2>
			<ul class="mt-3 space-y-2 text-sm">
				{#each data.client.invoices as invoice (invoice.id)}
					<li class="flex items-center justify-between gap-3">
						<a href="/admin/invoices/{invoice.id}" class="text-foreground hover:text-brand-700"
							>{invoice.invoiceNumber}</a
						>
						<span class="text-muted-foreground">{formatTzs(invoice.totalTzs)}</span>
						<span class={badgeClass(invoiceStatusTone(invoice.status))}
							>{INVOICE_STATUS_LABELS[invoice.status]}</span
						>
					</li>
				{:else}
					<li class="text-muted-foreground">No invoices yet.</li>
				{/each}
			</ul>
		</div>
	</section>
</div>
