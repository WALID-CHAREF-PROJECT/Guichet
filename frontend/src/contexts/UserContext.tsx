import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUser,
  FavoriteItem,
  FavoriteItemType,
  getCurrentUser,
  getUserState,
  getUsers,
  isFavorite as checkIsFavorite,
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
}

interface UserContextValue {
  user: StoredUser | null;
  scopedState: UserScopedState | null;
  login: (email: string, password: string) => { ok: boolean; message?: string };
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
        const found = getUsers().find((candidate) => candidate.email === email.trim() && candidate.password === password);
        if (!found) return { ok: false, message: 'Email ou mot de passe invalide.' };
        if (found.active === false) return { ok: false, message: 'Compte désactivé.' };
        setCurrentUser(found);
        return { ok: true };
      },
      register: (data) => {
        const exists = getUsers().some((u) => u.email.toLowerCase() === data.email.trim().toLowerCase());
        if (exists) return { ok: false, message: 'Cet email est déjà utilisé.' };
        const created = createUser({ ...data, email: data.email.trim().toLowerCase() });
        setCurrentUser(created);
        return { ok: true };
      },
      logout: () => {
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
      isFavorite: (itemId, itemType) => (user ? checkIsFavorite(user.id, itemId, itemType) : false),
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
    [user, scopedState]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
