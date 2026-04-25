import { authApi } from './laravelApi';
import { UserRole } from './models';
import { API_TOKEN_KEY } from './apiClient';
import { createUser, getCurrentUser as getLocalCurrentUser, getUsers, setCurrentUser, StoredUser } from '../storage';

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

function toAuthUser(user: StoredUser): AuthUser {
  return {
    id: user.id,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    companyName: user.companyName,
    organizationSlug: user.organizationSlug,
    isActive: user.active ?? true
  };
}

function loginLocal(input: { email: string; password: string }): { user: AuthUser; token: string } {
  const found = getUsers().find((user) => user.email.toLowerCase() === input.email.trim().toLowerCase() && user.password === input.password);
  if (!found) throw new Error('Email ou mot de passe invalide.');
  if (found.active === false) throw new Error('Compte désactivé.');
  setCurrentUser(found);
  const authUser = toAuthUser(found);
  const token = `local-token-${found.id}`;
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
  return { user: authUser, token };
}

export async function login(input: { email: string; password: string }): Promise<{ user: AuthUser; token: string }> {
  try {
    const response = await authApi.login(input);
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    return response;
  } catch (error) {
    console.warn('Backend auth unavailable, using local auth.', error);
    return loginLocal(input);
  }
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
  try {
    const response = await authApi.register(input);
    localStorage.setItem(AUTH_TOKEN_KEY, response.token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(response.user));
    return response;
  } catch (error) {
    console.warn('Backend register unavailable, using local register.', error);
    const created = createUser({
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      password: input.password,
      phone: input.phone ?? '',
      role: input.role
    });
    setCurrentUser(created);
    const authUser = toAuthUser(created);
    const token = `local-token-${created.id}`;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authUser));
    return { user: authUser, token };
  }
}

export async function logout(): Promise<void> {
  try {
    await authApi.logout();
  } catch (error) {
    console.warn('Backend logout unavailable, clearing local session only.', error);
  }
  setCurrentUser(null);
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const stored = parse<AuthUser>(localStorage.getItem(AUTH_USER_KEY));
  if (stored) return stored;
  const local = getLocalCurrentUser();
  return local ? toAuthUser(local) : null;
}

export function getRole(): UserRole | null {
  return getCurrentUser()?.role ?? null;
}

export function isAuthenticated(): boolean {
  return Boolean(getCurrentUser()) && Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
}
