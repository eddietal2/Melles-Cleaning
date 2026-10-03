import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import {
	R2_ACCESS_KEY_ID,
	R2_ACCOUNT_ID,
	R2_BUCKET,
	R2_PUBLIC_URL,
	R2_SECRET_ACCESS_KEY
} from '$app/env/private';

/**
 * Cloudflare R2 storage helper.
 *
 * Uploads are performed directly from the browser to R2 using a short-lived
 * presigned PUT URL, so large files never pass through the serverless function.
 */
export function isR2Configured(): boolean {
	return Boolean(R2_ACCOUNT_ID && R2_ACCESS_KEY_ID && R2_SECRET_ACCESS_KEY && R2_BUCKET);
}

/** True when uploaded objects can be served from a public URL. */
export function hasPublicUrl(): boolean {
	return Boolean(R2_PUBLIC_URL);
}

let client: S3Client | null = null;

function getClient(): S3Client {
	if (!client) {
		client = new S3Client({
			region: 'auto',
			endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
			credentials: {
				accessKeyId: R2_ACCESS_KEY_ID,
				secretAccessKey: R2_SECRET_ACCESS_KEY
			}
		});
	}

	return client;
}

/** Builds a collision-resistant, URL-safe object key. */
export function buildObjectKey(filename: string): string {
	const safe = filename
		.toLowerCase()
		.replace(/[^a-z0-9.]+/g, '-')
		.replace(/^-+|-+$/g, '')
		.slice(-80);

	const stamp = Date.now().toString(36);
	const random = globalThis.crypto.randomUUID().slice(0, 8);

	return `media/${stamp}-${random}-${safe || 'upload'}`;
}

/** Public URL for a stored object. Falls back to the authenticated R2 endpoint. */
export function publicUrl(key: string): string {
	if (R2_PUBLIC_URL) {
		return `${R2_PUBLIC_URL.replace(/\/$/, '')}/${key}`;
	}

	return `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${key}`;
}

/** Creates a presigned PUT URL valid for 10 minutes. */
export function createPresignedUpload(key: string, contentType: string): Promise<string> {
	const command = new PutObjectCommand({
		Bucket: R2_BUCKET,
		Key: key,
		ContentType: contentType
	});

	return getSignedUrl(getClient(), command, { expiresIn: 600 });
}

/** Removes an object from the bucket. No-op when R2 is not configured. */
export async function deleteObject(key: string): Promise<void> {
	if (!isR2Configured()) return;

	await getClient().send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key }));
}
