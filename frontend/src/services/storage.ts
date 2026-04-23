import { CartItem, Order } from '../types/commerce';

export type UserRole = 'client' | 'organizer' | 'admin';
export type FavoriteItemType = 'event' | 'movie' | 'travel' | 'sport';

export interface StoredUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatar?: string;
  password?: string;
  role: UserRole;
  companyName?: string;
  organizationSlug?: string;
  active?: boolean;
}

export interface FavoriteItem {
  id: string;
  userId: string;
  itemId: string;
  itemType: FavoriteItemType;
  slug: string;
  title: string;
  image: string;
  location?: string;
  date?: string;
  route: string;
  organizer?: string;
}

export interface UserScopedState {
  profile: StoredUser;
  cart: CartItem[];
  favorites: FavoriteItem[];
  orders: Order[];
  reservations: Order[];
  travelBookings: CartItem[];
  cinemaBookings: CartItem[];
  balanceTransactions: Array<{ id: string; label: string; amount: number; createdAt: string }>;
}

const USERS_KEY = 'app:db:users';
const CURRENT_USER_KEY = 'app:auth:user';

const ADMIN_USER: StoredUser = {
  id: 'admin-1',
  firstName: 'Admin',
  lastName: 'Guichet',
  email: 'admin@guichet.ma',
  password: 'Admin@123',
  phone: '+212600000000',
  role: 'admin',
  active: true
};

const ORGANIZER_USER: StoredUser = {
  id: 'org-1',
  firstName: 'Fournisseur',
  lastName: 'Guichet',
  email: 'fournisseur@guichet.ma',
  password: 'Fournisseur@123',
  phone: '+212611111111',
  role: 'organizer',
  companyName: 'Guichet Fournisseurs',
  organizationSlug: 'guichet-fournisseurs',
  active: true
};

const CLIENT_USER: StoredUser = {
  id: 'client-1',
  firstName: 'Client',
  lastName: 'Guichet',
  email: 'client@guichet.com',
  password: 'Client123!',
  phone: '+212622222222',
  role: 'client',
  active: true
};

function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function key(userId: string, field: keyof Omit<UserScopedState, 'profile'> | 'profile'): string {
  return `app:user:${userId}:${field}`;
}

function parseJSON<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function defaultState(user: StoredUser): UserScopedState {
  return {
    profile: user,
    cart: [],
    favorites: [],
    orders: [],
    reservations: [],
    travelBookings: [],
    cinemaBookings: [],
    balanceTransactions: []
  };
}

function normalizeFavorites(userId: string, raw: unknown): FavoriteItem[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === 'string') {
        return {
          id: uid('fav'),
          userId,
          itemId: item,
          itemType: 'event' as FavoriteItemType,
          slug: item,
          title: item,
          image: '',
          route: `/ma-fr/event/${item}`
        } satisfies FavoriteItem;
      }
      if (!item || typeof item !== 'object') return null;
      const candidate = item as Partial<FavoriteItem>;
      if (!candidate.slug || !candidate.route || !candidate.itemId || !candidate.itemType || !candidate.title) return null;
      return {
        id: candidate.id ?? uid('fav'),
        userId,
        itemId: candidate.itemId,
        itemType: candidate.itemType,
        slug: candidate.slug,
        title: candidate.title,
        image: candidate.image ?? '',
        location: candidate.location,
        date: candidate.date,
        route: candidate.route,
        organizer: candidate.organizer
      } satisfies FavoriteItem;
    })
    .filter((item): item is FavoriteItem => item !== null);
}

export function getUsers(): StoredUser[] {
  const users = parseJSON<StoredUser[]>(localStorage.getItem(USERS_KEY), []);
  const withDefaults = [...users];
  if (!withDefaults.some((u) => u.email === ADMIN_USER.email)) withDefaults.unshift(ADMIN_USER);
  if (!withDefaults.some((u) => u.email === ORGANIZER_USER.email)) withDefaults.unshift(ORGANIZER_USER);
  if (!withDefaults.some((u) => u.email === CLIENT_USER.email)) withDefaults.unshift(CLIENT_USER);
  if (withDefaults.length !== users.length) saveUsers(withDefaults);
  return withDefaults;
}

export function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): StoredUser | null {
  return parseJSON<StoredUser | null>(localStorage.getItem(CURRENT_USER_KEY), null);
}

export function setCurrentUser(user: StoredUser | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.dispatchEvent(new Event('ticketflow:update'));
    return;
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  ensureUserState(user);
  window.dispatchEvent(new Event('ticketflow:update'));
}

