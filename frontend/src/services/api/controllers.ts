import { adminService, authService, clientService, organizerService } from './services';

interface RequestLike { body?: any; authUserId?: string }

export const authController = {
  login: (req: RequestLike) => authService.login(req.body),
  register: (req: RequestLike) => authService.register(req.body),
  logout: () => authService.logout(),
  me: (req: RequestLike) => {
    if (!req.authUserId) throw new Error('Unauthorized');
    const user = authService.me(req.authUserId);
    if (!user) throw new Error('Unauthorized');
    return { user };
  }
};

export const clientController = {
  profile: (req: RequestLike) => clientService.profile(req.authUserId ?? ''),
  favorites: (req: RequestLike) => clientService.favorites(req.authUserId ?? ''),
  orders: (req: RequestLike) => clientService.orders(req.authUserId ?? ''),
  reservations: (req: RequestLike) => clientService.reservations(req.authUserId ?? '')
};

export const organizerController = {
  dashboard: (req: RequestLike) => organizerService.dashboard(req.authUserId ?? ''),
  profile: (req: RequestLike) => organizerService.profile(req.authUserId ?? ''),
  events: (req: RequestLike) => organizerService.events(req.authUserId ?? ''),
  orders: (req: RequestLike) => organizerService.orders(req.authUserId ?? ''),
  customers: (req: RequestLike) => organizerService.customers(req.authUserId ?? ''),
  reports: (req: RequestLike) => organizerService.reports(req.authUserId ?? ''),
  payouts: (req: RequestLike) => organizerService.payouts(req.authUserId ?? '')
};

export const adminController = {
  dashboard: () => adminService.dashboard(),
  users: () => adminService.users(),
  organizers: () => adminService.organizers(),
  events: () => adminService.events(),
  orders: () => adminService.orders(),
  categories: () => adminService.categories(),
  content: () => adminService.content(),
  settings: () => adminService.settings()
};
