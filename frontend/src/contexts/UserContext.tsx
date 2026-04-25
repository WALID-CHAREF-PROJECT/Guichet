import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister, getCurrentUser as getStoredUser, AuthUser, AUTH_USER_KEY } from '../services/api/authClient';
import { clientApi } from '../services/api/laravelApi';
import { FavoriteItem, FavoriteItemType, StoredUser } from '../services/storage';

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
  scopedState: { favorites: FavoriteItem[] } | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string; role?: 'client' | 'organizer' | 'admin' }>;
  register: (data: RegisterInput) => Promise<{ ok: boolean; message?: string; role?: 'client' | 'organizer' | 'admin' }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (patch: Partial<Pick<StoredUser, 'firstName' | 'lastName' | 'email' | 'phone' | 'avatar'>>) => Promise<void>;
  changePassword: (currentPassword: string, nextPassword: string, confirm: string) => Promise<{ ok: boolean; message: string }>;
  favorites: FavoriteItem[];
  isFavorite: (itemId: string, itemType: FavoriteItemType) => boolean;
  toggleFavorite: (favorite: Omit<FavoriteItem, 'id' | 'userId'>) => Promise<boolean>;
  removeFavorite: (itemId: string, itemType: FavoriteItemType) => Promise<void>;
}

const UserContext = createContext<UserContextValue | null>(null);

const mapUser = (user: AuthUser): StoredUser => ({
  id: user.id,
  role: user.role,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone ?? '',
  avatar: user.avatar,
  companyName: user.companyName,
  organizationSlug: user.organizationSlug,
  active: user.isActive
});

export function UserProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<StoredUser | null>(() => {
    const stored = getStoredUser();
    return stored ? mapUser(stored) : null;
  });
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async (): Promise<void> => {
    const stored = getStoredUser();
    if (!stored) {
      setUser(null);
      setFavorites([]);
      return;
    }
    setUser(mapUser(stored));
    try {
      const list = await clientApi.getFavorites();
      setFavorites(list);
    } catch {
      setFavorites([]);
    }
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      scopedState: { favorites },
      loading,
      login: async (email, password) => {
        try {
          setLoading(true);
          const { user: authedUser } = await apiLogin({ email, password });
          const mapped = mapUser(authedUser);
          setUser(mapped);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(authedUser));
          await refresh();
          return { ok: true, role: mapped.role };
        } catch (error) {
          return { ok: false, message: (error as Error).message };
        } finally {
          setLoading(false);
        }
      },
      register: async (data) => {
        try {
          setLoading(true);
          const { user: created } = await apiRegister({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: data.password,
            role: data.role ?? 'client',
            companyName: data.companyName,
            phone: data.phone
          });
          const mapped = mapUser(created);
          setUser(mapped);
          await refresh();
          return { ok: true, role: mapped.role };
        } catch (error) {
          return { ok: false, message: (error as Error).message };
        } finally {
          setLoading(false);
        }
      },
      logout: async () => {
        await apiLogout();
        setUser(null);
        setFavorites([]);
      },
      refresh,
      updateProfile: async (patch) => {
        if (!user) return;
        const updated = await clientApi.updateProfile(patch);
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify(updated));
        setUser(mapUser(updated as unknown as AuthUser));
      },
      changePassword: async (_currentPassword, _nextPassword, _confirm) => {
        return { ok: false, message: 'Le changement du mot de passe doit être géré via l’API dédiée.' };
      },
      favorites,
      isFavorite: (itemId, itemType) => favorites.some((item) => item.itemId === itemId && item.itemType === itemType),
      toggleFavorite: async (favorite) => {
        if (!user) return false;
        const existing = favorites.find((item) => item.itemId === favorite.itemId && item.itemType === favorite.itemType);
        if (existing) {
          await clientApi.deleteFavorite(existing.id);
          setFavorites((current) => current.filter((item) => item.id !== existing.id));
          return false;
        }
        const created = await clientApi.addFavorite(favorite);
        setFavorites((current) => [created, ...current]);
        return true;
      },
      removeFavorite: async (itemId, itemType) => {
        const existing = favorites.find((item) => item.itemId === itemId && item.itemType === itemType);
        if (!existing) return;
        await clientApi.deleteFavorite(existing.id);
        setFavorites((current) => current.filter((item) => item.id !== existing.id));
      }
    }),
    [user, favorites, loading]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser(): UserContextValue {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside UserProvider');
  return ctx;
}
