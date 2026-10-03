/**
 * Builds a JSON-LD script block for structured data.
 *
 * This lives in a `.ts` module on purpose: Svelte's parser treats a literal
 * `<script` sequence inside a component string as a second script block, so the
 * markup must be assembled outside the `.svelte` file.
 */
export function jsonLdScript(data: unknown): string {
	const open = '<' + 'script type="application/ld+json">';
	const close = '<' + '/script>';
	return `${open}${JSON.stringify(data)}${close}`;
}
