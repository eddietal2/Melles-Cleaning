export interface SettingField {
	key: string;
	label: string;
	group: string;
	type: 'text' | 'tel' | 'email' | 'number';
	hint?: string;
}

/** The key/value settings the owner can edit, in display order. */
export const SETTING_FIELDS: SettingField[] = [
	{ key: 'business_name', label: 'Business name', group: 'general', type: 'text' },
	{ key: 'business_city', label: 'City', group: 'general', type: 'text' },
	{ key: 'business_country', label: 'Country', group: 'general', type: 'text' },
	{ key: 'business_hours', label: 'Business hours', group: 'general', type: 'text' },
	{ key: 'business_address', label: 'Address', group: 'general', type: 'text' },
	{
		key: 'business_phone',
		label: 'Phone number',
		group: 'contact',
		type: 'tel',
		hint: 'Displayed in the site header and contact page.'
	},
	{
		key: 'business_whatsapp',
		label: 'WhatsApp number',
		group: 'contact',
		type: 'text',
		hint: 'Include the country code, e.g. 2557XXXXXXXX.'
	},
	{ key: 'business_email', label: 'Public email address', group: 'contact', type: 'email' },
	{
		key: 'notification_email',
		label: 'Lead notification email',
		group: 'contact',
		type: 'email',
		hint: 'Where new website enquiries should be sent.'
	},
	{
		key: 'referral_credit_tzs',
		label: 'Referral credit (TZS)',
		group: 'promotions',
		type: 'number'
	},
	{
		key: 'first_clean_discount_percent',
		label: 'First clean discount (%)',
		group: 'promotions',
		type: 'number'
	}
];
