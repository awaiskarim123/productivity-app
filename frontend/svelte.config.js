import adapter from '@sveltejs/adapter-vercel';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://svelte.dev/docs/kit/integrations
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	onwarn(warning, defaultHandler) {
		// Suppress warnings from SvelteKit's generated root.svelte file
		// These warnings are from generated code and will be fixed in future SvelteKit updates
		if (warning.code === 'svelte_component_deprecated') {
			return; // Suppress all svelte_component_deprecated warnings
		}
		defaultHandler(warning);
	},

	kit: {
		// Using adapter-vercel explicitly for better control and faster builds
		// The Node.js version is specified in package.json engines field
		adapter: adapter({
			runtime: 'nodejs20.x'
		})
	}
};

export default config;
