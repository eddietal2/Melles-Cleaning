import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { paraglideVitePlugin } from '@inlang/paraglide-js';
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
		paraglideVitePlugin({
			project: './project.inlang',
			outdir: './src/lib/paraglide',
			strategy: ['cookie', 'preferredLanguage', 'baseLocale'],
			emitTsDeclarations: true,
			isServer: 'import.meta.env.SSR'
		}),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter
		})
	],
	resolve: {
		alias: {
			// SvelteKit 3 ships `paths: {}`, so we provide the familiar `$lib` alias
			// ourselves for both TypeScript (tsconfig paths) and Vite.
			$lib: fileURLToPath(new URL('./src/lib', import.meta.url))
		}
	},
	test: {
		expect: { requireAssertions: true },
		environment: 'node',
		include: ['src/**/*.{test,spec}.{js,ts}'],
		// Prisma's generated client is machine-generated and not worth type- or unit-testing.
		exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/lib/server/generated/**']
	}
});