export function ensureUserState(user: StoredUser): UserScopedState {
  const state = getUserState(user.id, user);
  saveUserState(user.id, state);
  return state;
}

export function getUserState(userId: string, fallbackUser?: StoredUser): UserScopedState {
  const user = fallbackUser ?? getUsers().find((u) => u.id === userId);
  if (!user) {
    throw new Error('Utilisateur introuvable');
  }

  return {
    profile: parseJSON<StoredUser>(localStorage.getItem(key(userId, 'profile')), user),
    cart: parseJSON<CartItem[]>(localStorage.getItem(key(userId, 'cart')), []),
    favorites: normalizeFavorites(userId, parseJSON<unknown[]>(localStorage.getItem(key(userId, 'favorites')), [])),
    orders: parseJSON<Order[]>(localStorage.getItem(key(userId, 'orders')), []),
    reservations: parseJSON<Order[]>(localStorage.getItem(key(userId, 'reservations')), []),
    travelBookings: parseJSON<CartItem[]>(localStorage.getItem(key(userId, 'travelBookings')), []),
    cinemaBookings: parseJSON<CartItem[]>(localStorage.getItem(key(userId, 'cinemaBookings')), []),
    balanceTransactions: parseJSON<UserScopedState['balanceTransactions']>(localStorage.getItem(key(userId, 'balanceTransactions')), [])
  };
}

export function saveUserState(userId: string, state: UserScopedState): void {
  localStorage.setItem(key(userId, 'profile'), JSON.stringify(state.profile));
  localStorage.setItem(key(userId, 'cart'), JSON.stringify(state.cart));
  localStorage.setItem(key(userId, 'favorites'), JSON.stringify(state.favorites));
  localStorage.setItem(key(userId, 'orders'), JSON.stringify(state.orders));
  localStorage.setItem(key(userId, 'reservations'), JSON.stringify(state.reservations));
  localStorage.setItem(key(userId, 'travelBookings'), JSON.stringify(state.travelBookings));
  localStorage.setItem(key(userId, 'cinemaBookings'), JSON.stringify(state.cinemaBookings));
  localStorage.setItem(key(userId, 'balanceTransactions'), JSON.stringify(state.balanceTransactions));
}

export function createUser(payload: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role?: UserRole;
}): StoredUser {
  const user: StoredUser = {
    id: uid('user'),
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    password: payload.password,
    phone: payload.phone,
    role: payload.role ?? 'client',
    active: true
  };

  const users = getUsers();
  users.push(user);
  saveUsers(users);
  saveUserState(user.id, defaultState(user));
  return user;
}

export function updateUserProfile(userId: string, patch: Partial<Pick<StoredUser, 'firstName' | 'lastName' | 'email' | 'phone' | 'avatar'>>): StoredUser {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('Utilisateur introuvable');
  const updated = { ...users[idx], ...patch };
  users[idx] = updated;
  saveUsers(users);

  const state = getUserState(userId, updated);
  state.profile = updated;
  saveUserState(userId, state);

  const current = getCurrentUser();
  if (current?.id === userId) setCurrentUser(updated);
  return updated;
}

export function updateUserPassword(userId: string, nextPassword: string): void {
  const users = getUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) throw new Error('Utilisateur introuvable');
  users[idx] = { ...users[idx], password: nextPassword };
  saveUsers(users);
}

export function isFavorite(userId: string, itemId: string, itemType: FavoriteItemType): boolean {
  const state = getUserState(userId);
  return state.favorites.some((item) => item.itemId === itemId && item.itemType === itemType);
}

export function addFavorite(userId: string, favorite: Omit<FavoriteItem, 'id' | 'userId'>): void {
  const state = getUserState(userId);
  if (!state.favorites.some((item) => item.itemId === favorite.itemId && item.itemType === favorite.itemType)) {
    state.favorites.unshift({ ...favorite, id: uid('fav'), userId });
    saveUserState(userId, state);
    window.dispatchEvent(new Event('ticketflow:update'));
  }
}

export function removeFavorite(userId: string, itemId: string, itemType: FavoriteItemType): void {
  const state = getUserState(userId);
  state.favorites = state.favorites.filter((item) => !(item.itemId === itemId && item.itemType === itemType));
  saveUserState(userId, state);
  window.dispatchEvent(new Event('ticketflow:update'));
}

export function toggleFavorite(userId: string, favorite: Omit<FavoriteItem, 'id' | 'userId'>): boolean {
  if (isFavorite(userId, favorite.itemId, favorite.itemType)) {
    removeFavorite(userId, favorite.itemId, favorite.itemType);
    return false;
  }
  addFavorite(userId, favorite);
  return true;
}
