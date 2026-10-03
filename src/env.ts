import { defineEnvVars } from '@sveltejs/kit/env';

/**
 * Central environment variable definitions for SvelteKit 3.
 *
 * Variables are private (server-only) unless `public: true` is set, in which case
 * they are importable from `$app/env/public`. Private variables are imported from
 * `$app/env/private`, which is a server-only module.
 *
 * See docs/architecture.md section 16 for the full list of variables and their purpose.
 */
export const variables = defineEnvVars({
	/** PostgreSQL connection string used by Prisma. Required at startup. */
	DATABASE_URL: {},

	/** Canonical public site URL, used for SEO and absolute links. */
	PUBLIC_SITE_URL: {
		public: true,
		schema: (value) => value ?? 'http://localhost:5173'
	},

	/** Phone number displayed across the marketing site. */
	PUBLIC_BUSINESS_PHONE: {
		public: true,
		schema: (value) => value ?? ''
	},

	/** WhatsApp number used for click-to-chat links. */
	PUBLIC_WHATSAPP_NUMBER: {
		public: true,
		schema: (value) => value ?? ''
	}
});
