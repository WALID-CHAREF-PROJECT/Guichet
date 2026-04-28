import { apiRouter } from './router';
import { UserRole } from './models';

export const AUTH_TOKEN_KEY = 'app:auth:token';
export const AUTH_USER_KEY = 'app:auth:user';

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

export function login(input: { email: string; password: string }): { user: AuthUser; token: string } {
  const response = apiRouter({ path: '/api/auth/login', method: 'POST', body: input }) as unknown as { user: AuthUser; token: string };
  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  return response;
}

export function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'client';
}): { user: AuthUser; token: string } {
  const response = apiRouter({ path: '/api/auth/register', method: 'POST', body: input }) as unknown as { user: AuthUser; token: string };
  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  return response;
}

export function logout(): void {
  void apiRouter({ path: '/api/auth/logout', method: 'POST' });
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getCurrentUser(): AuthUser | null {
  return parse<AuthUser>(localStorage.getItem(AUTH_USER_KEY));
}

export function getRole(): UserRole | null {
  return getCurrentUser()?.role ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}
