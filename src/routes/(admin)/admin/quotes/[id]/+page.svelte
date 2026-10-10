<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';
	import QuoteItemsEditor from '$lib/components/quotes/quote-items-editor.svelte';
	import QuotePreview from '$lib/components/quotes/quote-preview.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import Spinner from '$lib/components/ui/spinner.svelte';
	import type { QuoteItemRow } from '$lib/schemas/quote';
	import { formatTzs } from '$lib/utils/currency';
	import { formatDateTime, toDateInputValue } from '$lib/utils/dates';
	import { pageTitle } from '$lib/utils/page-title';
	import { toast } from '$lib/utils/toast';

	let { data, form }: PageProps = $props();

	const message = $derived((form as { message?: string } | null)?.message);

	/** True while the quote is being saved. */
	let savingQuote = $state(false);

	/** Whether the delete confirmation dialog is open. */
	let pendingDelete = $state(false);

	/** True while the quote deletion request is in flight. */
	let deletingQuote = $state(false);

	/** Submitted programmatically once the owner confirms deletion. */
	let deleteForm = $state<HTMLFormElement | null>(null);

	/** The left-column sections are accordions. */
	let lineItemsOpen = $state(true);
	let convertOpen = $state(true);

	/** The client chosen in the form, mirrored into the live document preview. */
	// svelte-ignore state_referenced_locally
	let clientId = $state(data.quote.clientId);

	/** The draft line items, seeded from the saved quote. */
	// svelte-ignore state_referenced_locally
	let items = $state<QuoteItemRow[]>(
		data.quote.lineItems.length > 0
			? data.quote.lineItems.map((line, index) => ({
					id: index,
					description: line.description,
					quantity: line.quantity,
					unitPriceTzs: line.unitPriceTzs,
					open: true
				}))
			: [{ id: 0, description: '', quantity: 1, unitPriceTzs: 0, open: true }]
	);

	/** Discount in TZS, mirrored into the live document preview. */
	// svelte-ignore state_referenced_locally
	let discountTzs = $state(data.quote.discountTzs);

	const subtotal = $derived(
		items.reduce((sum, line) => sum + line.quantity * line.unitPriceTzs, 0)
	);
	const total = $derived(Math.max(0, subtotal - discountTzs));
	const selectedClientName = $derived(
		data.clients.find((client) => client.id === clientId)?.displayName ??
			data.quote.client.displayName
	);

	/** True while the PDF is being generated. */
	let downloading = $state(false);

	/** Render the on-screen document to a real, downloadable PDF file. */
	async function downloadPdf() {
		const element = document.querySelector<HTMLElement>('.quote-document');
		if (!element) return;

		// Capture at 100% zoom regardless of the preview's current zoom.
		const zoomHost = document.querySelector<HTMLElement>('.quote-preview-zoom');
		const previousZoom = zoomHost?.style.zoom ?? '';
		if (zoomHost) zoomHost.style.zoom = '1';

		downloading = true;
		try {
			const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
				import('html2canvas-pro'),
				import('jspdf')
			]);

			const canvas = await html2canvas(element, { scale: 2, backgroundColor: '#ffffff' });
			const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
			const pageWidth = pdf.internal.pageSize.getWidth();
			const pageHeight = pdf.internal.pageSize.getHeight();
			const imageHeight = (canvas.height * pageWidth) / canvas.width;
			const image = canvas.toDataURL('image/png');

			// A near-A4 capture should stay on a single page; only paginate when
			// the document is genuinely taller than one page.
			const tolerance = 2;
			if (imageHeight <= pageHeight + tolerance) {
				pdf.addImage(image, 'PNG', 0, 0, pageWidth, Math.min(imageHeight, pageHeight));
			} else {
				let remaining = imageHeight;
				let offset = 0;
				while (remaining > tolerance) {
					pdf.addImage(image, 'PNG', 0, offset, pageWidth, imageHeight);
					remaining -= pageHeight;
					offset -= pageHeight;
					if (remaining > tolerance) pdf.addPage();
				}
			}

			pdf.save(`${data.quote.quoteNumber}.pdf`);
		} finally {
			downloading = false;
			if (zoomHost) zoomHost.style.zoom = previousZoom;
		}
	}

	onMount(() => {
		// A friendly tab title that matches the downloaded file.
		pageTitle.set(data.quote.quoteNumber);

		// The quotes list "Download" action links here with ?print=1.
		if (page.url.searchParams.get('print') === '1') {
			setTimeout(downloadPdf, 600);
		}

		return () => pageTitle.set(null);
	});
</script>

