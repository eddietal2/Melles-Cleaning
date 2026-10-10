import { writable } from 'svelte/store';

export type Theme = 'light' | 'dark';

/** localStorage key shared with the inline script in app.html. */
export const THEME_STORAGE_KEY = 'melles-theme';

const isBrowser = typeof document !== 'undefined';

/**
 * The active theme. Starts as `'light'` on the server and at first client render
 * so hydration matches; the toggle syncs it from the DOM on mount.
 */
export const theme = writable<Theme>('light');

/** Reads the theme the inline app.html script already applied to `<html>`. */
export function syncThemeFromDocument() {
	if (!isBrowser) return;
	theme.set(document.documentElement.classList.contains('dark') ? 'dark' : 'light');
}

/** Flips the theme, persisting the choice and updating the `<html>` class. */
export function toggleTheme() {
	if (!isBrowser) return;
	theme.update((current) => {
		const next: Theme = current === 'dark' ? 'light' : 'dark';
		document.documentElement.classList.toggle('dark', next === 'dark');
		localStorage.setItem(THEME_STORAGE_KEY, next);
		return next;
	});
}
