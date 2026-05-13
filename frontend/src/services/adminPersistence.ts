import { API_BASE_URL } from './api/config';
import { getAuthToken, clearAuthStorage } from './api/authClient';
import { backofficeService, BackofficeEvent, BackofficeOrder, CategoryModel, ContentBlock, DbShape, MovieModel, OrganizerProfile, TravelModel } from './backoffice';
import { StoredUser, getCurrentUser, getUsers } from './storage';

export interface AdminData extends DbShape {
  users: StoredUser[];
  source: 'api' | 'local-fallback';
  failedCollections?: AdminCollection[];
}

export type AdminCollection = 'users' | 'organizers' | 'events' | 'orders' | 'categories' | 'travels' | 'movies' | 'content' | 'settings';

export class AdminApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly url: string,
    readonly body: unknown,
  ) {
    super(message);
    this.name = 'AdminApiError';
  }
}

function adminDebug(message: string, context?: Record<string, unknown>): void {
  if (import.meta.env.DEV) console.info(`[admin] ${message}`, context ?? '');
}

function logAdminFailure(path: string, error: unknown): void {
  if (!import.meta.env.DEV) return;
  if (error instanceof AdminApiError) {
    console.error('[admin] endpoint failed', { url: error.url, status: error.status, body: error.body });
    return;
  }
  console.error('[admin] endpoint failed', { url: `${API_BASE_URL}${path}`, error });
}

function hasAdminSession(): boolean {
  return Boolean(getAuthToken() && getCurrentUser()?.role === 'admin');
}

function headers(): HeadersInit {
  const token = getAuthToken();
  return { 'Content-Type': 'application/json', Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}

async function readBody(response: Response): Promise<unknown> {
  const text = await response.text().catch(() => '');
  if (!text) return null;
  try { return JSON.parse(text) as unknown; } catch { return text; }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!hasAdminSession()) throw new Error('Admin authentication required for admin API persistence.');
  const url = `${API_BASE_URL}${path}`;
  adminDebug('request', { url, hasToken: Boolean(getAuthToken()), role: getCurrentUser()?.role });
  const response = await fetch(url, { ...init, headers: { ...headers(), ...(init?.headers ?? {}) } });
  if (!response.ok) {
    const body = await readBody(response);
    const message = typeof body === 'object' && body && 'message' in body ? String((body as { message?: unknown }).message) : `API error ${response.status}`;
    if (response.status === 401 || response.status === 403) clearAuthStorage();
    throw new AdminApiError(message, response.status, url, body);
  }
  if (response.status === 204) return {} as T;
  return await response.json() as T;
}

async function optionalCollection<T>(name: AdminCollection, fallback: T): Promise<{ data: T; failed: boolean }> {
  try {
    return { data: await request<T>(`/admin/${name}`), failed: false };
  } catch (error) {
    logAdminFailure(`/admin/${name}`, error);
    return { data: fallback, failed: true };
  }
}

const bool = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return fallback;
};
const str = (value: unknown, fallback = ''): string => typeof value === 'string' ? value : fallback;
const num = (value: unknown, fallback = 0): number => Number.isFinite(Number(value)) ? Number(value) : fallback;
const array = <T>(value: unknown, fallback: T[]): T[] => Array.isArray(value) ? value as T[] : fallback;
function mediaUrl(value: unknown): string {
  const raw = str(value);
  if (!raw || /^(https?:|data:|blob:)/i.test(raw)) return raw;
  const origin = API_BASE_URL.replace(/\/api\/?$/, '');
  return raw.startsWith('/') ? `${origin}${raw}` : `${origin}/storage/${raw.replace(/^storage\//, '')}`;
}

function normalizeCategory(raw: Partial<CategoryModel> & Record<string, unknown>): CategoryModel {
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    type: (str(raw.type, 'event') as CategoryModel['type']),
    name: str(raw.name),
    slug: str(raw.slug, str(raw.name).toLowerCase().replace(/[^a-z0-9]+/g, '-')),
    icon: str(raw.icon),
    image: mediaUrl(raw.image),
    isActive: bool(raw.isActive ?? raw.is_active, true),
    order: num(raw.order ?? raw.display_order ?? raw.sort_order, 1),
  };
}