<div class="space-y-8">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/quotes">← Quotes</a
			>
			<div class="mt-1 flex flex-wrap items-center gap-3">
				<h1 class="text-2xl font-semibold tracking-tight text-foreground">
					{data.quote.quoteNumber}
				</h1>
			</div>
			<p class="mt-1 text-sm text-muted-foreground">
				{data.quote.client.displayName} · created {formatDateTime(data.quote.createdAt)}
			</p>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			<button
				type="button"
				disabled={downloading}
				class="inline-flex shrink-0 items-center gap-2 rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
				onclick={downloadPdf}
			>
				{#if downloading}
					<Spinner class="h-4 w-4" />
				{:else}
					<svg
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="M12 3v12" />
						<path d="m7 10 5 5 5-5" />
						<path d="M5 21h14" />
					</svg>
				{/if}
				Download
			</button>
			<button
				type="button"
				class="rounded-brand border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-danger hover:text-danger"
				onclick={() => (pendingDelete = true)}
			>
				Delete
			</button>
		</div>
	</div>

	{#if message}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{message}
		</p>
	{/if}

	<div class="grid gap-6 lg:grid-cols-5">
		<div class="space-y-6 lg:col-span-2">
			<details
				bind:open={convertOpen}
				class="rounded-brand border border-border bg-background shadow-card"
			>
				<summary
					class="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
				>
					Convert to booking
					<svg
						class="h-4 w-4 shrink-0 text-muted-foreground transition {convertOpen
							? 'rotate-180'
							: ''}"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</summary>
				<div class="border-t border-border p-5">
					{#if data.quote.booking}
						<p class="text-sm text-muted-foreground">
							Already booked as
							<a
								class="text-brand-700 hover:underline"
								href="/admin/bookings/{data.quote.booking.id}">{data.quote.booking.bookingNumber}</a
							>.
						</p>
					{:else}
						<form method="POST" action="?/convert" class="space-y-3" use:enhance>
							<input type="hidden" name="clientId" value={data.quote.clientId} />
							<input type="hidden" name="quotedTotalTzs" value={data.quote.totalTzs} />
							<div>
								<label for="serviceId" class="block text-sm font-medium text-foreground"
									>Service</label
								>
								<select
									id="serviceId"
									name="serviceId"
									required
									class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
								>
									<option value="">Select a service</option>
									{#each data.services as service (service.id)}
										<option value={service.id}>{service.name}</option>
									{/each}
								</select>
								<p class="mt-1 text-xs text-muted-foreground">
									This list comes from your service catalogue. To add or edit services, go to
									<a class="text-brand-700 hover:underline" href="/admin/website/services"
										>Website → Services</a
									>.
								</p>
							</div>
							<div>
								<label for="scheduledDate" class="block text-sm font-medium text-foreground"
									>Scheduled date</label
								>
								<input
									id="scheduledDate"
									name="scheduledDate"
									type="date"
									required
									class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
								/>
							</div>
							<div>
								<label for="scheduledTime" class="block text-sm font-medium text-foreground"
									>Scheduled time</label
								>
								<input
									id="scheduledTime"
									name="scheduledTime"
									type="time"
									value="08:00"
									class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
								/>
							</div>
							<button
								type="submit"
								class="w-full rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700"
							>
								Create booking
							</button>
						</form>
					{/if}
				</div>
			</details>

			<details
				bind:open={lineItemsOpen}
				class="rounded-brand border border-border bg-background shadow-card"
			>
				<summary
					class="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
				>
					Line items
					<svg
						class="h-4 w-4 shrink-0 text-muted-foreground transition {lineItemsOpen
							? 'rotate-180'
							: ''}"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						stroke-width="2"
						stroke-linecap="round"
						stroke-linejoin="round"
						aria-hidden="true"
					>
						<path d="m6 9 6 6 6-6" />
					</svg>
				</summary>
				<div class="border-t border-border p-5">
					<form
						method="POST"
						action="?/update"
						class="space-y-4"
						use:enhance={() => {
							savingQuote = true;
							return async ({ result, update }) => {
								// Keep the entered line items; the default reset clears the inputs.
								await update({ reset: false });
								savingQuote = false;
								if (result.type === 'success') toast.success('Quote updated.');
							};
						}}
					>
						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<label for="clientId" class="block text-sm font-medium text-foreground"
									>Client</label
								>
								<select
									id="clientId"
									name="clientId"
									bind:value={clientId}
									class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
								>
									{#each data.clients as client (client.id)}
										<option value={client.id}>{client.displayName}</option>
									{/each}
								</select>
							</div>
							<div>
								<label for="validUntil" class="block text-sm font-medium text-foreground"
									>Valid until</label
								>
								<input
									id="validUntil"
									name="validUntil"
									type="date"
									value={toDateInputValue(data.quote.validUntil)}
									class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
								/>
							</div>
						</div>

						<QuoteItemsEditor bind:items />

						<input type="hidden" name="discountTzs" value={discountTzs} />
						<input type="hidden" name="notes" value={data.quote.notes ?? ''} />

						<div class="flex flex-wrap items-center justify-between gap-3">
							<button
								type="submit"
								disabled={savingQuote}
								class="inline-flex items-center gap-2 rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-70"
							>
								{#if savingQuote}<Spinner class="h-4 w-4" />{/if}
								Save quote
							</button>
							<dl class="text-right text-sm">
								<div class="flex justify-end gap-6 text-base font-semibold">
									<dt>Total</dt>
									<dd>{formatTzs(total)}</dd>
								</div>
							</dl>
						</div>
					</form>
				</div>
			</details>
		</div>

		<section class="lg:col-span-3">
			<div
				class="rounded-brand border border-border bg-surface-muted p-4 shadow-card lg:sticky lg:top-6 lg:h-[calc(100vh-7rem)]"
			>
				<QuotePreview clientName={selectedClientName} {items} {discountTzs} initialZoom={0.8} />
			</div>
		</section>
	</div>
</div>

<form
	method="POST"
	action="?/delete"
	use:enhance={() => {
		deletingQuote = true;
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				pendingDelete = false;
				toast.success('Quote deleted.');
				await goto(result.location);
				return;
			}
			await update();
			deletingQuote = false;
		};
	}}
	bind:this={deleteForm}
	class="hidden"
></form>

<ConfirmDialog
	open={pendingDelete}
	loading={deletingQuote}
	title="Delete quote?"
	message="Are you sure you want to delete this quote? This cannot be undone."
	confirmLabel="Delete quote"
	oncancel={() => (pendingDelete = false)}
	onconfirm={() => deleteForm?.requestSubmit()}
/>
