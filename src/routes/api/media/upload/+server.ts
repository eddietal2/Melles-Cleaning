import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { buildObjectKey, createPresignedUpload, isR2Configured } from '$lib/server/media/r2';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 10 * 1024 * 1024;

/** Issues a presigned PUT URL so the browser can upload straight to R2. */
export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'You must be signed in.');
	}

	if (!isR2Configured()) {
		throw error(503, 'Media storage is not configured yet.');
	}

	const body = (await request.json().catch(() => null)) as {
		filename?: unknown;
		contentType?: unknown;
		size?: unknown;
	} | null;

	const filename = typeof body?.filename === 'string' ? body.filename : '';
	const contentType = typeof body?.contentType === 'string' ? body.contentType : '';
	const size = typeof body?.size === 'number' ? body.size : 0;

	if (!filename || !ALLOWED_TYPES.includes(contentType)) {
		throw error(400, 'Only JPEG, PNG, WebP and AVIF images are supported.');
	}

	if (size > MAX_BYTES) {
		throw error(400, 'Images must be 10MB or smaller.');
	}

	const key = buildObjectKey(filename);
	const uploadUrl = await createPresignedUpload(key, contentType);

	return json({ uploadUrl, key });
};
