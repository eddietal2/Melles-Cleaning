<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import PhoneInput from '$lib/components/ui/phone-input.svelte';
	import Spinner from '$lib/components/ui/spinner.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import { CLIENT_STATUSES } from '$lib/schemas/client';
	import { formatDate, formatDateTime } from '$lib/utils/dates';
	import { formatTzs } from '$lib/utils/currency';
	import { formatTzPhone } from '$lib/utils/phone';
	import { toast } from '$lib/utils/toast';
	import {
		badgeClass,
		bookingStatusLabel,
		bookingStatusTone,
		clientStatusLabel,
		clientStatusTone,
		invoiceStatusLabel,
		invoiceStatusTone,
		quoteStatusLabel,
		quoteStatusTone
	} from '$lib/utils/status';

	let { data, form }: PageProps = $props();

	const contactErrors = $derived(
		(form as { contactErrors?: Record<string, string> } | null)?.contactErrors ?? {}
	);

	/** The contact currently being edited inline, or null when the list is read-only. */
	let editingContactId = $state<string | null>(null);

	/** The add-contact inputs stay hidden until the owner asks for them. */
	let showAddContact = $state(false);

	/** True while a contact create/update request is in flight. */
	let savingContact = $state(false);

	/** True while the client profile is being saved. */
	let savingProfile = $state(false);

	/** The contact awaiting removal confirmation, or null when the dialog is closed. */
	let pendingContactDelete = $state<{ id: string; name: string } | null>(null);

	/** Submitted programmatically once the owner confirms a contact removal. */
	let contactDeleteForm = $state<HTMLFormElement | null>(null);

	/** True while the contact removal request is in flight. */
	let deletingContact = $state(false);
</script>

