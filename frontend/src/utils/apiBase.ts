export function getApiBaseUrl(): string {
  const env = (import.meta.env.VITE_API_BASE_URL as string) || '';
  const raw = env.trim();
  if (!raw) return '';
  try {
    // Normalize: strip trailing `/api` if present and remove extra slashes
    const withoutApi = raw.replace(/\/api\/?$/i, '');
    return withoutApi.replace(/\/+$/i, '');
  } catch (e) {
    return raw.replace(/\/+$/i, '');
  }
}
