import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import type { Handle } from '@sveltejs/kit';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export const handle: Handle = async ({ event, resolve }) => {
	// Handle favicon.ico requests
	if (event.url.pathname === '/favicon.ico') {
		try {
			const svgPath = join(__dirname, 'lib/assets/favicon.svg');
			const svgContent = readFileSync(svgPath, 'utf-8');
			
			return new Response(svgContent, {
				headers: {
					'Content-Type': 'image/svg+xml',
					'Cache-Control': 'public, max-age=31536000'
				}
			});
		} catch (error) {
			// If file not found, return 404
			return new Response('Not found', { status: 404 });
		}
	}

	return resolve(event);
};

