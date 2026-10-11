<script lang="ts">
	import { DEFAULT_QUOTE_TERMS, type QuoteDocumentLang, type QuoteTerms } from '$lib/schemas/quote';
	import { formatTzs } from '$lib/utils/currency';

	export type QuoteDocumentItem = {
		title?: string;
		cleaningType?: string;
		description?: string;
		quantity: number;
		unitPriceTzs: number;
	};

	/**
	 * A live, print-ready quote document styled after the "Color Rounded" template.
	 * It mirrors the new-quote form so it can later be exported or emailed as a PDF.
	 * Colours are intentionally fixed (always a light "paper") so it renders the same
	 * regardless of the app theme, and every fixed label is available in English and
	 * Swahili so the same document can be sent to clients in either language.
	 */
	let {
		issuedAt = new Date(),
		clientName = '',
		items = [],
		discountTzs = 0,
		lang = 'en',
		terms = DEFAULT_QUOTE_TERMS
	}: {
		issuedAt?: Date | string;
		clientName?: string;
		items?: QuoteDocumentItem[];
		discountTzs?: number;
		lang?: QuoteDocumentLang;
		terms?: QuoteTerms;
	} = $props();

	const subtotal = $derived(
		items.reduce((sum, item) => sum + item.quantity * item.unitPriceTzs, 0)
	);
	const total = $derived(Math.max(0, subtotal - discountTzs));

	/** Every fixed label on the document, keyed by language. */
	const translations = {
		en: {
			quote: 'QUOTE',
			billedTo: 'Billed to',
			date: 'Date',
			itemDescription: 'Item description',
			cleaningType: 'Type of cleaning',
			qty: 'Qty',
			price: 'Price',
			untitledItem: 'Untitled item',
			noItems: 'No items yet.',
			discount: 'Discount',
			grandTotal: 'Grand total',
			terms: 'Terms and conditions',
			selectClient: 'Select a client',
			phone: 'Phone',
			email: 'Email',
			breakdownTitle: 'Breakdown of the All-Inclusive Professional Package:',
			breakdownBody:
				'The total cost mentioned above represents a comprehensive, turnkey solution. Melles Cleaning Services will cover the use of modern cleaning equipment (such as scrubbers and pressure washers for paving), specialized industrial chemicals for removing stubborn stains and eliminating bacteria, the transportation of the team and equipment to and from the site, as well as allowances for the professionals who will execute the work to a high standard of efficiency.',
			contractTitle: 'CONTRACT SYSTEMS AND CLEANING SCHEDULES',
			contractItems: [
				{
					title: 'One-off Deep Clean',
					body: 'A deep clean to restore the entire lodge to a like-new condition, removing all stubborn stains and eliminating bacteria.'
				},
				{
					title: 'Daily Maintenance',
					body: 'Assigning permanent cleaning staff to clean the rooms, reception, dining area, and open spaces on a daily basis.'
				},
				{
					title: 'Weekly Deep Touch-Up',
					body: 'Deep cleaning carried out once a week in the corridors, outdoor toilets, urinals, and gardens.'
				},
				{
					title: 'Monthly Contract',
					body: 'A heavily discounted monthly retainer agreement that includes daily and weekly cleaning.'
				}
			],
			guaranteeTitle: 'Quality and Service Value Guarantee',
			guaranteeBody:
				'Melles Cleaning Services focuses on delivering high-quality cleaning services using modern equipment and safe cleaning agents. The prices quoted account for the size of the area, the quality of the work, and all operational costs, ensuring the job is completed efficiently with no hidden charges.'
		},
		sw: {
			quote: 'NUKUU',
			billedTo: 'Mteja',
			date: 'Tarehe',
			itemDescription: 'Maelezo',
			cleaningType: 'Aina ya usafi',
			qty: 'Idadi',
			price: 'Bei',
			untitledItem: 'Bila jina',
			noItems: 'Hakuna bidhaa bado.',
			discount: 'Punguzo',
			grandTotal: 'Jumla kuu',
			terms: 'Masharti na vigezo',
			selectClient: 'Chagua mteja',
			phone: 'Simu',
			email: 'Barua Pepe',
			breakdownTitle: 'Ufafanuzi wa Gharama Jumuishi (All-Inclusive Professional Package):',
			breakdownBody:
				'Gharama za jumla zilizotajwa hapo juu ni jumuishi (Turnkey Solution). Melles Cleaning Services itagharamia matumizi ya mashine za kisasa za usafi (scrubbers & pressure washers za paving), kemikali maalum za viwandani za kuondoa madoa sugu na kuua bakteria, usafiri wa timu na vifaa kwenda na kurudi site, pamoja na posho za wataalamu watakaofanya kazi hii kwa ufanisi wa hali ya juu.',
			contractTitle: 'MIFUMO YA MKATABA NA RATIBA ZA USAFI',
			contractItems: [
				{
					title: 'Usafi wa Mara Moja',
					body: 'Usafi wa kina wa kuweka Lodge yote katika hali mpya, kuondoa madoa yote sugu na kuua bakteria.'
				},
				{
					title: 'Mkataba wa Kila Siku',
					body: 'Kuweka wafanyakazi wa kudumu wa usafi kila siku kusafisha vyumba, reception, dining na maeneo ya wazi.'
				},
				{
					title: 'Usafi wa Kila Wiki',
					body: 'Usafi wa kina unaofanyika mara moja kila wiki kwenye korido, vyoo vya nje, urinals na bustani.'
				},
				{
					title: 'Mkataba wa Kila Mwezi',
					body: 'Mkataba wa mwezi wenye punguzo kubwa (Special Retainer) unaojumuisha usafi wa kila siku na wa wiki.'
				}
			],
			guaranteeTitle: 'DHAMANA YA UBORA NA THAMANI YA HUDUMA',
			guaranteeBody:
				'Melles Cleaning Services inazingatia kutoa huduma za viwango vya juu vya usafi kwa kutumia vifaa vya kisasa na kemikali salama. Bei zilizotajwa kwenye nukuu hii zimazingatia ukubwa wa eneo, ubora wa kazi, na gharama zote za uendeshaji ili kuhakikisha kazi inakamilika kwa ufanisi mkubwa bila gharama zilizofichika (no hidden charges).'
		}
	} as const;

	const t = $derived(translations[lang]);

	/** The terms text for the currently selected language. */
	const documentTerms = $derived(terms[lang]);

	/** Date formatters pinned to the business timezone (EAT) per language. */
	const dateFormatters: Record<QuoteDocumentLang, Intl.DateTimeFormat> = {
		en: new Intl.DateTimeFormat('en-GB', {
			timeZone: 'Africa/Dar_es_Salaam',
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		}),
		sw: new Intl.DateTimeFormat('sw', {
			timeZone: 'Africa/Dar_es_Salaam',
			day: '2-digit',
			month: 'short',
			year: 'numeric'
		})
	};

	const issuedLabel = $derived.by(() => {
		const date = issuedAt instanceof Date ? issuedAt : new Date(issuedAt);
		return Number.isNaN(date.getTime()) ? '—' : dateFormatters[lang].format(date);
	});

	/** Splits a description into lines, flagging lines that start with "*" as bullets. */
	function parseDescription(description: string): { text: string; bullet: boolean }[] {
		return description
			.split('\n')
			.map((line) => line.trim())
			.filter((line) => line.length > 0)
			.map((line) => {
				const bullet = line.startsWith('*');
				return { text: bullet ? line.slice(1).trim() : line, bullet };
			});
	}
