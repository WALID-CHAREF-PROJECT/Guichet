import { adminController, authController, clientController, organizerController } from './controllers';

interface ApiRequest {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  authUserId?: string;
}

type Handler = (req: ApiRequest & { params: Record<string, string> }) => unknown;

const routes: Array<{ method: ApiRequest['method']; pattern: RegExp; keys: string[]; handler: Handler }> = [
  { method: 'POST', pattern: /^\/api\/auth\/login$/, keys: [], handler: (req) => authController.login({ body: req.body }) },
  { method: 'POST', pattern: /^\/api\/auth\/register$/, keys: [], handler: (req) => authController.register({ body: req.body }) },
  { method: 'POST', pattern: /^\/api\/auth\/logout$/, keys: [], handler: () => authController.logout() },
  { method: 'GET', pattern: /^\/api\/auth\/me$/, keys: [], handler: (req) => authController.me({ authUserId: req.authUserId }) },
  { method: 'GET', pattern: /^\/api\/client\/profile$/, keys: [], handler: (req) => clientController.profile({ authUserId: req.authUserId }) },
  { method: 'GET', pattern: /^\/api\/client\/favorites$/, keys: [], handler: (req) => clientController.favorites({ authUserId: req.authUserId }) },
  { method: 'GET', pattern: /^\/api\/client\/orders$/, keys: [], handler: (req) => clientController.orders({ authUserId: req.authUserId }) },
  { method: 'GET', pattern: /^\/api\/client\/reservations$/, keys: [], handler: (req) => clientController.reservations({ authUserId: req.authUserId }) },
  { method: 'GET', pattern: /^\/api\/organizer\/dashboard$/, keys: [], handler: (req) => organizerController.dashboard({ authUserId: req.authUserId }) },
  { method: 'GET', pattern: /^\/api\/organizer\/profile$/, keys: [], handler: (req) => organizerController.profile({ authUserId: req.authUserId }) },
  { method: 'PUT', pattern: /^\/api\/organizer\/profile$/, keys: [], handler: (req) => organizerController.updateProfile({ authUserId: req.authUserId, body: req.body }) },
  { method: 'GET', pattern: /^\/api\/organizer\/events$/, keys: [], handler: (req) => organizerController.events({ authUserId: req.authUserId }) },
  { method: 'POST', pattern: /^\/api\/organizer\/events$/, keys: [], handler: (req) => organizerController.createEvent({ authUserId: req.authUserId, body: req.body }) },
  { method: 'GET', pattern: /^\/api\/organizer\/events\/([^/]+)$/, keys: ['id'], handler: (req) => organizerController.eventById({ authUserId: req.authUserId, params: req.params }) },
  { method: 'PUT', pattern: /^\/api\/organizer\/events\/([^/]+)$/, keys: ['id'], handler: (req) => organizerController.updateEvent({ authUserId: req.authUserId, params: req.params, body: req.body }) },
  { method: 'DELETE', pattern: /^\/api\/organizer\/events\/([^/]+)$/, keys: ['id'], handler: (req) => organizerController.deleteEvent({ authUserId: req.authUserId, params: req.params }) },
  { method: 'GET', pattern: /^\/api\/organizer\/orders$/, keys: [], handler: (req) => organizerController.orders({ authUserId: req.authUserId }) },
  { method: 'GET', pattern: /^\/api\/organizer\/customers$/, keys: [], handler: (req) => organizerController.customers({ authUserId: req.authUserId }) },
  { method: 'GET', pattern: /^\/api\/organizer\/reports$/, keys: [], handler: (req) => organizerController.reports({ authUserId: req.authUserId }) },
  { method: 'GET', pattern: /^\/api\/organizer\/payouts$/, keys: [], handler: (req) => organizerController.payouts({ authUserId: req.authUserId }) },
  { method: 'GET', pattern: /^\/api\/admin\/dashboard$/, keys: [], handler: () => adminController.dashboard() },
  { method: 'GET', pattern: /^\/api\/admin\/users$/, keys: [], handler: () => adminController.users() },
  { method: 'PUT', pattern: /^\/api\/admin\/users\/([^/]+)$/, keys: ['id'], handler: (req) => adminController.updateUser({ params: req.params, body: req.body }) },
  { method: 'GET', pattern: /^\/api\/admin\/organizers$/, keys: [], handler: () => adminController.organizers() },
  { method: 'PUT', pattern: /^\/api\/admin\/organizers\/([^/]+)$/, keys: ['id'], handler: (req) => adminController.updateOrganizer({ params: req.params, body: req.body }) },
  { method: 'GET', pattern: /^\/api\/admin\/events$/, keys: [], handler: () => adminController.events() },
  { method: 'PUT', pattern: /^\/api\/admin\/events\/([^/]+)$/, keys: ['id'], handler: (req) => adminController.updateEvent({ params: req.params, body: req.body }) },
  { method: 'DELETE', pattern: /^\/api\/admin\/events\/([^/]+)$/, keys: ['id'], handler: (req) => adminController.deleteEvent({ params: req.params }) },
  { method: 'GET', pattern: /^\/api\/admin\/orders$/, keys: [], handler: () => adminController.orders() },
  { method: 'GET', pattern: /^\/api\/admin\/travels$/, keys: [], handler: () => adminController.travels() },
  { method: 'PUT', pattern: /^\/api\/admin\/travels\/([^/]+)$/, keys: ['id'], handler: (req) => adminController.updateTravel({ params: req.params, body: req.body }) },
  { method: 'GET', pattern: /^\/api\/admin\/movies$/, keys: [], handler: () => adminController.movies() },
  { method: 'PUT', pattern: /^\/api\/admin\/movies\/([^/]+)$/, keys: ['id'], handler: (req) => adminController.updateMovie({ params: req.params, body: req.body }) },
  { method: 'GET', pattern: /^\/api\/admin\/categories$/, keys: [], handler: () => adminController.categories() },
  { method: 'POST', pattern: /^\/api\/admin\/categories$/, keys: [], handler: (req) => adminController.createCategory({ body: req.body }) },
  { method: 'PUT', pattern: /^\/api\/admin\/categories\/([^/]+)$/, keys: ['id'], handler: (req) => adminController.updateCategory({ params: req.params, body: req.body }) },
  { method: 'DELETE', pattern: /^\/api\/admin\/categories\/([^/]+)$/, keys: ['id'], handler: (req) => adminController.deleteCategory({ params: req.params }) },
  { method: 'GET', pattern: /^\/api\/admin\/content$/, keys: [], handler: () => adminController.content() },
  { method: 'PUT', pattern: /^\/api\/admin\/content\/([^/]+)$/, keys: ['id'], handler: (req) => adminController.updateContent({ params: req.params, body: req.body }) },
  { method: 'GET', pattern: /^\/api\/admin\/settings$/, keys: [], handler: () => adminController.settings() }
];

export function apiRouter(request: ApiRequest): unknown {
  for (const route of routes) {
    if (route.method !== request.method) continue;
    const match = request.path.match(route.pattern);
    if (!match) continue;
    const params: Record<string, string> = {};
    route.keys.forEach((key, index) => { params[key] = match[index + 1]; });
    return route.handler({ ...request, params });
  }
  throw new Error(`Route non implémentée: ${request.method} ${request.path}`);
}
