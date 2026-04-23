import { adminService, authService, clientService, organizerService } from './services';

interface RequestLike { body?: any; authUserId?: string; params?: Record<string, string> }

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
  updateProfile: (req: RequestLike) => organizerService.updateProfile(req.authUserId ?? '', req.body),
  events: (req: RequestLike) => organizerService.events(req.authUserId ?? ''),
  eventById: (req: RequestLike) => organizerService.eventById(req.authUserId ?? '', req.params?.id ?? ''),
  createEvent: (req: RequestLike) => organizerService.createEvent(req.authUserId ?? '', req.body),
  updateEvent: (req: RequestLike) => organizerService.updateEvent(req.authUserId ?? '', req.params?.id ?? '', req.body),
  deleteEvent: (req: RequestLike) => organizerService.deleteEvent(req.authUserId ?? '', req.params?.id ?? ''),
  orders: (req: RequestLike) => organizerService.orders(req.authUserId ?? ''),
  customers: (req: RequestLike) => organizerService.customers(req.authUserId ?? ''),
  reports: (req: RequestLike) => organizerService.reports(req.authUserId ?? ''),
  payouts: (req: RequestLike) => organizerService.payouts(req.authUserId ?? '')
};

export const adminController = {
  dashboard: () => adminService.dashboard(),
  users: () => adminService.users(),
  updateUser: (req: RequestLike) => adminService.updateUser(req.params?.id ?? '', req.body),
  organizers: () => adminService.organizers(),
  updateOrganizer: (req: RequestLike) => adminService.updateOrganizer(req.params?.id ?? '', req.body),
  events: () => adminService.events(),
  updateEvent: (req: RequestLike) => adminService.updateEvent(req.params?.id ?? '', req.body),
  deleteEvent: (req: RequestLike) => adminService.deleteEvent(req.params?.id ?? ''),
  orders: () => adminService.orders(),
  travels: () => adminService.travels(),
  updateTravel: (req: RequestLike) => adminService.updateTravel(req.params?.id ?? '', req.body),
  movies: () => adminService.movies(),
  updateMovie: (req: RequestLike) => adminService.updateMovie(req.params?.id ?? '', req.body),
  categories: () => adminService.categories(),
  createCategory: (req: RequestLike) => adminService.createCategory(req.body),
  updateCategory: (req: RequestLike) => adminService.updateCategory(req.params?.id ?? '', req.body),
  deleteCategory: (req: RequestLike) => adminService.deleteCategory(req.params?.id ?? ''),
  content: () => adminService.content(),
  updateContent: (req: RequestLike) => adminService.updateContent(req.params?.id ?? '', req.body),
  settings: () => adminService.settings()
};
