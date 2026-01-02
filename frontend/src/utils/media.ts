import { getApiBaseUrl } from './apiBase';

export function resolveMediaUrl(raw?: string | null): string {
  if (!raw) return '';
  const url = raw.trim();
  if (!url) return '';

  // Absolute URLs (include protocol) or protocol-relative
  if (/^(https?:)?\/\//i.test(url)) return url;

  // If VITE_API_BASE_URL is an absolute URL (e.g. http://localhost:8080 or http://.../api),
  // use its origin (strip trailing /api) as the prefix for server-hosted assets.
  const base = getApiBaseUrl();
  if (base) {
    const path = url.startsWith('/') ? url : `/${url}`;
    return `${base}${path}`;
  }

  // For relative or root paths, return as-is so dev proxy or hosting can resolve them.
  return url.startsWith('/') ? url : `/${url}`;
}
