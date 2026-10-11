<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onMount, tick } from 'svelte';
	import type { PageProps } from './$types';
	import QuoteItemsEditor from '$lib/components/quotes/quote-items-editor.svelte';
	import QuotePreview from '$lib/components/quotes/quote-preview.svelte';
	import ConfirmDialog from '$lib/components/ui/confirm-dialog.svelte';
	import Skeleton from '$lib/components/ui/skeleton.svelte';
	import Spinner from '$lib/components/ui/spinner.svelte';
	import * as m from '$lib/paraglide/messages.js';
	import type { QuoteDocumentLang, QuoteItemRow, QuoteTerms } from '$lib/schemas/quote';
	import { formatTzs } from '$lib/utils/currency';
	import { formatDateTime, toDateInputValue } from '$lib/utils/dates';
	import { pageTitle } from '$lib/utils/page-title';
	import { toast } from '$lib/utils/toast';

	let { data, form }: PageProps = $props();

	/** True when this editor is for a not-yet-saved quote (`/admin/quotes/new`). */
	// svelte-ignore state_referenced_locally
	const isNew = data.isNew;

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
	let termsOpen = $state(true);

	/** The client chosen in the form, mirrored into the live document preview. */
	// svelte-ignore state_referenced_locally
	let clientId = $state(data.quote.clientId);

	/** The draft line items, seeded from the saved quote. */
	// svelte-ignore state_referenced_locally
	let items = $state<QuoteItemRow[]>(
		data.quote.lineItems.length > 0
			? data.quote.lineItems.map((line, index) => ({
					id: index,
					title: line.title,
					cleaningType: line.cleaningType,
					description: line.description,
					quantity: line.quantity,
					unitPriceTzs: line.unitPriceTzs,
					open: true
				}))
			: [
					{
						id: 0,
						title: '',
						cleaningType: '',
						description: '',
						quantity: 1,
						unitPriceTzs: 0,
						open: true
					}
				]
	);

	/** Discount in TZS, mirrored into the live document preview. */
	// svelte-ignore state_referenced_locally
	let discountTzs = $state(data.quote.discountTzs);

	const subtotal = $derived(
		items.reduce((sum, line) => sum + line.quantity * line.unitPriceTzs, 0)
	);
	const total = $derived(Math.max(0, subtotal - discountTzs));

	/** The language the previewed document is rendered and downloaded in. */
	let lang = $state<QuoteDocumentLang>('en');

	/**
	 * Terms shown in the document footer, per language, seeded from the owner's
	 * saved defaults. Quotes don't persist their own terms yet.
	 */
	// svelte-ignore state_referenced_locally
	let terms = $state<QuoteTerms>({ ...data.defaultTerms });

	/** Which language's terms the accordion is currently editing. */
	let termsLang = $state<QuoteDocumentLang>('en');

	/** Language options for the terms editor. */
	const termsLanguages: { value: QuoteDocumentLang; label: () => string }[] = [
		{ value: 'en', label: m.lang_en },
		{ value: 'sw', label: m.lang_sw }
	];

	/** Maximum length of the free-text terms shown on the document. */
	const TERMS_MAX = 1000;

	/** Whether the preview is expanded to fill the page (hiding the edit column). */
	let previewOnly = $state(false);

	/** Zoom of the document preview; snapped to 100% while expanded. */
	let previewZoom = $state(0.8);

	/** The zoom to restore when leaving full-preview mode. */
	let zoomBeforeFull = 0.8;

	/** Toggle full-preview mode, snapping the preview to 100% while expanded. */
	function toggleFullPreview() {
		if (previewOnly) {
			previewOnly = false;
			previewZoom = zoomBeforeFull;
		} else {
			zoomBeforeFull = previewZoom;
			previewOnly = true;
			previewZoom = 1;
		}
	}

	/** True while the PDF is being generated. */
	let downloading = $state(false);

	/** Whether the download-language menu is open. */
	let downloadOpen = $state(false);

	/** The download menu wrapper, used to close it on an outside click. */
	let downloadMenu = $state<HTMLElement | null>(null);

	/** Language options offered by the download menu. */
	const downloadLanguages: { value: QuoteDocumentLang; label: () => string; hint: () => string }[] =
		[
			{ value: 'en', label: m.lang_en, hint: m.admin_quotes_english_document },
			{ value: 'sw', label: m.lang_sw, hint: m.admin_quotes_swahili_document }
		];

	// Close the download menu when clicking anywhere outside it.
	$effect(() => {
		if (!downloadOpen) return;
		function onPointerDown(event: MouseEvent) {
			if (downloadMenu && !downloadMenu.contains(event.target as Node)) {
				downloadOpen = false;
			}
		}
		document.addEventListener('mousedown', onPointerDown);
		return () => document.removeEventListener('mousedown', onPointerDown);
	});

	/** Render the on-screen document to a real, downloadable PDF file. */
	async function downloadPdf(targetLang: QuoteDocumentLang = lang) {
		// Switch the preview to the requested language and let the DOM update so
		// the captured document matches the chosen language.
		lang = targetLang;
		await tick();

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
			// JPEG keeps the file small (PNG of a full A4 capture runs into many MB).
			const image = canvas.toDataURL('image/jpeg', 0.9);

			// A near-A4 capture should stay on a single page; otherwise paginate on
			// section boundaries so a section is never split across two pages — a
			// section that would be cut off starts on the next page instead.
			const tolerance = 2;
			if (imageHeight <= pageHeight + tolerance) {
				pdf.addImage(image, 'JPEG', 0, 0, pageWidth, Math.min(imageHeight, pageHeight));
			} else {
				const docRect = element.getBoundingClientRect();
				// Maps DOM pixels to points in the rendered page-width image.
				const ptScale = (canvas.height / docRect.height) * (pageWidth / canvas.width);
				const sections = Array.from(element.children).map((child) => {
					const rect = child.getBoundingClientRect();
					return {
						top: (rect.top - docRect.top) * ptScale,
						bottom: (rect.bottom - docRect.top) * ptScale,
						// Blocks marked `data-splittable` (the line-items table) may flow
						// across pages; every other block must stay whole.
						keepTogether: !(child instanceof HTMLElement && child.hasAttribute('data-splittable'))
					};
				});

				// Breathing room added above a section that is pushed to a new page.
				const TOP_MARGIN = 24;
				const pageStarts: { start: number; margin: number }[] = [{ start: 0, margin: 0 }];
				let cursor = 0;
				for (const section of sections) {
					if (section.bottom - cursor <= pageHeight + tolerance) continue;

					const sectionHeight = section.bottom - section.top;
					if (
						section.keepTogether &&
						section.top > cursor &&
						sectionHeight <= pageHeight + tolerance
					) {
						// Fits on a fresh page: start it there (with a little space above
						// it) rather than splitting it across two pages.
						cursor = section.top;
						pageStarts.push({ start: cursor, margin: TOP_MARGIN });
					} else {
						// Splittable or taller than a page: slice at page increments.
						while (cursor + pageHeight < section.bottom - tolerance) {
							cursor += pageHeight;
							pageStarts.push({ start: cursor, margin: 0 });
						}
					}
				}

				pageStarts.forEach((page, index) => {
					if (index > 0) pdf.addPage();
					pdf.addImage(image, 'JPEG', 0, page.margin - page.start, pageWidth, imageHeight);

					// Blank the page above the top margin and below this page's break so a
					// section that was moved to the next page never peeks in here.
					const next = pageStarts[index + 1]?.start ?? imageHeight;
					const contentEnd = page.margin + (next - page.start);
					pdf.setFillColor(255, 255, 255);
					if (page.margin > 0) pdf.rect(0, 0, pageWidth, page.margin, 'F');
					if (contentEnd < pageHeight - tolerance) {
						pdf.rect(0, contentEnd, pageWidth, pageHeight - contentEnd, 'F');
					}
				});
			}

			pdf.save(`${data.quote.quoteNumber || 'quote'}-${targetLang}.pdf`);
		} finally {
			downloading = false;
			if (zoomHost) zoomHost.style.zoom = previousZoom;
		}
	}

	/** Download in the chosen language and close the menu. */
	function downloadIn(targetLang: QuoteDocumentLang) {
		downloadOpen = false;
		return downloadPdf(targetLang);
	}

	onMount(() => {
		// A friendly tab title that matches the downloaded file.
		pageTitle.set(isNew ? m.admin_quotes_new() : data.quote.quoteNumber);

		// The quotes list "Download" action links here with ?print=1.
		if (!isNew && page.url.searchParams.get('print') === '1') {
			setTimeout(() => downloadPdf('en'), 600);
		}

		return () => pageTitle.set(null);
	});
