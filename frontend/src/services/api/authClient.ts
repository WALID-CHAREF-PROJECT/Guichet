import { authApi } from './laravelApi';
import { UserRole } from './models';
import { API_TOKEN_KEY } from './apiClient';

export const AUTH_TOKEN_KEY = API_TOKEN_KEY;
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

export async function login(input: { email: string; password: string }): Promise<{ user: AuthUser; token: string }> {
  const response = await authApi.login(input);
  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  return response;
}

export async function register(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'client' | 'organizer';
  companyName?: string;
  phone?: string;
}): Promise<{ user: AuthUser; token: string }> {
  const response = await authApi.register(input);
  localStorage.setItem(AUTH_TOKEN_KEY, response.token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
  return response;
}

export async function logout(): Promise<void> {
  await authApi.logout();
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
