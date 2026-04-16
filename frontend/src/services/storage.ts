import { EventItem } from '../types/api';

export interface StoredUser {
  name: string;
  email: string;
  password?: string;
  role?: 'user' | 'admin';
}

export interface CartItem {
  event: EventItem;
  quantity: number;
}

const USERS_KEY = 'ticketflow_users';
const CURRENT_USER_KEY = 'ticketflow_current_user';
const CART_KEY = 'ticketflow_cart';
const DEFAULT_ADMIN: StoredUser = {
  name: 'Project Admin',
  email: 'admin@guichet.ma',
  password: 'Admin@123',
  role: 'admin'
};

export function getUsers(): StoredUser[] {
  const rawUsers = localStorage.getItem(USERS_KEY);
  const parsedUsers = rawUsers ? JSON.parse(rawUsers) as StoredUser[] : [];
  if (!parsedUsers.some((user) => user.email === DEFAULT_ADMIN.email)) {
    const seededUsers = [DEFAULT_ADMIN, ...parsedUsers];
    saveUsers(seededUsers);
    return seededUsers;
  }
  return parsedUsers;
}

export function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): StoredUser | null {
  const rawUser = localStorage.getItem(CURRENT_USER_KEY);
  return rawUser ? JSON.parse(rawUser) as StoredUser : null;
}

export function setCurrentUser(user: StoredUser | null): void {
  if (!user) {
    localStorage.removeItem(CURRENT_USER_KEY);
    return;
  }
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
}

export function getCart(): CartItem[] {
  const rawCart = localStorage.getItem(CART_KEY);
  return rawCart ? JSON.parse(rawCart) as CartItem[] : [];
}

export function saveCart(items: CartItem[]): void {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function getCartCount(): number {
  return getCart().reduce((total, item) => total + item.quantity, 0);
}

export function addToCart(event: EventItem): void {
  const cart = getCart();
  const existing = cart.find((item) => item.event.id === event.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ event, quantity: 1 });
  }

  saveCart(cart);
}
