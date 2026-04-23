import { adminController, authController, clientController, organizerController } from './controllers';

interface ApiRequest {
  path: string;
  method: 'GET' | 'POST';
  body?: unknown;
  authUserId?: string;
}

type Handler = (req: ApiRequest) => unknown;

const routes = new Map<string, Handler>([
  ['POST /api/auth/login', (req) => authController.login({ body: req.body })],
  ['POST /api/auth/register', (req) => authController.register({ body: req.body })],
  ['POST /api/auth/logout', () => authController.logout()],
  ['GET /api/auth/me', (req) => authController.me({ authUserId: req.authUserId })],
  ['GET /api/client/profile', (req) => clientController.profile({ authUserId: req.authUserId })],
  ['GET /api/client/favorites', (req) => clientController.favorites({ authUserId: req.authUserId })],
  ['GET /api/client/orders', (req) => clientController.orders({ authUserId: req.authUserId })],
  ['GET /api/client/reservations', (req) => clientController.reservations({ authUserId: req.authUserId })],
  ['GET /api/organizer/dashboard', (req) => organizerController.dashboard({ authUserId: req.authUserId })],
  ['GET /api/organizer/profile', (req) => organizerController.profile({ authUserId: req.authUserId })],
  ['GET /api/organizer/events', (req) => organizerController.events({ authUserId: req.authUserId })],
  ['GET /api/organizer/orders', (req) => organizerController.orders({ authUserId: req.authUserId })],
  ['GET /api/organizer/customers', (req) => organizerController.customers({ authUserId: req.authUserId })],
  ['GET /api/organizer/reports', (req) => organizerController.reports({ authUserId: req.authUserId })],
  ['GET /api/organizer/payouts', (req) => organizerController.payouts({ authUserId: req.authUserId })],
  ['GET /api/admin/dashboard', () => adminController.dashboard()],
  ['GET /api/admin/users', () => adminController.users()],
  ['GET /api/admin/organizers', () => adminController.organizers()],
  ['GET /api/admin/events', () => adminController.events()],
  ['GET /api/admin/orders', () => adminController.orders()],
  ['GET /api/admin/categories', () => adminController.categories()],
  ['GET /api/admin/content', () => adminController.content()],
  ['GET /api/admin/settings', () => adminController.settings()]
]);

export function apiRouter(request: ApiRequest): unknown {
  const routeKey = `${request.method} ${request.path}`;
  const handler = routes.get(routeKey);
  if (!handler) throw new Error(`Route non implémentée: ${routeKey}`);
  return handler(request);
}
