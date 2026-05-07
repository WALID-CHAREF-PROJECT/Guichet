const FALLBACK_API_BASE_URL = 'http://127.0.0.1:8000/api';

function sanitizeBaseUrl(value: string | undefined): string {
  const trimmed = value?.trim();
  if (!trimmed) return FALLBACK_API_BASE_URL;
  return trimmed.replace(/\/+$/, '');
}

export const API_BASE_URL = sanitizeBaseUrl(import.meta.env.VITE_API_BASE_URL);

if (import.meta.env.DEV) {
  console.info(`[api] Active API base URL: ${API_BASE_URL}`);
}

export { FALLBACK_API_BASE_URL };
