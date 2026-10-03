import { PUBLIC_SITE_URL } from '$app/env/public';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = () => {
	const base = PUBLIC_SITE_URL.replace(/\/$/, '');

	const body = [
		'User-agent: *',
		'Allow: /',
		'Disallow: /admin',
		'Disallow: /login',
		'',
		`Sitemap: ${base}/sitemap.xml`,
		''
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