</script>

<div
	class="quote-document mx-auto min-h-[297mm] w-[210mm] rounded-2xl bg-white p-10 text-slate-900 shadow-xl"
>
	<div class="flex items-start justify-between gap-4">
		<div class="flex items-center gap-2.5">
			<img src="/brand/MC_Logo_Dark.png" alt="" class="h-9" />
			<div>
				<p class="text-sm font-semibold">Melles Cleaning Services</p>
				<p class="text-xs text-slate-500">Dodoma, Tanzania</p>
				<p class="text-xs text-slate-500">{t.phone}: +255 769 547 605 / +255 69 493 7590</p>
				<p class="text-xs text-slate-500">{t.email}: mellescleaning@gmail.com</p>
			</div>
		</div>
		<div class="text-right">
			<p class="text-2xl font-bold tracking-tight text-brand-600">{t.quote}</p>
		</div>
	</div>

	<div
		class="mt-5 flex items-center justify-between gap-4 rounded-xl bg-brand-600 px-4 py-3 text-white"
	>
		<div>
			<p class="text-[0.65rem] font-semibold tracking-wider uppercase opacity-80">
				{t.billedTo}
			</p>
			<p class="text-sm font-semibold">{clientName || t.selectClient}</p>
		</div>
		<div class="text-right">
			<p class="text-[0.65rem] font-semibold tracking-wider uppercase opacity-80">{t.date}</p>
			<p class="text-sm font-semibold">{issuedLabel}</p>
		</div>
	</div>

	<table class="mt-5 w-full border-collapse text-sm">
		<thead>
			<tr class="text-left text-[0.65rem] tracking-wider text-slate-500 uppercase">
				<th class="pb-2 font-semibold">{t.itemDescription}</th>
				<th class="pb-2 font-semibold">{t.cleaningType}</th>
				<th class="pb-2 text-center font-semibold">{t.qty}</th>
				<th class="pb-2 text-right font-semibold">{t.price}</th>
			</tr>
		</thead>
		<tbody>
			{#each items as item, index (index)}
				<tr class="border-t border-slate-100">
					<td class="py-2 pr-2 align-top">
						{#if item.title}
							<p class="font-medium">{item.title}</p>
						{/if}
						{#if item.description}
							<div class="text-slate-500 {item.title ? 'mt-0.5 text-xs' : ''}">
								{#each parseDescription(item.description) as line, index (index)}
									{#if line.bullet}
										<p class="flex gap-1.5">
											<span aria-hidden="true">•</span>
											<span>{line.text}</span>
										</p>
									{:else}
										<p>{line.text}</p>
									{/if}
								{/each}
							</div>
						{/if}
						{#if !item.title && !item.description}
							{t.untitledItem}
						{/if}
					</td>
					<td class="py-2 align-top">{item.cleaningType}</td>
					<td class="py-2 text-center align-top text-slate-500">{item.quantity}</td>
					<td class="py-2 text-right align-top font-medium">
						{formatTzs(item.unitPriceTzs)}
					</td>
				</tr>
			{:else}
				<tr class="border-t border-slate-100">
					<td class="py-3 text-slate-400" colspan="4">{t.noItems}</td>
				</tr>
			{/each}
		</tbody>
	</table>

	<div class="mt-5 flex justify-end">
		<div class="w-full max-w-[220px] space-y-2">
			{#if discountTzs > 0}
				<div class="flex items-center justify-between text-sm text-slate-500">
					<span>{t.discount}</span>
					<span>− {formatTzs(discountTzs)}</span>
				</div>
			{/if}
			<div class="flex items-center justify-between rounded-xl bg-accent-600 px-3 py-2 text-white">
				<span class="text-xs font-semibold tracking-wider uppercase">{t.grandTotal}</span>
				<span class="text-sm font-bold">{formatTzs(total)}</span>
			</div>
		</div>
	</div>

	<div class="mt-5 rounded-xl border border-[#b4edfe] bg-[#f0fbff] p-4">
		<p class="text-[0.7rem] font-semibold text-[#006a8a]">{t.breakdownTitle}</p>
		<p class="mt-1 text-[0.7rem] leading-relaxed text-slate-700">{t.breakdownBody}</p>
	</div>

	<div class="mt-5">
		<p class="text-[0.7rem] font-semibold text-slate-700">{t.contractTitle}</p>
		<div class="mt-2 grid grid-cols-2 gap-3">
			{#each t.contractItems as entry, index (index)}
				<div class="rounded-md border-l-2 border-[#00c3fe] bg-slate-50 px-3 py-2">
					<p class="text-[0.7rem] font-semibold text-slate-700">{entry.title}</p>
					<p class="mt-0.5 text-[0.65rem] leading-relaxed text-slate-600">{entry.body}</p>
				</div>
			{/each}
		</div>
	</div>

	<div class="mt-3 rounded-xl border border-[#b4edfe] bg-[#f0fbff] p-4">
		<p class="text-[0.7rem] font-semibold text-[#006a8a]">{t.guaranteeTitle}</p>
		<p class="mt-1 text-[0.7rem] leading-relaxed text-slate-700">{t.guaranteeBody}</p>
	</div>

	{#if documentTerms.trim()}
		<div class="mt-5 border-t border-slate-200 pt-3 text-[0.7rem] text-slate-500">
			<p class="font-semibold text-slate-700">{t.terms}</p>
			{#each documentTerms.split('\n').filter((line) => line.trim()) as line, index (index)}
				<p class="mt-1">{line}</p>
			{/each}
		</div>
	{/if}
</div>