function normalizeTravel(raw: Partial<TravelModel> & Record<string, unknown>): TravelModel {
  return { id: String(raw.id ?? crypto.randomUUID()), image: mediaUrl(raw.image ?? raw.image_url), title: str(raw.title), category: str(raw.category, 'Voyage'), destination: str(raw.destination ?? raw.venue), departureDate: str(raw.departureDate ?? raw.departure_date ?? raw.starts_at), price: num(raw.price ?? raw.price_mad), description: str(raw.description), status: (str(raw.status, 'draft') as TravelModel['status']), featured: bool(raw.featured ?? raw.is_featured) };
}

function normalizeMovie(raw: Partial<MovieModel> & Record<string, unknown>): MovieModel {
  const sessionsRaw = Array.isArray(raw.sessions) ? raw.sessions : [];
  return {
    id: String(raw.id ?? crypto.randomUUID()),
    poster: mediaUrl(raw.poster ?? raw.image ?? raw.image_url),
    title: str(raw.title),
    genre: str(raw.genre),
    duration: str(raw.duration),
    releaseDate: str(raw.releaseDate ?? raw.release_date ?? raw.starts_at),
    cinemas: str(raw.cinemas ?? raw.venue),
    description: str(raw.description ?? raw.synopsis),
    status: (str(raw.status, 'draft') as MovieModel['status']),
    featured: bool(raw.featured ?? raw.is_featured),
    sessions: sessionsRaw.map((session: any) => ({ id: String(session.id ?? crypto.randomUUID()), sessionDate: str(session.sessionDate ?? session.session_date), sessionTime: str(session.sessionTime ?? session.session_time), cinema: str(session.cinema), city: str(session.city), hallName: str(session.hallName ?? session.hall_name, 'Salle 1'), price: num(session.price, 70), seatingEnabled: bool(session.seatingEnabled ?? session.seating_enabled), seatTemplate: (str(session.seatTemplate ?? session.seat_template, 'medium') as any), standardPrice: num(session.standardPrice ?? session.standard_price ?? session.price, 70), vipPrice: num(session.vipPrice ?? session.vip_price ?? Math.round(num(session.price, 70) * 1.45)), vvipPrice: num(session.vvipPrice ?? session.vvip_price ?? Math.round(num(session.price, 70) * 2.1)), reservedSeatCount: num(session.reservedSeatCount ?? session.reserved_seat_count, 0), reservedSeats: Array.isArray(session.reservedSeats) ? session.reservedSeats : [] })),
  };
}


function normalizePlanZones(value: unknown, fallback: BackofficeEvent['planZones'] = []): BackofficeEvent['planZones'] {
  return array<Record<string, unknown>>(value, fallback as unknown as Record<string, unknown>[]).map((zone, index) => ({
    id: String(zone.id ?? `zone-${index}`),
    name: str(zone.name),
    label: str(zone.label, str(zone.name)),
    price: num(zone.price),
    capacity: num(zone.capacity),
    availableCapacity: num(zone.availableCapacity ?? zone.available_capacity, num(zone.capacity)),
    color: str(zone.color, '#f97316'),
    sortOrder: num(zone.sortOrder ?? zone.sort_order, index),
    isAvailable: bool(zone.isAvailable ?? zone.is_available, true),
  }));
}

function normalizeContent(raw: Partial<ContentBlock> & Record<string, unknown>): ContentBlock {
  return { id: String(raw.id ?? crypto.randomUUID()), type: (str(raw.type, 'section') as ContentBlock['type']), title: str(raw.title), subtitle: str(raw.subtitle), description: str(raw.description), ctaLabel: str(raw.ctaLabel ?? raw.cta_label), ctaLink: str(raw.ctaLink ?? raw.cta_link), image: mediaUrl(raw.image), backgroundImage: mediaUrl(raw.backgroundImage ?? raw.background_image), visible: bool(raw.visible ?? raw.is_visible, true), order: num(raw.order ?? raw.display_order ?? raw.sort_order, 1) };
}

