import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import type { Handle } from '@sveltejs/kit';

let faviconContent: string;
try {
	const svgPath = join(fileURLToPath(new URL('.', import.meta.url)), 'lib/assets/favicon.svg');
	faviconContent = readFileSync(svgPath, 'utf-8');
} catch (error) {
	console.error('Failed to load favicon.svg at startup:', error);
	faviconContent = '';
}

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname === '/favicon.ico') {
		if (!faviconContent) {
			return new Response('Not found', { status: 404 });
		}
		
		return new Response(faviconContent, {
			headers: {
				'Content-Type': 'image/svg+xml',
				'Cache-Control': 'public, max-age=31536000'
			}
		});
	}

	return resolve(event);
};

