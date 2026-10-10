import { writable } from 'svelte/store';

/** A lightweight, dependency-free toast queue shared across the CRM. */
export type ToastTone = 'success' | 'error' | 'info';

export interface ToastItem {
	id: number;
	tone: ToastTone;
	message: string;
}

export const toasts = writable<ToastItem[]>([]);

let nextId = 0;

/** Removes a toast, whether dismissed by the user or the auto-hide timer. */
export function dismissToast(id: number) {
	toasts.update((items) => items.filter((item) => item.id !== id));
}

/** Pushes a toast and schedules its automatic dismissal. */
export function showToast(message: string, tone: ToastTone = 'success', timeout = 4000) {
	const id = ++nextId;
	toasts.update((items) => [...items, { id, tone, message }]);

	if (timeout > 0) {
		setTimeout(() => dismissToast(id), timeout);
	}

	return id;
}

export const toast = {
	success: (message: string) => showToast(message, 'success'),
	error: (message: string) => showToast(message, 'error'),
	info: (message: string) => showToast(message, 'info')
};