<div class="space-y-8">
	<div>
		<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/clients"
			>{m.admin_clients_back()}</a
		>
		<div class="mt-1 flex flex-wrap items-center gap-3">
			<h1 class="text-2xl font-semibold tracking-tight text-foreground">
				{data.client.displayName}
			</h1>
			<span class={badgeClass(clientStatusTone(data.client.status))}
				>{clientStatusLabel(data.client.status)}</span
			>
		</div>
		<p class="mt-1 text-sm text-muted-foreground">
			{m.admin_clients_since({ date: formatDate(data.client.since) })}
		</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-2">
		<section class="rounded-brand border border-border bg-background p-5 shadow-card">
			<h2 class="text-sm font-semibold text-foreground">{m.admin_clients_profile()}</h2>
			<form
				method="POST"
				action="?/update"
				class="mt-4 space-y-3"
				use:enhance={() => {
					savingProfile = true;
					return async ({ result, update }) => {
						await update({ reset: false });
						savingProfile = false;
						if (result.type === 'success') toast.success(m.admin_clients_toast_updated());
					};
				}}
			>
				<div>
					<label for="displayName" class="block text-sm font-medium text-foreground"
						>{m.common_name()}</label
					>
					<input
						id="displayName"
						name="displayName"
						value={data.client.displayName}
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
					/>
				</div>
				<div class="grid gap-3 sm:grid-cols-2">
					<div>
						<label for="clientType" class="block text-sm font-medium text-foreground"
							>{m.common_type()}</label
						>
						<select
							id="clientType"
							name="clientType"
							value={data.client.clientType}
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						>
							<option value="RESIDENTIAL">{m.status_client_type_residential()}</option>
							<option value="COMMERCIAL">{m.status_client_type_commercial()}</option>
						</select>
					</div>
					<div>
						<label for="status" class="block text-sm font-medium text-foreground"
							>{m.common_status()}</label
						>
						<select
							id="status"
							name="status"
							value={data.client.status}
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						>
							{#each CLIENT_STATUSES as status (status)}
								<option value={status}>{clientStatusLabel(status)}</option>
							{/each}
						</select>
					</div>
					<div>
						<label for="city" class="block text-sm font-medium text-foreground"
							>{m.common_city()}</label
						>
						<input
							id="city"
							name="city"
							value={data.client.city}
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						/>
					</div>
					<div>
						<label for="area" class="block text-sm font-medium text-foreground"
							>{m.common_area()}</label
						>
						<input
							id="area"
							name="area"
							value={data.client.area ?? ''}
							class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						/>
					</div>
					<div>
						<label for="addressLine" class="block text-sm font-medium text-foreground"
							>{m.common_address()}</label
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
					<label for="notes" class="block text-sm font-medium text-foreground"
						>{m.common_notes()}</label
					>
					<textarea
						id="notes"
						name="notes"
						rows="3"
						class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						>{data.client.notes ?? ''}</textarea
					>
				</div>
				<button
					type="submit"
					disabled={savingProfile}
					class="inline-flex items-center gap-2 rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{#if savingProfile}<Spinner class="h-4 w-4" />{/if}
					{m.common_save_changes()}
				</button>
			</form>
		</section>

		<section class="space-y-4">
			<div class="rounded-brand border border-border bg-background p-5 shadow-card">
				<h2 class="text-sm font-semibold text-foreground">{m.admin_clients_contacts()}</h2>
				<ul class="mt-3 space-y-2">
					{#each data.client.contacts as contact (contact.id)}
						<li class="text-sm">
							<div class="flex items-start justify-between gap-3">
								<div>
									<p class="font-medium text-foreground">
										{contact.name}
										{#if contact.isPrimary}<span class="text-xs text-brand-700"
												>{m.admin_clients_primary()}</span
											>{/if}
									</p>
									<p class="text-xs text-muted-foreground">
										{formatTzPhone(contact.phone)}{contact.email ? ` · ${contact.email}` : ''}
									</p>
								</div>
								<div class="flex shrink-0 items-center gap-3">
									<button
										type="button"
										class="text-xs font-medium text-brand-700 transition hover:text-brand-800"
										onclick={() =>
											(editingContactId = editingContactId === contact.id ? null : contact.id)}
									>
										{editingContactId === contact.id ? m.common_cancel() : m.common_edit()}
									</button>
									<button
										type="button"
										class="text-xs text-muted-foreground hover:text-danger"
										onclick={() => (pendingContactDelete = contact)}
									>
										{m.common_remove()}
									</button>
								</div>
							</div>

							{#if editingContactId === contact.id}
								<form
									method="POST"
									action="?/updateContact"
									class="mt-3 grid gap-3 rounded-brand border border-border bg-surface-muted p-3 sm:grid-cols-2"
									use:enhance={() => {
										savingContact = true;
										return async ({ result, update }) => {
											// Keep the entered values until we know the save succeeded.
											await update({ reset: false });
											savingContact = false;
											if (result.type === 'success') {
												editingContactId = null;
												toast.success(m.admin_clients_contact_updated());
											}
										};
									}}
								>
									<input type="hidden" name="id" value={contact.id} />
									<div>
										<label for="contact-name-{contact.id}" class="sr-only">{m.common_name()}</label>
										<input
											id="contact-name-{contact.id}"
											name="name"
											value={contact.name}
											required
											placeholder={m.admin_clients_contact_name_placeholder()}
											class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
										/>
										{#if contactErrors.name}<p class="mt-1 text-xs text-danger">
												{contactErrors.name}
											</p>{/if}
									</div>
									<div>
										<label for="contact-phone-{contact.id}" class="sr-only"
											>{m.common_phone()}</label
										>
										<PhoneInput
											id="contact-phone-{contact.id}"
											name="phone"
											value={contact.phone}
											required
										/>
										{#if contactErrors.phone}<p class="mt-1 text-xs text-danger">
												{contactErrors.phone}
											</p>{/if}
									</div>
									<div>
										<label for="contact-email-{contact.id}" class="sr-only"
											>{m.common_email()}</label
										>
										<input
											id="contact-email-{contact.id}"
											name="email"
											type="email"
											value={contact.email ?? ''}
											placeholder={m.common_email_optional_placeholder()}
											class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
										/>
										{#if contactErrors.email}<p class="mt-1 text-xs text-danger">
												{contactErrors.email}
											</p>{/if}
									</div>
									<div>
										<label for="contact-role-{contact.id}" class="sr-only">{m.common_role()}</label>
										<input
											id="contact-role-{contact.id}"
											name="role"
											value={contact.role ?? ''}
											placeholder={m.common_role_optional_placeholder()}
											class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
										/>
									</div>
									<div class="sm:col-span-2">
										<button
											type="submit"
											disabled={savingContact}
											class="inline-flex items-center gap-2 rounded-brand bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
										>
											{#if savingContact}<Spinner class="h-4 w-4" />{/if}
											{m.admin_clients_save_contact()}
										</button>
									</div>
								</form>
							{/if}
						</li>
					{:else}
						<li class="text-sm text-muted-foreground">{m.admin_clients_no_contacts()}</li>
					{/each}
				</ul>

				<div class="mt-4 border-t border-border pt-4">
					{#if showAddContact}
						<form
							method="POST"
							action="?/addContact"
							class="grid gap-3 sm:grid-cols-2"
							use:enhance={() => {
								savingContact = true;
								return async ({ result, update }) => {
									// Keep the entered values until we know the save succeeded.
									await update({ reset: false });
									savingContact = false;
									if (result.type === 'success') {
										showAddContact = false;
										toast.success(m.admin_clients_contact_added());
									}
								};
							}}
						>
							<div>
								<label for="new-contact-name" class="sr-only">{m.common_name()}</label>
								<input
									id="new-contact-name"
									name="name"
									placeholder={m.admin_clients_contact_name_placeholder()}
									required
									class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
								/>
								{#if contactErrors.name}<p class="mt-1 text-xs text-danger">
										{contactErrors.name}
									</p>{/if}
							</div>
							<div>
								<label for="new-contact-phone" class="sr-only">{m.common_phone()}</label>
								<PhoneInput id="new-contact-phone" name="phone" required />
								{#if contactErrors.phone}<p class="mt-1 text-xs text-danger">
										{contactErrors.phone}
									</p>{/if}
							</div>
							<div>
								<label for="new-contact-email" class="sr-only">{m.common_email()}</label>
								<input
									id="new-contact-email"
									name="email"
									type="email"
									placeholder={m.common_email_optional_placeholder()}
									class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
								/>
								{#if contactErrors.email}<p class="mt-1 text-xs text-danger">
										{contactErrors.email}
									</p>{/if}
							</div>
							<div>
								<label for="new-contact-role" class="sr-only">{m.common_role()}</label>
								<input
									id="new-contact-role"
									name="role"
									placeholder={m.common_role_optional_placeholder()}
									class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
								/>
							</div>
							<div class="flex items-center gap-3 sm:col-span-2">
								<button
									type="submit"
									disabled={savingContact}
									class="inline-flex items-center gap-2 rounded-brand bg-brand-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
								>
									{#if savingContact}<Spinner class="h-4 w-4" />{/if}
									{m.admin_clients_save_contact()}
								</button>
								<button
									type="button"
									class="text-sm font-medium text-muted-foreground transition hover:text-foreground"
									onclick={() => (showAddContact = false)}
								>
									{m.common_cancel()}
								</button>
							</div>
						</form>
					{:else}
						<button
							type="button"
							class="rounded-brand bg-accent-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-accent-700"
							onclick={() => (showAddContact = true)}
						>
							{m.admin_clients_add_contact()}
						</button>
					{/if}
				</div>
			</div>

			<!-- Client Portal Invite -->
			<!-- <div class="rounded-brand border border-border bg-background p-5 shadow-card">
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
			</div> -->
		</section>
	</div>

	<section class="rounded-brand border border-border bg-background p-5 shadow-card">
		<h2 class="text-sm font-semibold text-foreground">{m.admin_clients_recent_jobs()}</h2>
		<ul class="mt-3 divide-y divide-border">
			{#each data.client.bookings.slice(0, 6) as booking (booking.id)}
				<li class="flex items-center justify-between gap-3 py-2 text-sm">
					<div>
						<a
							href="/admin/bookings/{booking.id}"
							class="font-medium text-foreground hover:text-brand-700">{booking.bookingNumber}</a
						>
						<p class="text-xs text-muted-foreground">
							{booking.service.name} · {formatDateTime(booking.scheduledStart)}
						</p>
					</div>
					<span class={badgeClass(bookingStatusTone(booking.status))}
						>{bookingStatusLabel(booking.status)}</span
					>
				</li>
			{:else}
				<li class="py-3 text-sm text-muted-foreground">{m.admin_clients_no_jobs()}</li>
			{/each}
		</ul>
	</section>

	<section class="grid gap-6 lg:grid-cols-2">
		<div class="rounded-brand border border-border bg-background p-5 shadow-card">
			<h2 class="text-sm font-semibold text-foreground">{m.admin_nav_quotes()}</h2>
			<ul class="mt-3 space-y-2 text-sm">
				{#each data.client.quotes as quote (quote.id)}
					<li class="flex items-center justify-between gap-3">
						<a href="/admin/quotes/{quote.id}" class="text-foreground hover:text-brand-700"
							>{quote.quoteNumber}</a
						>
						<span class="text-muted-foreground">{formatTzs(quote.totalTzs)}</span>
						<span class={badgeClass(quoteStatusTone(quote.status))}
							>{quoteStatusLabel(quote.status)}</span
						>
					</li>
				{:else}
					<li class="text-muted-foreground">{m.admin_clients_no_quotes()}</li>
				{/each}
			</ul>
		</div>

		<div class="rounded-brand border border-border bg-background p-5 shadow-card">
			<h2 class="text-sm font-semibold text-foreground">{m.admin_nav_invoices()}</h2>
			<ul class="mt-3 space-y-2 text-sm">
				{#each data.client.invoices as invoice (invoice.id)}
					<li class="flex items-center justify-between gap-3">
						<a href="/admin/invoices/{invoice.id}" class="text-foreground hover:text-brand-700"
							>{invoice.invoiceNumber}</a
						>
						<span class="text-muted-foreground">{formatTzs(invoice.totalTzs)}</span>
						<span class={badgeClass(invoiceStatusTone(invoice.status))}
							>{invoiceStatusLabel(invoice.status)}</span
						>
					</li>
				{:else}
					<li class="text-muted-foreground">{m.admin_clients_no_invoices()}</li>
				{/each}
			</ul>
		</div>
	</section>
</div>

<form
	method="POST"
	action="?/deleteContact"
	use:enhance={() => {
		deletingContact = true;
		return async ({ result, update }) => {
			await update();
			deletingContact = false;
			if (result.type === 'success') {
				pendingContactDelete = null;
				toast.success(m.admin_clients_contact_removed());
			}
		};
	}}
	bind:this={contactDeleteForm}
	class="hidden"
>
	<input type="hidden" name="id" value={pendingContactDelete?.id ?? ''} />
</form>

<ConfirmDialog
	open={pendingContactDelete !== null}
	loading={deletingContact}
	title={m.admin_clients_remove_contact_title()}
	message={m.admin_clients_remove_contact_message({
		name: pendingContactDelete?.name ?? m.common_contact()
	})}
	confirmLabel={m.admin_clients_remove_contact_confirm()}
	cancelLabel={m.common_cancel()}
	oncancel={() => (pendingContactDelete = null)}
	onconfirm={() => contactDeleteForm?.requestSubmit()}
/>
