import { API_BASE_URL } from './api/config';
import { getAuthToken } from './api/authClient';
import { backofficeService, BackofficeEvent, CategoryModel, ContentBlock, DbShape, MovieModel, OrganizerProfile, TravelModel } from './backoffice';
import { StoredUser, getCurrentUser, getUsers } from './storage';

export interface AdminData extends DbShape {
  users: StoredUser[];
  source: 'api' | 'local-fallback';
}

type AdminCollection = 'users' | 'organizers' | 'events' | 'orders' | 'categories' | 'travels' | 'movies' | 'content' | 'settings';

function hasAdminSession(): boolean {
  return Boolean(getAuthToken() && getCurrentUser()?.role === 'admin');
}

function headers(): HeadersInit {
  const token = getAuthToken();
  return { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!hasAdminSession()) throw new Error('Admin authentication required for admin API persistence.');
  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { ...headers(), ...(init?.headers ?? {}) } });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: `API error ${response.status}` }));
    throw new Error(payload.message ?? `API error ${response.status}`);
  }
  return response.status === 204 ? ({} as T) : response.json() as Promise<T>;
}

async function optionalCollection<T>(name: AdminCollection, fallback: T): Promise<T> {
  try {
    return await request<T>(`/admin/${name}`);
  } catch {
    return fallback;
  }
}

const bool = (value: unknown, fallback = false): boolean => typeof value === 'boolean' ? value : value === 1 || value === '1' || value === 'true' || fallback;
const str = (value: unknown, fallback = ''): string => typeof value === 'string' ? value : fallback;
const num = (value: unknown, fallback = 0): number => Number.isFinite(Number(value)) ? Number(value) : fallback;

