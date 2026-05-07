import { UserRole } from './models';
import { API_BASE_URL } from './config';

export const AUTH_TOKEN_KEY = 'app:auth:token';
export const AUTH_USER_KEY = 'app:auth:user';
export const LEGACY_AUTH_TOKEN_KEYS = ['auth_token'];

export interface AuthUser {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  companyName?: string;
  organizationSlug?: string;
  isActive: boolean;
}

function parse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function persistToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  LEGACY_AUTH_TOKEN_KEYS.forEach((legacyKey) => localStorage.setItem(legacyKey, token));
}

export function clearAuthStorage(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  LEGACY_AUTH_TOKEN_KEYS.forEach((legacyKey) => localStorage.removeItem(legacyKey));
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getAuthToken(): string | null {
  const primaryToken = localStorage.getItem(AUTH_TOKEN_KEY);
  if (primaryToken) return primaryToken;
  const legacyToken = LEGACY_AUTH_TOKEN_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) ?? null;
  if (legacyToken) {
    localStorage.setItem(AUTH_TOKEN_KEY, legacyToken);
  }
  return legacyToken;
}

async function canReachApiHostWithoutCors(): Promise<boolean> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 2500);
  try {
    await fetch(new URL(API_BASE_URL).origin, { mode: 'no-cors', cache: 'no-store', signal: controller.signal });
    return true;
  } catch {
    return false;
  } finally {
    window.clearTimeout(timeout);
  }
}

async function readErrorPayload(response: Response): Promise<{ message?: string }> {
  try {
    return await response.json() as { message?: string };
  } catch {
    return {};
  }
}

async function requestAuth<T>(path: string, input: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(input),
    });
  } catch {
    const apiHostReachable = await canReachApiHostWithoutCors();
    if (apiHostReachable) {
      throw new Error(`Erreur CORS/API: le serveur Laravel répond sur ${API_BASE_URL}, mais la requête de connexion est bloquée ou invalide. Vérifiez la configuration CORS et la route /api${path}.`);
    }
    throw new Error(`Impossible de contacter le serveur Laravel sur ${API_BASE_URL}. Vérifiez que php artisan serve fonctionne sur http://127.0.0.1:8000.`);
  }

  if (!response.ok) {
    const payload = await readErrorPayload(response);
    if (response.status === 401 || response.status === 422) {
      throw new Error(payload.message ?? 'Email ou mot de passe invalide.');
    }
    if (response.status === 403) {
      throw new Error(payload.message ?? 'Votre compte est désactivé.');
    }
    throw new Error(payload.message ?? `Erreur CORS/API: Laravel a répondu avec le statut ${response.status} pour ${API_BASE_URL}${path}.`);
  }

  try {
    return await response.json() as T;
  } catch {
    throw new Error(`Erreur CORS/API: réponse JSON invalide depuis ${API_BASE_URL}${path}.`);
  }
}

export async function login(input: { email: string; password: string }): Promise<{ user: AuthUser; token: string }> {
  const response = await requestAuth<{ user: AuthUser; token: string }>('/login', input);
  persistToken(response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  return response;
}

export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'client';
}): Promise<{ user: AuthUser; token: string }> {
  const response = await requestAuth<{ user: AuthUser; token: string }>('/register', input);
  persistToken(response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  return response;
}

export function logout(): void {
  const token = getAuthToken();
  void fetch(`${API_BASE_URL}/logout`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  }).catch(() => undefined);
  clearAuthStorage();
}

export function getCurrentUser(): AuthUser | null {
  return parse<AuthUser>(localStorage.getItem(AUTH_USER_KEY));
}

export function getRole(): UserRole | null {
  return getCurrentUser()?.role ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(getAuthToken());
}

export async function forgotPassword(email: string): Promise<{ message: string; devNote?: string }> {
  return requestAuth('/forgot-password', { email });
}

export async function resetPassword(input: {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
}): Promise<{ message: string }> {
  return requestAuth('/reset-password', input);
}
