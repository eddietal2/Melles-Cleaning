<script lang="ts">
	import { enforceTzPhoneDigits, tzPhoneInputValue } from '$lib/utils/phone';

	/**
	 * Tanzanian phone field: a locked `+255` prefix followed by a nine-digit
	 * national number. The submitted value is the nine digits; the schema stores
	 * it in E.164 (`+255XXXXXXXXX`).
	 */
	let {
		id,
		name = 'phone',
		value = '',
		required = false,
		placeholder = '7XX XXX XXX'
	}: {
		id?: string;
		name?: string;
		value?: string | null;
		required?: boolean;
		placeholder?: string;
	} = $props();

	// Accept any stored shape (e.g. `+255712345678`) and show the national form.
	const national = $derived(tzPhoneInputValue(value));
</script>

<div
	class="mt-1 flex overflow-hidden rounded-brand border border-border shadow-sm focus-within:border-brand-600 focus-within:ring-1 focus-within:ring-brand-600"
>
	<span
		class="flex shrink-0 items-center border-r border-border bg-surface-muted px-3 text-sm text-muted-foreground select-none"
		>+255</span
	>
	<input
		{id}
		{name}
		{required}
		{placeholder}
		autocomplete="tel"
		inputmode="numeric"
		value={national}
		oninput={enforceTzPhoneDigits}
		class="block w-full border-0 bg-transparent py-2 text-sm text-foreground focus:ring-0"
	/>
</div>
