import { writable } from 'svelte/store';

/**
 * Optional per-page document title override. Pages can set this to control the
 * `<title>` (which browsers also use as the default "Save as PDF" filename);
 * when null the admin layout falls back to its default title.
 */
export const pageTitle = writable<string | null>(null);
