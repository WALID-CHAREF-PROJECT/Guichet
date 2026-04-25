import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { login as apiLogin, logout as apiLogout, register as apiRegister, getCurrentUser as getStoredUser, AuthUser } from '../services/api/authClient';
import { clientApi } from '../services/api/laravelApi';
import { addFavorite, FavoriteItem, FavoriteItemType, getCurrentUser, getUserState, removeFavorite as removeFavoriteFromStorage, setCurrentUser, StoredUser, toggleFavorite as toggleFavoriteInStorage, updateUserPassword, updateUserProfile, UserScopedState } from '../services/storage';
import { safeRun } from '../services/safeApi';

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
const GUEST_FAVORITES_KEY = 'app:guest:favorites';

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
    return stored ? mapUser(stored) : getCurrentUser();
  });
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = async (): Promise<void> => {
    const current = getCurrentUser();
    if (!current) {
      setUser(null);
      try {
        setFavorites(JSON.parse(localStorage.getItem(GUEST_FAVORITES_KEY) ?? '[]') as FavoriteItem[]);
      } catch {
        setFavorites([]);
      }
      return;
    }
    setUser(current);
    const localFavorites = getUserState(current.id).favorites;
    setFavorites(localFavorites);

    await safeRun(async () => {
      const remote = await clientApi.getFavorites();
      remote.forEach((favorite) => addFavorite(current.id, { ...favorite, route: favorite.route ?? `/ma-fr/event/${favorite.slug}` }));
      setFavorites(getUserState(current.id).favorites);
    });
  };

  useEffect(() => {
    void refresh();
  }, []);

  const value = useMemo<UserContextValue>(
    () => ({
      user,
      scopedState: user ? getUserState(user.id) : null,
      loading,
      login: async (email, password) => {
        try {
          setLoading(true);
          const { user: authedUser } = await apiLogin({ email, password });
          const mapped = mapUser(authedUser);
          setCurrentUser(mapped);
          setUser(mapped);
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
          setCurrentUser(mapped);
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
        const updated = updateUserProfile(user.id, patch);
        setCurrentUser(updated);
        setUser(updated);
        await safeRun(async () => {
          await clientApi.updateProfile(patch);
        });
      },
      changePassword: async (currentPassword, nextPassword, confirm) => {
        if (!user) return { ok: false, message: 'Utilisateur introuvable.' };
        if (nextPassword.length < 6) return { ok: false, message: 'Le mot de passe doit contenir au moins 6 caractères.' };
        if (nextPassword !== confirm) return { ok: false, message: 'La confirmation ne correspond pas.' };
        const local = getUserState(user.id).profile;
        if (local.password && local.password !== currentPassword) return { ok: false, message: 'Mot de passe actuel incorrect.' };
        updateUserPassword(user.id, nextPassword);
        return { ok: true, message: 'Mot de passe mis à jour.' };
      },
      favorites,
      isFavorite: (itemId, itemType) => favorites.some((item) => item.itemId === itemId && item.itemType === itemType),
      toggleFavorite: async (favorite) => {
        if (!user) {
          const guestFavorites = [...favorites];
          const exists = guestFavorites.some((item) => item.itemId === favorite.itemId && item.itemType === favorite.itemType);
          const next = exists
            ? guestFavorites.filter((item) => !(item.itemId === favorite.itemId && item.itemType === favorite.itemType))
            : [{ ...favorite, id: `fav-${Date.now()}`, userId: 'guest' }, ...guestFavorites];
          localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(next));
          setFavorites(next);
          return !exists;
        }
        const state = toggleFavoriteInStorage(user.id, favorite);
        setFavorites(getUserState(user.id).favorites);
        await safeRun(async () => {
          const existing = favorites.find((item) => item.itemId === favorite.itemId && item.itemType === favorite.itemType);
          if (existing) {
            await clientApi.deleteFavorite(existing.id);
          } else {
            await clientApi.addFavorite(favorite);
          }
        });
        return state;
      },
      removeFavorite: async (itemId, itemType) => {
        if (!user) {
          const next = favorites.filter((item) => !(item.itemId === itemId && item.itemType === itemType));
          localStorage.setItem(GUEST_FAVORITES_KEY, JSON.stringify(next));
          setFavorites(next);
          return;
        }
        removeFavoriteFromStorage(user.id, itemId, itemType);
        setFavorites(getUserState(user.id).favorites);
        await safeRun(async () => {
          const existing = favorites.find((item) => item.itemId === itemId && item.itemType === itemType);
          if (existing) {
            await clientApi.deleteFavorite(existing.id);
          }
        });
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
