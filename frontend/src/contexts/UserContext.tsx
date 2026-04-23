import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister } from '../services/api/authClient';
import {
  createUser,
  FavoriteItem,
  FavoriteItemType,
  getCurrentUser,
  getUserState,
  getUsers,
  removeFavorite as deleteFavorite,
  setCurrentUser,
  StoredUser,
  toggleFavorite as toggleFavoriteInStorage,
  updateUserPassword,
  updateUserProfile,
  UserScopedState
} from '../services/storage';

interface RegisterInput {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: 'client' | 'organizer';
  companyName?: string;
}

interface UserContextValue {
  user: StoredUser | null;
  scopedState: UserScopedState | null;
  login: (email: string, password: string) => { ok: boolean; message?: string; role?: 'client' | 'organizer' | 'admin' };
  register: (data: RegisterInput) => { ok: boolean; message?: string };
  logout: () => void;
  refresh: () => void;
  updateProfile: (patch: Partial<Pick<StoredUser, 'firstName' | 'lastName' | 'email' | 'phone' | 'avatar'>>) => void;
  changePassword: (currentPassword: string, nextPassword: string, confirm: string) => { ok: boolean; message: string };
  favorites: FavoriteItem[];
  isFavorite: (itemId: string, itemType: FavoriteItemType) => boolean;
  toggleFavorite: (favorite: Omit<FavoriteItem, 'id' | 'userId'>) => boolean;
  removeFavorite: (itemId: string, itemType: FavoriteItemType) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<StoredUser | null>(getCurrentUser());
  const [scopedState, setScopedState] = useState<UserScopedState | null>(user ? getUserState(user.id, user) : null);
  const favoriteKeys = useMemo(() => new Set((scopedState?.favorites ?? []).map((item) => `${item.itemType}:${item.itemId}`)), [scopedState]);

  const refresh = (): void => {
    const nextUser = getCurrentUser();
    setUser(nextUser);
    setScopedState(nextUser ? getUserState(nextUser.id, nextUser) : null);
  };

  useEffect(() => {
    const sync = (): void => refresh();
    window.addEventListener('ticketflow:update', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ticketflow:update', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      scopedState,
      login: (email, password) => {
        const found = getUsers().find((candidate) => candidate.email.toLowerCase() === email.trim().toLowerCase() && candidate.password === password);
        if (!found) return { ok: false, message: 'Email ou mot de passe invalide.' };
        if (found.active === false) return { ok: false, message: 'Compte désactivé.' };
        try {
          apiLogin({ email, password });
        } catch (error) {
          return { ok: false, message: (error as Error).message };
        }
        setCurrentUser(found);
        return { ok: true, role: found.role };
      },
      register: (data) => {
        const exists = getUsers().some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase());
        if (exists) return { ok: false, message: 'Cet email est déjà utilisé.' };
        try {
          apiRegister({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            role: data.role ?? 'client',
            companyName: data.companyName
          });
        } catch (error) {
          return { ok: false, message: (error as Error).message };
        }
        const created = createUser({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.trim().toLowerCase(),
          password: data.password,
          phone: data.phone,
          role: data.role ?? 'client'
        });
        const withOrg = data.role === 'organizer' ? {
          ...created,
          companyName: data.companyName,
          organizationSlug: data.companyName ? data.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined
        } : created;
        setCurrentUser(withOrg);
        return { ok: true };
      },
      logout: () => {
        apiLogout();
        setCurrentUser(null);
      },
      refresh,
      updateProfile: (patch) => {
        if (!user) return;
        updateUserProfile(user.id, patch);
        refresh();
      },
      changePassword: (currentPassword, nextPassword, confirm) => {
        if (!user) return { ok: false, message: 'Utilisateur non connecté' };
        if (!currentPassword || !nextPassword || !confirm) return { ok: false, message: 'Tous les champs sont requis.' };
        if (nextPassword !== confirm) return { ok: false, message: 'La confirmation ne correspond pas.' };
        const fresh = getUsers().find((u) => u.id === user.id);
        if (fresh?.password !== currentPassword) return { ok: false, message: 'Mot de passe actuel incorrect.' };
        updateUserPassword(user.id, nextPassword);
        return { ok: true, message: 'Mot de passe mis à jour avec succès.' };
      },
      favorites: scopedState?.favorites ?? [],
      isFavorite: (itemId, itemType) => (user ? favoriteKeys.has(`${itemType}:${itemId}`) : false),
      toggleFavorite: (favorite) => {
        if (!user) return false;
        const next = toggleFavoriteInStorage(user.id, favorite);
        refresh();
        return next;
      },
      removeFavorite: (itemId, itemType) => {
        if (!user) return;
        deleteFavorite(user.id, itemId, itemType);
        refresh();
      },
    }),
    [user, scopedState, favoriteKeys]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