function normalizeEvent(raw: Partial<BackofficeEvent> & Record<string, unknown>, fallback: BackofficeEvent): BackofficeEvent {
  const buyingMode = str(raw.buyingMode ?? raw.buying_mode, fallback.buyingMode ?? 'ticket') as BackofficeEvent['buyingMode'];
  const planType = raw.planType ?? raw.plan_type ?? fallback.planType ?? null;
  return {
    ...fallback,
    ...raw,
    id: String(raw.id ?? fallback.id),
    organizerId: String(raw.organizerId ?? raw.organizer_id ?? fallback.organizerId),
    title: str(raw.title, fallback.title),
    slug: str(raw.slug, fallback.slug),
    category: str(raw.category ?? raw.type, fallback.category),
    city: str(raw.city ?? raw.city_name, fallback.city),
    location: str(raw.location ?? raw.venue, fallback.location),
    date: str(raw.date ?? raw.event_date ?? raw.starts_at, fallback.date),
    time: str(raw.time ?? raw.event_time, fallback.time),
    image: mediaUrl(raw.image ?? raw.image_url ?? raw.featured_image) || fallback.image,
    status: (str(raw.status, fallback.status) as BackofficeEvent['status']),
    featured: bool(raw.featured ?? raw.is_featured, fallback.featured),
    buyingMode,
    hasPlan: buyingMode === 'plan' && bool(raw.hasPlan ?? raw.has_plan, fallback.hasPlan),
    planType: buyingMode === 'plan' ? (planType as BackofficeEvent['planType']) : null,
    seatingEnabled: buyingMode === 'plan' && bool(raw.seatingEnabled ?? raw.seating_enabled, fallback.seatingEnabled),
    planZones: normalizePlanZones(raw.planZones ?? raw.zones, fallback.planZones ?? []),
  };
}


function compactPayload(values: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(Object.entries(values).filter(([, value]) => value !== undefined));
}

function slugFrom(value: string, fallback: string): string {
  const slug = value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  return slug || fallback;
}


function eventPayload(value: Partial<BackofficeEvent>): Record<string, unknown> {
  const buyingMode = value.buyingMode;
  return compactPayload({
    organizer_id: value.organizerId,
    title: value.title,
    slug: value.slug || (value.title ? slugFrom(value.title, `event-${Date.now()}`) : undefined),
    type: value.category,
    short_description: value.shortDescription,
    description: value.description,
    city_name: value.city,
    venue: value.location,
    event_date: value.date,
    event_time: value.time,
    image: value.image,
    image_url: value.image,
    status: value.status,
    featured: value.featured,
    price_mad: value.ticketTypes?.[0]?.price,
    buying_mode: buyingMode,
    has_plan: buyingMode === undefined ? undefined : buyingMode === 'plan',
    plan_type: buyingMode === undefined ? undefined : buyingMode === 'plan' ? (value.planType ?? 'theatre') : null,
    seating_enabled: buyingMode === undefined ? undefined : buyingMode === 'plan' ? value.seatingEnabled !== false : false,
    zones: buyingMode === 'plan' ? value.planZones?.map((zone, index) => ({
      name: zone.name,
      label: zone.label,
      price: zone.price,
      capacity: zone.capacity,
      available_capacity: zone.availableCapacity,
      color: zone.color,
      sort_order: zone.sortOrder ?? index,
      is_available: zone.isAvailable,
    })) : undefined,
  });
}

function travelPayload(value: Partial<TravelModel>): Record<string, unknown> {
  return compactPayload({
    title: value.title,
    slug: value.title ? slugFrom(value.title, `travel-${Date.now()}`) : undefined,
    category: value.category,
    destination: value.destination,
    departure_date: value.departureDate,
    price: value.price,
    image: value.image,
    gallery: value.gallery ? JSON.stringify(value.gallery) : undefined,
    description: value.description,
    status: value.status,
    featured: value.featured,
  });
}

