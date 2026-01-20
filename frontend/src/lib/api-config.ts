/**
 * API and environment configuration for local vs production.
 *
 * Local:
 *   - API:  http://localhost:4000/api
 *   - Site: http://localhost:5173
 *
 * Production (https://productivity-app-dusky.vercel.app):
 *   - API:  VITE_API_URL (set in Vercel to your backend, e.g. Railway/Render)
 *   - Site: VITE_SITE_URL or https://productivity-app-dusky.vercel.app
 */

/** Backend API base (includes /api). In Vercel, set VITE_API_URL to your backend URL, e.g. https://your-api.railway.app/api */
export const API_BASE_URL: string =
	import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api';

/** Frontend site URL. Set VITE_SITE_URL in Vercel to override (e.g. custom domain). */
export const SITE_URL: string =
	import.meta.env.VITE_SITE_URL ??
	(import.meta.env.DEV ? 'http://localhost:5173' : 'https://productivity-app-dusky.vercel.app');

export const IS_DEV = !!import.meta.env.DEV;
export const IS_PROD = !!import.meta.env.PROD;
