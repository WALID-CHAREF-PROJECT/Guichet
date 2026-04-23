import { mockDb, createUser } from './mockDb';
import { ApiUser, UserRole } from './models';

interface LoginInput { email: string; password: string }
interface RegisterInput { firstName: string; lastName: string; email: string; password: string; role: 'client' | 'organizer'; companyName?: string }

const sanitizeUser = (user: ApiUser): Omit<ApiUser, 'password'> => {
  const { password: _password, ...safe } = user;
  return safe;
};

export const authService = {
  login(payload: LoginInput): { user: Omit<ApiUser, 'password'>; token: string } {
    const found = mockDb.users.find((user) => user.email.toLowerCase() === payload.email.trim().toLowerCase() && user.password === payload.password);
    if (!found) throw new Error('Email ou mot de passe invalide.');
    if (!found.isActive) throw new Error('Compte désactivé.');
    return { user: sanitizeUser(found), token: `fake-jwt-token-${found.id}` };
  },
  register(payload: RegisterInput): { user: Omit<ApiUser, 'password'>; token: string } {
    const exists = mockDb.users.some((u) => u.email.toLowerCase() === payload.email.trim().toLowerCase());
    if (exists) throw new Error('Cet email est déjà utilisé.');
    const companyName = payload.role === 'organizer' ? payload.companyName?.trim() : undefined;
    const created = createUser({
      firstName: payload.firstName.trim(),
      lastName: payload.lastName.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      role: payload.role,
      companyName,
      organizationSlug: companyName ? companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : undefined
    });
    return { user: sanitizeUser(created), token: `fake-jwt-token-${created.id}` };
  },
  me(userId: string): Omit<ApiUser, 'password'> | null {
    const found = mockDb.users.find((user) => user.id === userId);
    return found ? sanitizeUser(found) : null;
  },
  logout(): { success: true } {
    return { success: true };
  }
};

export const clientService = {
  profile: (userId: string) => mockDb.users.find((u) => u.id === userId) ?? null,
  favorites: (userId: string) => mockDb.favorites.filter((f) => f.userId === userId),
  orders: (userId: string) => mockDb.orders.filter((o) => o.customerId === userId),
  reservations: (userId: string) => mockDb.orders.filter((o) => o.customerId === userId && o.productType !== 'movie')
};

export const organizerService = {
  dashboard: (userId: string) => ({
    totalEvents: mockDb.events.filter((e) => e.organizerId === userId).length,
    revenue: mockDb.orders.filter((o) => o.organizerId === userId).reduce((sum, order) => sum + order.total, 0)
  }),
  profile: (userId: string) => mockDb.organizers.find((o) => o.userId === userId) ?? null,
  events: (userId: string) => mockDb.events.filter((e) => e.organizerId === userId),
  orders: (userId: string) => mockDb.orders.filter((o) => o.organizerId === userId),
  customers: (userId: string) => mockDb.orders.filter((o) => o.organizerId === userId).map((o) => o.customerId),
  reports: (userId: string) => ({ monthlyRevenue: mockDb.orders.filter((o) => o.organizerId === userId).reduce((sum, order) => sum + order.total, 0) }),
  payouts: (userId: string) => mockDb.payouts.get(userId) ?? []
};

export const adminService = {
  dashboard: () => ({ users: mockDb.users.length, events: mockDb.events.length, orders: mockDb.orders.length }),
  users: () => mockDb.users,
  organizers: () => mockDb.organizers,
  events: () => mockDb.events,
  orders: () => mockDb.orders,
  categories: () => mockDb.categories,
  content: () => mockDb.content,
  settings: () => mockDb.settings
};

export function canAccess(requiredRoles: UserRole[], currentRole: UserRole | null): boolean {
  return !!currentRole && requiredRoles.includes(currentRole);
}
