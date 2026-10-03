import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import adapterVercel from '@sveltejs/adapter-vercel';
import adapterAuto from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';

/**
 * Vercel's Linux builder assembles the serverless function using symlinks. Local
 * Windows builds inside a OneDrive folder cannot create symlinks (EPERM), so we only
 * emit the Vercel bundle when actually building on Vercel. Everywhere else we fall
 * back to adapter-auto, which is a no-op locally and keeps verification builds green.
 */
const adapter = process.env.VERCEL ? adapterVercel() : adapterAuto();

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter
		})
	],
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// Prisma's generated client is machine-generated and not worth type- or unit-testing.
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/lib/server/generated/**']
	}
});
