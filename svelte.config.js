import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	compilerOptions: {
		// Force runes mode for the app, except for libraries. Can be removed in Svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html',
			precompress: false,
			strict: true
		}),
		prerender: {
			handleHttpError: ({ path, message }) => {
				// `/about` deliberately lives outside this repo (it holds personal content),
				// but is served by the production host. Don't fail the prerender build on it.
				if (path === '/about') return;
				throw new Error(message);
			}
		}
	}
};

export default config;
