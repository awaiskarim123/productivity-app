/**
 * API and env — applies to the whole app.
 *
 * Set in .env (local) or Vercel → Project → Environment Variables (production).
 * Vite exposes VITE_* to the client; api-config is the single source for the app.
 *
 * Local:   .env with VITE_API_URL (optional, defaults to http://localhost:4000/api)
 * Production: VITE_API_URL required (e.g. https://your-api.railway.app/api)
 */

/** Backend API base (includes /api). From env: VITE_API_URL. */
export const API_BASE_URL: string = (() => {
  const envUrl = import.meta.env.VITE_API_URL;
  const trimmed = typeof envUrl === 'string' ? envUrl.trim() : '';
  if (trimmed) return trimmed;

  if (import.meta.env.PROD) {
    throw new Error(
      'VITE_API_URL is not set in production. Set it in your environment variables (e.g. Vercel, Railway) so API calls use the correct backend.'
    );
  }

  return "http://localhost:4000/api";
})();

/** Frontend site URL. From env: VITE_SITE_URL. */
export const SITE_URL: string =
  import.meta.env.VITE_SITE_URL ??
  (import.meta.env.DEV
    ? "http://localhost:5173"
    : "https://productivity-app-dusky.vercel.app");

export const IS_DEV = !!import.meta.env.DEV;
export const IS_PROD = !!import.meta.env.PROD;
