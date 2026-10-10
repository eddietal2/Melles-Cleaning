/**
 * Tanzanian phone-number helpers.
 *
 * Numbers are stored as free text, but they arrive in several shapes — local
 * (`0712 345 678`), national (`712 345 678`), international with a `+`
 * (`+255 712 345 678`) or a `00` dialling prefix. These helpers normalise them
 * to E.164 and render a consistent, readable form for the CRM.
 */
const TZ_COUNTRY_CODE = '255';

/**
 * Normalises a Tanzanian number to E.164 (`+255XXXXXXXXX`), accepting local,
 * national and international inputs. Returns `null` when the value cannot be
 * interpreted as a Tanzanian number.
 */
export function normalizeTzPhone(value: string | null | undefined): string | null {
	if (!value) return null;

	let digits = value.replace(/[^0-9]/g, '');
	if (!digits) return null;

	if (digits.startsWith('00')) {
		digits = digits.slice(2);
	}

	if (digits.startsWith(TZ_COUNTRY_CODE)) {
		digits = digits.slice(TZ_COUNTRY_CODE.length);
	} else if (digits.startsWith('0')) {
		digits = digits.slice(1);
	}

	// The national significant number is nine digits for mobiles and landlines.
	if (digits.length !== 9) return null;

	return `+${TZ_COUNTRY_CODE}${digits}`;
}

/**
 * Formats a Tanzanian number for display, e.g. `+255 712 345 678`. Falls back to
 * the original string (or an em dash) when it is not a recognisable number, so
 * unexpected data is never hidden.
 */
export function formatTzPhone(value: string | null | undefined): string {
	const normalized = normalizeTzPhone(value);
	if (!normalized) return value?.trim() || '—';

	const national = normalized.slice(`+${TZ_COUNTRY_CODE}`.length);
	return `+${TZ_COUNTRY_CODE} ${national.slice(0, 3)} ${national.slice(3, 6)} ${national.slice(6)}`;
}

/** The most digits a Tanzanian national number can contain. */
export const TZ_PHONE_MAX_DIGITS = 9;

/**
 * The nine-digit national number to prefill a phone input with, so editing an
 * existing `+255…` or `0712…` value starts from the canonical form.
 */
export function tzPhoneInputValue(value: string | null | undefined): string {
	const normalized = normalizeTzPhone(value);
	if (normalized) return normalized.slice(`+${TZ_COUNTRY_CODE}`.length);
	return value?.replace(/[^0-9]/g, '').slice(0, TZ_PHONE_MAX_DIGITS) ?? '';
}

/**
 * Input handler that keeps a phone field to digits only, capped at nine, so the
 * limit is enforced as the owner types or pastes.
 */
export function enforceTzPhoneDigits(event: Event) {
	const input = event.currentTarget as HTMLInputElement;
	let digits = input.value.replace(/[^0-9]/g, '');

	// Tolerate a pasted country code or trunk zero so only the national part remains.
	if (digits.startsWith(TZ_COUNTRY_CODE) && digits.length > TZ_PHONE_MAX_DIGITS) {
		digits = digits.slice(TZ_COUNTRY_CODE.length);
	} else if (digits.startsWith('0')) {
		digits = digits.slice(1);
	}

	digits = digits.slice(0, TZ_PHONE_MAX_DIGITS);
	if (input.value !== digits) input.value = digits;
}
