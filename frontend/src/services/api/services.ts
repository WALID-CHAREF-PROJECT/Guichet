import { backofficeService } from '../backoffice';
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
  dashboard: (userId: string) => {
    const events = backofficeService.getOrganizerEvents(userId);
    const orders = backofficeService.getOrganizerOrders(userId);
    return { totalEvents: events.length, revenue: orders.reduce((sum, order) => sum + order.total, 0) };
  },
  profile: (userId: string) => backofficeService.getOrganizerProfile(userId),
  updateProfile: (userId: string, payload: Record<string, unknown>) => backofficeService.updateOrganizerProfile(userId, payload),
  events: (userId: string) => backofficeService.getOrganizerEvents(userId),
  eventById: (userId: string, id: string) => backofficeService.getOrganizerEvent(userId, id),
  createEvent: (userId: string, payload: any) => backofficeService.createOrganizerEvent(userId, payload),
  updateEvent: (userId: string, id: string, payload: any) => backofficeService.updateOrganizerEvent(userId, id, payload),
  deleteEvent: (userId: string, id: string) => backofficeService.deleteOrganizerEvent(userId, id),
  orders: (userId: string) => backofficeService.getOrganizerOrders(userId),
  customers: (userId: string) => backofficeService.getOrganizerCustomers(userId),
  reports: (userId: string) => ({ orders: backofficeService.getOrganizerOrders(userId), events: backofficeService.getOrganizerEvents(userId) }),
  payouts: (userId: string) => backofficeService.getOrganizerPayouts(userId)
};

export const adminService = {
  dashboard: () => {
    const db = backofficeService.getAdminData();
    return { users: mockDb.users.length, events: db.events.length, orders: db.orders.length };
  },
  users: () => mockDb.users,
  updateUser: (id: string, payload: Record<string, unknown>) => backofficeService.updateUser(id, payload),
  organizers: () => backofficeService.getAdminData().organizers,
  updateOrganizer: (id: string, payload: Record<string, unknown>) => backofficeService.updateOrganizer(id, payload),
  events: () => backofficeService.getAdminData().events,
  updateEvent: (id: string, payload: Record<string, unknown>) => backofficeService.updateEventByAdmin(id, payload),
  deleteEvent: (id: string) => backofficeService.deleteEventByAdmin(id),
  orders: () => backofficeService.getAdminData().orders,
  travels: () => backofficeService.getAdminData().travels,
  updateTravel: (id: string, payload: Record<string, unknown>) => backofficeService.updateTravel(id, payload),
  movies: () => backofficeService.getAdminData().movies,
  updateMovie: (id: string, payload: Record<string, unknown>) => backofficeService.updateMovie(id, payload),
  categories: () => backofficeService.getAdminData().categories,
  createCategory: (payload: any) => backofficeService.createCategory(payload),
  updateCategory: (id: string, payload: any) => backofficeService.updateCategory(id, payload),
  deleteCategory: (id: string) => backofficeService.deleteCategory(id),
  content: () => backofficeService.getAdminData().content,
  updateContent: (id: string, payload: any) => backofficeService.updateContent(id, payload),
  settings: () => backofficeService.getAdminData().settings
};

export function canAccess(requiredRoles: UserRole[], currentRole: UserRole | null): boolean {
  return !!currentRole && requiredRoles.includes(currentRole);
}
