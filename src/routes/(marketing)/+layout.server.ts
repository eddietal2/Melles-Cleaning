import { PUBLIC_BUSINESS_PHONE, PUBLIC_WHATSAPP_NUMBER } from '$app/env/public';
import type { LayoutServerLoad } from './$types';
import { getSiteSettings } from '$lib/server/content/site';

export const load: LayoutServerLoad = async () => {
	const settings = await getSiteSettings();

	// Environment values act as a fallback until the owner sets them in the CRM.
	if (!settings.phone) settings.phone = PUBLIC_BUSINESS_PHONE;
	if (!settings.whatsapp) settings.whatsapp = PUBLIC_WHATSAPP_NUMBER;

	return { settings };
};
