// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces

import type { Locale } from './lib/paraglide/runtime';
import type { SessionInfo, SessionUser } from './lib/server/auth/session';

declare global {
	namespace App {
		interface Locals {
			user: SessionUser | null;
			session: SessionInfo | null;
			/** Negotiated request locale (Paraglide). */
			locale: Locale;
		}
	}
}

export {};
