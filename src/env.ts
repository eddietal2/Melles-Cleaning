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

	/** Session signing secret. */
	AUTH_SECRET: {
		schema: (value) => value ?? ''
	},

	/** Cloudflare R2 credentials for the media library. Optional in development. */
	R2_ACCOUNT_ID: { schema: (value) => value ?? '' },
	R2_ACCESS_KEY_ID: { schema: (value) => value ?? '' },
	R2_SECRET_ACCESS_KEY: { schema: (value) => value ?? '' },
	R2_BUCKET: { schema: (value) => value ?? 'melles-cleaning-media' },
	R2_PUBLIC_URL: { schema: (value) => value ?? '' },

	/** Resend credentials for transactional email. Optional until phase 2. */
	RESEND_API_KEY: { schema: (value) => value ?? '' },
	MAIL_FROM: {
		schema: (value) => value ?? 'Melles Cleaning Services <noreply@example.com>'
	},

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