function moviePayload(value: Partial<MovieModel>): Record<string, unknown> {
  return compactPayload({
    title: value.title,
    slug: value.title ? slugFrom(value.title, `movie-${Date.now()}`) : undefined,
    genre: value.genre,
    duration: value.duration,
    release_date: value.releaseDate,
    poster: value.poster,
    synopsis: value.description,
    status: value.status,
    featured: value.featured,
    sessions: value.sessions?.map((session) => ({
      id: session.id,
      session_date: session.sessionDate,
      session_time: session.sessionTime,
      cinema: session.cinema,
      city: session.city,
      hall_name: session.hallName,
      price: session.price,
      standard_price: session.standardPrice ?? session.price,
      vip_price: session.vipPrice ?? Math.round(Number(session.price) * 1.45),
      vvip_price: session.vvipPrice ?? Math.round(Number(session.price) * 2.1),
      reserved_seat_count: session.reservedSeatCount ?? 0,
      seating_enabled: session.seatingEnabled,
      seat_template: session.seatTemplate,
      reserved_seats: JSON.stringify(session.reservedSeats ?? []),
    })),
  });
}

function categoryPayload(value: Partial<CategoryModel>): Record<string, unknown> {
  return compactPayload({
    type: value.type,
    name: value.name,
    slug: value.slug || (value.name ? slugFrom(value.name, `category-${Date.now()}`) : undefined),
    icon: value.icon,
    image: value.image,
    is_active: value.isActive,
    display_order: value.order,
  });
}

function organizerPayload(value: Partial<OrganizerProfile>): Record<string, unknown> {
  return compactPayload({
    user_id: value.userId,
    company_name: value.companyName,
    slug: value.slug || (value.companyName ? slugFrom(value.companyName, `organizer-${Date.now()}`) : undefined),
    logo: value.logo,
    cover_image: value.coverImage,
    description: value.description,
    city: value.city,
    address: value.address,
    website: value.website,
    support_email: value.email,
    support_phone: value.phone,
    is_approved: value.isApproved,
  });
}

function contentPayload(value: Partial<ContentBlock>): Record<string, unknown> {
  return compactPayload({
    type: value.type,
    title: value.title,
    subtitle: value.subtitle,
    description: value.description,
    cta_label: value.ctaLabel,
    cta_link: value.ctaLink,
    image: value.image,
    background_image: value.backgroundImage,
    visible: value.visible,
    display_order: value.order,
  });
}

function normalizeOrder(raw: Partial<BackofficeOrder> & Record<string, unknown>, fallback: BackofficeOrder): BackofficeOrder {
  return {
    ...fallback,
    ...raw,
    id: String(raw.id ?? fallback.id),
    reference: str(raw.reference, fallback.reference),
    customerId: String(raw.customerId ?? raw.customer_id ?? fallback.customerId),
    customerName: str(raw.customerName ?? raw.customer_name, fallback.customerName),
    customerEmail: str(raw.customerEmail ?? raw.customer_email, fallback.customerEmail),
    productType: (str(raw.productType ?? raw.product_type, fallback.productType) as BackofficeOrder['productType']),
    productId: String(raw.productId ?? raw.product_id ?? fallback.productId),
    productName: str(raw.productName ?? raw.product_name, fallback.productName),
    quantity: num(raw.quantity, fallback.quantity),
    total: num(raw.total, fallback.total),
    paymentStatus: (str(raw.paymentStatus ?? raw.payment_status, fallback.paymentStatus) as BackofficeOrder['paymentStatus']),
    bookingStatus: (str(raw.bookingStatus ?? raw.booking_status, fallback.bookingStatus) as BackofficeOrder['bookingStatus']),
    createdAt: str(raw.createdAt ?? raw.created_at, fallback.createdAt),
  };
}

