const tzsFormatter = new Intl.NumberFormat('en-TZ', { maximumFractionDigits: 0 });

/** Formats a whole-TZS amount, e.g. 40000 -> "40,000 TZS". */
export function formatTzs(amount: number): string {
	return `${tzsFormatter.format(amount)} TZS`;
}

/** Formats an inclusive TZS range, e.g. "40,000 – 60,000 TZS". */
export function formatTzsRange(min: number, max: number): string {
	if (min === max) return formatTzs(min);
	return `${tzsFormatter.format(min)} – ${formatTzs(max)}`;
}

/** Formats a TZS price with an optional unit, e.g. "150,000 TZS / month". */
export function formatTzsWithUnit(amount: number, unit?: string | null): string {
	const base = formatTzs(amount);
	return unit ? `${base} ${unit}` : base;
}