</script>

<div class="space-y-8">
	<div class="flex flex-wrap items-start justify-between gap-4">
		<div>
			<a class="text-sm text-muted-foreground hover:text-brand-700" href="/admin/quotes"
				>{m.admin_quotes_back()}</a
			>
			<div class="mt-1 flex flex-wrap items-center gap-3">
				<h1 class="text-2xl font-semibold tracking-tight text-foreground">
					{isNew ? m.admin_quotes_new() : data.quote.quoteNumber}
				</h1>
			</div>
			<p class="mt-1 text-sm text-muted-foreground">
				{#if isNew}
					{m.admin_quotes_new_intro()}
				{:else}
					{m.admin_quotes_created_line({
						name: data.quote.client?.displayName ?? '',
						date: formatDateTime(data.quote.createdAt)
					})}
				{/if}
			</p>
		</div>
		<div class="flex shrink-0 items-center gap-2">
			<button
				type="button"
				class="rounded-brand border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:bg-surface-muted"
				aria-pressed={previewOnly}
				onclick={toggleFullPreview}
			>
				{previewOnly ? m.admin_quotes_exit_preview() : m.admin_quotes_full_preview()}
			</button>
			<div class="relative" bind:this={downloadMenu}>
				<button
					type="button"
					disabled={downloading}
					aria-haspopup="menu"
					aria-expanded={downloadOpen}
					class="inline-flex shrink-0 items-center gap-2 rounded-brand bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-card transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-70"
					onclick={() => (downloadOpen = !downloadOpen)}
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
					{m.common_download()}
					<svg
						class="h-4 w-4 opacity-80"
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
				</button>
				{#if downloadOpen}
					<div
						class="absolute right-0 z-20 mt-1 w-48 rounded-brand border border-border bg-background p-1 shadow-overlay"
						role="menu"
					>
						<p
							class="px-3 py-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase"
						>
							{m.admin_quotes_download_as()}
						</p>
						{#each downloadLanguages as option (option.value)}
							<button
								type="button"
								role="menuitem"
								title={option.hint()}
								class="flex w-full items-center justify-between gap-2 rounded-brand px-3 py-2 text-left text-sm text-foreground transition hover:bg-surface-muted"
								onclick={() => downloadIn(option.value)}
							>
								<span>{option.label()}</span>
								<span class="text-xs text-muted-foreground">PDF</span>
							</button>
						{/each}
					</div>
				{/if}
			</div>
			{#if !isNew}
				<button
					type="button"
					class="rounded-brand border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-danger hover:text-danger"
					onclick={() => (pendingDelete = true)}
				>
					{m.common_delete()}
				</button>
			{/if}
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

	{#await data.streamed}
		<div class="grid gap-6 lg:grid-cols-5">
			<div class="space-y-6 lg:col-span-2">
				<Skeleton class="h-28 w-full" />
				<Skeleton class="h-72 w-full" />
				<Skeleton class="h-24 w-full" />
			</div>
			<section class="lg:col-span-3">
				<Skeleton class="h-[70vh] w-full" />
			</section>
		</div>
	{:then payload}
		{@const selectedClientName =
			payload.clients.find((client) => client.id === clientId)?.displayName ??
			data.quote.client?.displayName ??
			''}
		<div class="grid gap-6 lg:grid-cols-5">
			<div class="space-y-6 {previewOnly ? 'hidden' : 'lg:col-span-2'}">
				{#if !isNew}
					<details
						bind:open={convertOpen}
						class="rounded-brand border border-border bg-background shadow-card"
					>
						<summary
							class="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
						>
							{m.admin_quotes_convert()}
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
									{m.admin_quotes_already_booked({
										number: data.quote.booking.bookingNumber
									})}
								</p>
							{:else}
								<form method="POST" action="?/convert" class="space-y-3" use:enhance>
									<input type="hidden" name="clientId" value={data.quote.clientId} />
									<input type="hidden" name="quotedTotalTzs" value={data.quote.totalTzs} />
									<div>
										<label for="serviceId" class="block text-sm font-medium text-foreground"
											>{m.common_service()}</label
										>
										<select
											id="serviceId"
											name="serviceId"
											required
											class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
										>
											<option value="">{m.common_select_service()}</option>
											{#each payload.services as service (service.id)}
												<option value={service.id}>{service.name}</option>
											{/each}
										</select>
										<p class="mt-1 text-xs text-muted-foreground">
											{m.admin_quotes_services_hint()}<a
												class="text-brand-700 hover:underline"
												href="/admin/website/services">{m.admin_quotes_services_link()}</a
											>.
										</p>
									</div>
									<div>
										<label for="scheduledDate" class="block text-sm font-medium text-foreground"
											>{m.admin_quotes_scheduled_date()}</label
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
											>{m.admin_quotes_scheduled_time()}</label
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
										{m.admin_quotes_create_booking()}
									</button>
								</form>
							{/if}
						</div>
					</details>
				{/if}

				<details
					bind:open={lineItemsOpen}
					class="rounded-brand border border-border bg-background shadow-card"
				>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
					>
						{m.admin_quotes_line_items()}
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
									if (result.type === 'success') toast.success(m.admin_quotes_updated());
								};
							}}
						>
							<div class="grid gap-4 sm:grid-cols-2">
								<div>
									<label for="clientId" class="block text-sm font-medium text-foreground"
										>{m.common_client()}</label
									>
									<select
										id="clientId"
										name="clientId"
										required={isNew}
										bind:value={clientId}
										class="mt-1 block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
									>
										<option value="">{m.common_select_client()}</option>
										{#each payload.clients as client (client.id)}
											<option value={client.id}>{client.displayName}</option>
										{/each}
									</select>
								</div>
								<div>
									<label for="validUntil" class="block text-sm font-medium text-foreground"
										>{m.admin_quotes_valid_until()}</label
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

							<QuoteItemsEditor bind:items sticky />

							<input type="hidden" name="discountTzs" value={discountTzs} />
							<input type="hidden" name="notes" value={data.quote.notes ?? ''} />

							<div class="flex flex-wrap items-center justify-between gap-3">
								<button
									type="submit"
									disabled={savingQuote}
									class="inline-flex items-center gap-2 rounded-brand bg-accent-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-700 disabled:cursor-not-allowed disabled:opacity-70"
								>
									{#if savingQuote}<Spinner class="h-4 w-4" />{/if}
									{isNew ? m.admin_quotes_create() : m.admin_quotes_save()}
								</button>
								<dl class="text-right text-sm">
									<div class="flex justify-end gap-6 text-base font-semibold">
										<dt>{m.common_total()}</dt>
										<dd>{formatTzs(total)}</dd>
									</div>
								</dl>
							</div>
						</form>
					</div>
				</details>

				<details
					bind:open={termsOpen}
					class="rounded-brand border border-border bg-background shadow-card"
				>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-2 px-5 py-4 text-sm font-semibold text-foreground [&::-webkit-details-marker]:hidden"
					>
						{m.admin_quotes_terms_title()}
						<svg
							class="h-4 w-4 shrink-0 text-muted-foreground transition {termsOpen
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
					<div class="space-y-2 border-t border-border p-5">
						<div
							class="flex w-fit items-center rounded-pill border border-border bg-surface-muted p-0.5 text-xs"
							role="group"
							aria-label={m.admin_quotes_terms_language()}
						>
							{#each termsLanguages as option (option.value)}
								<button
									type="button"
									class="rounded-pill px-3 py-1 font-medium transition {termsLang === option.value
										? 'bg-brand-600 text-white shadow-sm'
										: 'text-muted-foreground hover:text-foreground'}"
									aria-pressed={termsLang === option.value}
									onclick={() => (termsLang = option.value)}
								>
									{option.label()}
								</button>
							{/each}
						</div>
						<div class="flex items-center justify-between">
							<label for="terms" class="block text-sm font-medium text-foreground">
								{m.admin_quotes_terms_lang_label({
									language: termsLang === 'en' ? m.lang_en() : m.lang_sw()
								})}
							</label>
							<span class="text-xs text-muted-foreground"
								>{terms[termsLang].length}/{TERMS_MAX}</span
							>
						</div>
						<textarea
							id="terms"
							bind:value={terms[termsLang]}
							rows="8"
							maxlength={TERMS_MAX}
							placeholder={m.admin_quotes_terms_placeholder()}
							class="block w-full rounded-brand border-border shadow-sm focus:border-brand-600 focus:ring-brand-600"
						></textarea>
						<p class="text-xs text-muted-foreground">
							{m.admin_quotes_terms_hint_doc()}
						</p>
					</div>
				</details>
			</div>

			<section class={previewOnly ? 'lg:col-span-5' : 'lg:col-span-3'}>
				<div
					class="rounded-brand border border-border bg-surface-muted p-4 shadow-card lg:sticky lg:top-6 lg:h-[calc(100vh-7rem)]"
				>
					<QuotePreview
						clientName={selectedClientName}
						{items}
						{discountTzs}
						{terms}
						bind:lang
						bind:zoom={previewZoom}
						initialZoom={0.8}
					/>
				</div>
			</section>
		</div>
	{:catch}
		<p
			class="rounded-brand border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
			role="alert"
		>
			{m.admin_quotes_editor_error()}
		</p>
	{/await}
</div>

<form
	method="POST"
	action="?/delete"
	use:enhance={() => {
		deletingQuote = true;
		return async ({ result, update }) => {
			if (result.type === 'redirect') {
				pendingDelete = false;
				toast.success(m.admin_quotes_deleted());
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
	title={m.admin_quotes_delete_title()}
	message={m.admin_quotes_delete_message({ number: m.admin_quotes_col_quote() })}
	confirmLabel={m.admin_quotes_delete_confirm()}
	cancelLabel={m.common_cancel()}
	oncancel={() => (pendingDelete = false)}
	onconfirm={() => deleteForm?.requestSubmit()}
/>
