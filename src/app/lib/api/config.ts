/** Render production API (public). Override with VITE_API_URL in Vercel if needed. */
const RENDER_API_URL = 'https://ai-engineering-parts-catalog-api.onrender.com/api';

/** Base URL for API requests. Local dev uses `/api` (Vite proxy). */
export const API_URL =
  import.meta.env.VITE_API_URL?.trim() ||
  (import.meta.env.PROD ? RENDER_API_URL : '/api');

/** Origin without `/api` suffix — for static upload paths. */
export function apiOrigin(): string {
  return API_URL.endsWith('/api') ? API_URL.slice(0, -4) : API_URL;
}
