import {
	PUBLIC_ANALYTICS_DOMAIN,
	PUBLIC_BUSINESS_PHONE,
	PUBLIC_WHATSAPP_NUMBER
} from '$app/env/public';
import type { LayoutServerLoad } from './$types';
import { getSiteSettings } from '$lib/server/content/site';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	const settings = await getSiteSettings();

	// Environment values act as a fallback until the owner sets them in the CRM.
	if (!settings.phone) settings.phone = PUBLIC_BUSINESS_PHONE;
	if (!settings.whatsapp) settings.whatsapp = PUBLIC_WHATSAPP_NUMBER;

	// Privacy-friendly analytics: a single deferred script, only when configured.
	const analytics = PUBLIC_ANALYTICS_DOMAIN
		? `<script defer data-domain="${url.host}" src="https://${PUBLIC_ANALYTICS_DOMAIN}/js/script.js"></script>`
		: '';

	return { settings, locale: locals.locale, analytics };
};
