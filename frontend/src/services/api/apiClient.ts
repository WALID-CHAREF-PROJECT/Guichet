export const API_TOKEN_KEY = 'app:auth:token';

const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '');

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

function readToken(): string | null {
  return localStorage.getItem(API_TOKEN_KEY);
}

function buildHeaders(initHeaders: HeadersInit | undefined, skipAuth: boolean): Headers {
  const headers = new Headers(initHeaders ?? {});
  if (!headers.has('Accept')) headers.set('Accept', 'application/json');
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

  if (!skipAuth) {
    const token = readToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
  }

  return headers;
}

export async function apiClient<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  const headers = buildHeaders(options.headers, options.skipAuth === true);

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body === undefined ? undefined : JSON.stringify(options.body)
  });

  const contentType = response.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const message = isJson && payload && typeof payload === 'object' && 'message' in payload
      ? String((payload as { message?: string }).message)
      : `Erreur API (${response.status})`;
    throw new ApiError(message, response.status, payload);
  }

  return payload as T;
}

export async function apiBlob(path: string): Promise<Blob> {
  const response = await fetch(`${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`, {
    headers: buildHeaders(undefined, false)
  });

  if (!response.ok) {
    throw new ApiError(`Erreur API (${response.status})`, response.status);
  }

  return response.blob();
}