function normalizeCategory(raw: Partial<CategoryModel> & Record<string, unknown>): CategoryModel {
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    type: (str(raw.type, 'event') as CategoryModel['type']),
    name: str(raw.name),
    slug: str(raw.slug, str(raw.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')),
    icon: str(raw.icon),
    image: str(raw.image),
    isActive: bool(raw.isActive ?? raw.is_active, true),
    order: num(raw.order ?? raw.sort_order, 1),
  };
}

function normalizeTravel(raw: Partial<TravelModel> & Record<string, unknown>): TravelModel {
  return { id: String(raw.id ?? crypto.randomUUID()), image: str(raw.image ?? raw.image_url), title: str(raw.title), category: str(raw.category, 'Voyage'), destination: str(raw.destination ?? raw.venue), departureDate: str(raw.departureDate ?? raw.departure_date ?? raw.starts_at), price: num(raw.price ?? raw.price_mad), description: str(raw.description), status: (str(raw.status, 'draft') as TravelModel['status']), featured: bool(raw.featured ?? raw.is_featured) };
}

function normalizeMovie(raw: Partial<MovieModel> & Record<string, unknown>): MovieModel {
  return { id: String(raw.id ?? crypto.randomUUID()), poster: str(raw.poster ?? raw.image ?? raw.image_url), title: str(raw.title), genre: str(raw.genre), duration: str(raw.duration), releaseDate: str(raw.releaseDate ?? raw.release_date ?? raw.starts_at), cinemas: str(raw.cinemas ?? raw.venue), description: str(raw.description), status: (str(raw.status, 'draft') as MovieModel['status']), featured: bool(raw.featured ?? raw.is_featured) };
}

function normalizeContent(raw: Partial<ContentBlock> & Record<string, unknown>): ContentBlock {
  return { id: String(raw.id ?? crypto.randomUUID()), type: (str(raw.type, 'section') as ContentBlock['type']), title: str(raw.title), subtitle: str(raw.subtitle), description: str(raw.description), ctaLabel: str(raw.ctaLabel ?? raw.cta_label), ctaLink: str(raw.ctaLink ?? raw.cta_link), image: str(raw.image), backgroundImage: str(raw.backgroundImage ?? raw.background_image), visible: bool(raw.visible ?? raw.is_visible, true), order: num(raw.order ?? raw.sort_order, 1) };
}

function normalizeEvent(raw: Partial<BackofficeEvent> & Record<string, unknown>, fallback: BackofficeEvent): BackofficeEvent {
  return { ...fallback, ...raw, id: String(raw.id ?? fallback.id), organizerId: String(raw.organizerId ?? raw.organizer_id ?? fallback.organizerId), location: str(raw.location ?? raw.venue, fallback.location), date: str(raw.date ?? raw.event_date ?? raw.starts_at, fallback.date), time: str(raw.time ?? raw.event_time, fallback.time), image: str(raw.image ?? raw.image_url, fallback.image), status: (str(raw.status, fallback.status) as BackofficeEvent['status']), featured: bool(raw.featured ?? raw.is_featured, fallback.featured) };
}

export const adminPersistence = {
  async load(): Promise<AdminData> {
    const local = backofficeService.getAdminData();
    if (!hasAdminSession()) {
      return { ...local, users: [], source: 'local-fallback' };
    }
    const [users, organizers, events, orders, categories, travels, movies, content, settings] = await Promise.all([
      optionalCollection<StoredUser[]>('users', getUsers()),
      optionalCollection<OrganizerProfile[]>('organizers', local.organizers),
      optionalCollection<Array<Partial<BackofficeEvent> & Record<string, unknown>>>('events', local.events as unknown as Array<Partial<BackofficeEvent> & Record<string, unknown>>),
      optionalCollection<typeof local.orders>('orders', local.orders),
      optionalCollection<Array<Partial<CategoryModel> & Record<string, unknown>>>('categories', local.categories as unknown as Array<Partial<CategoryModel> & Record<string, unknown>>),
      optionalCollection<Array<Partial<TravelModel> & Record<string, unknown>>>('travels', local.travels as unknown as Array<Partial<TravelModel> & Record<string, unknown>>),
      optionalCollection<Array<Partial<MovieModel> & Record<string, unknown>>>('movies', local.movies as unknown as Array<Partial<MovieModel> & Record<string, unknown>>),
      optionalCollection<Array<Partial<ContentBlock> & Record<string, unknown>>>('content', local.content as unknown as Array<Partial<ContentBlock> & Record<string, unknown>>),
      optionalCollection<typeof local.settings>('settings', local.settings),
    ]);

    const byIndex = (index: number): BackofficeEvent => local.events[index] ?? local.events[0];
    return {
      ...local,
      users,
      organizers,
      events: events.map((event, index) => normalizeEvent(event, byIndex(index))),
      orders,
      categories: categories.map(normalizeCategory),
      travels: travels.map(normalizeTravel),
      movies: movies.map(normalizeMovie),
      content: content.map(normalizeContent),
      settings: { ...local.settings, ...settings },
      source: hasAdminSession() ? 'api' : 'local-fallback',
    };
  },
  async deleteUser(id: string): Promise<void> { try { await request(`/admin/users/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteUser(id); } },
  async updateOrganizer(id: string, patch: Partial<OrganizerProfile>): Promise<void> { try { await request(`/admin/organizers/${id}`, { method: 'PUT', body: JSON.stringify(patch) }); } catch { backofficeService.updateOrganizer(id, patch); } },
  async updateEvent(id: string, patch: Partial<BackofficeEvent>): Promise<void> { try { await request(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(patch) }); } catch { backofficeService.updateEventByAdmin(id, patch); } },
  async deleteEvent(id: string): Promise<void> { try { await request(`/admin/events/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteEventByAdmin(id); } },
  async saveTravel(editing: Omit<TravelModel, 'id'> & { id?: string }): Promise<void> { try { if (editing.id) await request(`/admin/travels/${editing.id}`, { method: 'PUT', body: JSON.stringify(editing) }); else await request('/admin/travels', { method: 'POST', body: JSON.stringify(editing) }); } catch { editing.id ? backofficeService.updateTravel(editing.id, editing) : backofficeService.createTravel(editing); } },
  async updateTravel(id: string, patch: Partial<TravelModel>): Promise<void> { try { await request(`/admin/travels/${id}`, { method: 'PUT', body: JSON.stringify(patch) }); } catch { backofficeService.updateTravel(id, patch); } },
  async deleteTravel(id: string): Promise<void> { try { await request(`/admin/travels/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteTravel(id); } },
  async saveMovie(editing: Omit<MovieModel, 'id'> & { id?: string }): Promise<void> { try { if (editing.id) await request(`/admin/movies/${editing.id}`, { method: 'PUT', body: JSON.stringify(editing) }); else await request('/admin/movies', { method: 'POST', body: JSON.stringify(editing) }); } catch { editing.id ? backofficeService.updateMovie(editing.id, editing) : backofficeService.createMovie(editing); } },
  async updateMovie(id: string, patch: Partial<MovieModel>): Promise<void> { try { await request(`/admin/movies/${id}`, { method: 'PUT', body: JSON.stringify(patch) }); } catch { backofficeService.updateMovie(id, patch); } },
  async deleteMovie(id: string): Promise<void> { try { await request(`/admin/movies/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteMovie(id); } },
  async saveCategory(editing: Omit<CategoryModel, 'id'> & { id?: string }): Promise<void> { try { if (editing.id) await request(`/admin/categories/${editing.id}`, { method: 'PUT', body: JSON.stringify(editing) }); else await request('/admin/categories', { method: 'POST', body: JSON.stringify(editing) }); } catch { editing.id ? backofficeService.updateCategory(editing.id, editing) : backofficeService.createCategory(editing); } },
  async updateCategory(id: string, patch: Partial<CategoryModel>): Promise<void> { try { await request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(patch) }); } catch { backofficeService.updateCategory(id, patch); } },
  async deleteCategory(id: string): Promise<void> { try { await request(`/admin/categories/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteCategory(id); } },
  async saveContent(editing: Omit<ContentBlock, 'id'> & { id?: string }): Promise<void> { try { if (editing.id) await request(`/admin/content/${editing.id}`, { method: 'PUT', body: JSON.stringify(editing) }); else await request('/admin/content', { method: 'POST', body: JSON.stringify(editing) }); } catch { editing.id ? backofficeService.updateContent(editing.id, editing) : backofficeService.addContent(editing); } },
  async updateContent(id: string, patch: Partial<ContentBlock>): Promise<void> { try { await request(`/admin/content/${id}`, { method: 'PUT', body: JSON.stringify(patch) }); } catch { backofficeService.updateContent(id, patch); } },
  async deleteContent(id: string): Promise<void> { try { await request(`/admin/content/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteContent(id); } },
  async updateSettings(patch: Partial<DbShape['settings']>): Promise<void> { try { await request('/admin/settings', { method: 'PUT', body: JSON.stringify(patch) }); } catch { backofficeService.updateSettings(patch); } },
};
