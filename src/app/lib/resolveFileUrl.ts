import { API_URL, apiOrigin } from './api/config';

/** Build a fetchable URL for API-hosted part files (thumbnails, GLB, etc.). */
export function resolveApiFileUrl(path: string) {
  if (/^(https?:|blob:)/i.test(path)) return path;
  if (path.startsWith('/files/')) return `${API_URL}${path}`;
  const apiBase = apiOrigin();
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${normalizedPath}`;
}
