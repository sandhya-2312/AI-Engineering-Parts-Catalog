/** Build a fetchable URL for API-hosted part files (thumbnails, GLB, etc.). */
export function resolveApiFileUrl(path: string) {
  const rawApiBase = import.meta.env.VITE_API_URL ?? '/api';
  if (/^(https?:|blob:)/i.test(path)) return path;
  if (path.startsWith('/files/')) return `${rawApiBase}${path}`;
  const apiBase = rawApiBase.endsWith('/api') ? rawApiBase.slice(0, -4) : rawApiBase;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${apiBase}${normalizedPath}`;
}