export const adminPersistence = {
  async load(): Promise<AdminData> {
    const local = backofficeService.getAdminData();
    if (!hasAdminSession()) {
      return { ...local, users: [], source: 'local-fallback' };
    }
    adminDebug('boot', { apiBaseUrl: API_BASE_URL, role: getCurrentUser()?.role, hasToken: Boolean(getAuthToken()) });
    const collectionNames: AdminCollection[] = ['users', 'organizers', 'events', 'orders', 'categories', 'travels', 'movies', 'content', 'settings'];
    const collectionResults = await Promise.all([
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
    const [users, organizers, events, orders, categories, travels, movies, content, settings] = collectionResults.map((result) => result.data);
    const failedCollections = collectionResults.reduce<AdminCollection[]>((failed, result, index) => result.failed ? [...failed, collectionNames[index]] : failed, []);

    const byIndex = (index: number): BackofficeEvent => local.events[index] ?? local.events[0];
    return {
      ...local,
      users: array<StoredUser>(users, getUsers()),
      organizers: array<OrganizerProfile>(organizers, local.organizers),
      events: array<Partial<BackofficeEvent> & Record<string, unknown>>(events, local.events as unknown as Array<Partial<BackofficeEvent> & Record<string, unknown>>).map((event, index) => normalizeEvent(event, byIndex(index))),
      orders: array<Partial<BackofficeOrder> & Record<string, unknown>>(orders, local.orders as unknown as Array<Partial<BackofficeOrder> & Record<string, unknown>>).map((order, index) => normalizeOrder(order, local.orders[index] ?? local.orders[0])),
      categories: array<Partial<CategoryModel> & Record<string, unknown>>(categories, local.categories as unknown as Array<Partial<CategoryModel> & Record<string, unknown>>).map(normalizeCategory),
      travels: array<Partial<TravelModel> & Record<string, unknown>>(travels, local.travels as unknown as Array<Partial<TravelModel> & Record<string, unknown>>).map(normalizeTravel),
      movies: array<Partial<MovieModel> & Record<string, unknown>>(movies, local.movies as unknown as Array<Partial<MovieModel> & Record<string, unknown>>).map(normalizeMovie),
      content: array<Partial<ContentBlock> & Record<string, unknown>>(content, local.content as unknown as Array<Partial<ContentBlock> & Record<string, unknown>>).map(normalizeContent),
      settings: { ...local.settings, ...settings },
      source: hasAdminSession() ? 'api' : 'local-fallback',
      failedCollections,
    };
  },
  async deleteUser(id: string): Promise<void> { try { await request(`/admin/users/${id}`, { method: 'DELETE' }); } catch (error) { logAdminFailure(`/admin/users/${id}`, error); backofficeService.deleteUser(id); } },
  async updateOrganizer(id: string, patch: Partial<OrganizerProfile>): Promise<void> { try { await request(`/admin/organizers/${id}`, { method: 'PUT', body: JSON.stringify(organizerPayload(patch)) }); } catch (error) { logAdminFailure(`/admin/organizers/${id}`, error); backofficeService.updateOrganizer(id, patch); } },
  async saveEvent(editing: Omit<BackofficeEvent, 'id'> & { id?: string }): Promise<void> { try { const payload = eventPayload(editing); if (editing.id) await request(`/admin/events/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); else await request('/admin/events', { method: 'POST', body: JSON.stringify(payload) }); } catch (error) { logAdminFailure(editing.id ? `/admin/events/${editing.id}` : '/admin/events', error); editing.id ? backofficeService.updateEventByAdmin(editing.id, editing) : backofficeService.createEvent(editing); } },
  async updateEvent(id: string, patch: Partial<BackofficeEvent>): Promise<void> { try { await request(`/admin/events/${id}`, { method: 'PUT', body: JSON.stringify(eventPayload(patch)) }); } catch { backofficeService.updateEventByAdmin(id, patch); } },
  async deleteEvent(id: string): Promise<void> { try { await request(`/admin/events/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteEventByAdmin(id); } },
  async saveTravel(editing: Omit<TravelModel, 'id'> & { id?: string }): Promise<void> { try { const payload = travelPayload(editing); if (editing.id) await request(`/admin/travels/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); else await request('/admin/travels', { method: 'POST', body: JSON.stringify(payload) }); } catch (error) { logAdminFailure(editing.id ? `/admin/travels/${editing.id}` : '/admin/travels', error); editing.id ? backofficeService.updateTravel(editing.id, editing) : backofficeService.createTravel(editing); } },
  async updateTravel(id: string, patch: Partial<TravelModel>): Promise<void> { try { await request(`/admin/travels/${id}`, { method: 'PUT', body: JSON.stringify(travelPayload(patch)) }); } catch (error) { logAdminFailure(`/admin/travels/${id}`, error); backofficeService.updateTravel(id, patch); } },
  async deleteTravel(id: string): Promise<void> { try { await request(`/admin/travels/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteTravel(id); } },
  async saveMovie(editing: Omit<MovieModel, 'id'> & { id?: string }): Promise<void> { try { const payload = moviePayload(editing); if (editing.id) await request(`/admin/movies/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); else await request('/admin/movies', { method: 'POST', body: JSON.stringify(payload) }); } catch (error) { logAdminFailure(editing.id ? `/admin/movies/${editing.id}` : '/admin/movies', error); editing.id ? backofficeService.updateMovie(editing.id, editing) : backofficeService.createMovie(editing); } },
  async updateMovie(id: string, patch: Partial<MovieModel>): Promise<void> { try { await request(`/admin/movies/${id}`, { method: 'PUT', body: JSON.stringify(moviePayload(patch)) }); } catch (error) { logAdminFailure(`/admin/movies/${id}`, error); backofficeService.updateMovie(id, patch); } },
  async deleteMovie(id: string): Promise<void> { try { await request(`/admin/movies/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteMovie(id); } },
  async saveCategory(editing: Omit<CategoryModel, 'id'> & { id?: string }): Promise<void> { try { const payload = categoryPayload(editing); if (editing.id) await request(`/admin/categories/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); else await request('/admin/categories', { method: 'POST', body: JSON.stringify(payload) }); } catch (error) { logAdminFailure(editing.id ? `/admin/categories/${editing.id}` : '/admin/categories', error); editing.id ? backofficeService.updateCategory(editing.id, editing) : backofficeService.createCategory(editing); } },
  async updateCategory(id: string, patch: Partial<CategoryModel>): Promise<void> { try { await request(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(categoryPayload(patch)) }); } catch (error) { logAdminFailure(`/admin/categories/${id}`, error); backofficeService.updateCategory(id, patch); } },
  async deleteCategory(id: string): Promise<void> { try { await request(`/admin/categories/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteCategory(id); } },
  async saveContent(editing: Omit<ContentBlock, 'id'> & { id?: string }): Promise<void> { try { const payload = contentPayload(editing); if (editing.id) await request(`/admin/content/${editing.id}`, { method: 'PUT', body: JSON.stringify(payload) }); else await request('/admin/content', { method: 'POST', body: JSON.stringify(payload) }); } catch (error) { logAdminFailure(editing.id ? `/admin/content/${editing.id}` : '/admin/content', error); editing.id ? backofficeService.updateContent(editing.id, editing) : backofficeService.addContent(editing); } },
  async updateContent(id: string, patch: Partial<ContentBlock>): Promise<void> { try { await request(`/admin/content/${id}`, { method: 'PUT', body: JSON.stringify(contentPayload(patch)) }); } catch (error) { logAdminFailure(`/admin/content/${id}`, error); backofficeService.updateContent(id, patch); } },
  async deleteContent(id: string): Promise<void> { try { await request(`/admin/content/${id}`, { method: 'DELETE' }); } catch { backofficeService.deleteContent(id); } },
  async updateSettings(patch: Partial<DbShape['settings']>): Promise<void> { try { await request('/admin/settings', { method: 'PUT', body: JSON.stringify(patch) }); } catch { backofficeService.updateSettings(patch); } },
};
