import { PUBLIC_SITE_URL } from '$app/env/public';
import type { RequestHandler } from './$types';
import { getServices } from '$lib/server/content/site';

const STATIC_PATHS = ['/', '/services', '/gallery', '/about', '/contact', '/book'];

export const GET: RequestHandler = async () => {
	const base = PUBLIC_SITE_URL.replace(/\/$/, '');
	const services = await getServices();

	const paths = [...STATIC_PATHS, ...services.map((service) => `/services/${service.slug}`)];

	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...paths.map((path) => `  <url><loc>${base}${path}</loc></url>`),
		'</urlset>'
	].join('\n');

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600'
		}
	});
};
