import { API_BASE_URL } from './api/config';
import { Category, EventItem, PaginatedResponse } from '../types/api';
import { publicProfileSlug } from '../utils/slug';

const fallbackImage = 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=80';

export interface PublicMovie {
  id: string;
  slug: string;
  title: string;
  genre: string;
  duration: string;
  releaseDate: string;
  poster: string;
  image: string;
  synopsis: string;
  description: string;
  featured: boolean;
}

export type CinemaSeatStatus = 'available' | 'reserved' | 'unavailable';
export type CinemaSeatTemplate = 'small' | 'medium' | 'large' | 'premium';
export type CinemaSeatCategory = 'Balcon' | 'Standard' | 'VIP' | 'VVIP';

export interface CinemaSeat {
  id: string;
  row: string;
  number: number;
  status: CinemaSeatStatus;
  category: CinemaSeatCategory;
  zone: CinemaSeatCategory;
  price: number;
  section: 'left' | 'center' | 'right' | 'rear';
}

export interface MovieSession {
  id: number | string;
  movie_id?: number | string;
  session_date: string;
  session_time: string;
  cinema: string | null;
  city: string | null;
  hallName?: string;
  hall_name?: string;
  seatingEnabled: boolean;
  seating_enabled?: boolean | number | string;
  seatTemplate: CinemaSeatTemplate;
  seat_template?: CinemaSeatTemplate;
  reservedSeats?: string[];
  reserved_seats?: string[] | string | null;
  seats?: CinemaSeat[];
  price: number;
  standardPrice?: number;
  standard_price?: number;
  vipPrice?: number;
  vip_price?: number;
  vvipPrice?: number;
  vvip_price?: number;
  reservedSeatCount?: number;
  reserved_seat_count?: number;
}

export interface PublicTravel {
  id: string;
  slug: string;
  title: string;
  category: string;
  collection: string;
  destination: string;
  location: string;
  departureDate: string;
  price: number;
  priceLabel: string;
  image: string;
  gallery: string[];
  description: string;
  featured: boolean;
}

export interface ContentBlock {
  id: string;
  type: 'banner' | 'section' | 'hero' | 'cta' | string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  ctaLabel?: string | null;
  ctaLink?: string | null;
  image?: string | null;
  backgroundImage?: string | null;
  visible: boolean;
  displayOrder: number;
}

function apiOrigin(): string {
  return API_BASE_URL.replace(/\/api\/?$/, '');
}

export function normalizeMediaUrl(value: unknown, fallback = fallbackImage): string {
  if (typeof value !== 'string' || value.trim() === '') return fallback;
  const trimmed = value.trim();
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith('/')) return `${apiOrigin()}${trimmed}`;
  return `${apiOrigin()}/storage/${trimmed.replace(/^storage\//, '')}`;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    cache: 'no-store',
    ...init,
  });

  if (!response.ok) {
    let message = `Erreur API (${response.status})`;
    try {
      const body = await response.json() as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // keep status message
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function unwrapList<T>(payload: T[] | { data: T[] }): T[] {
  return Array.isArray(payload) ? payload : payload.data;
}

function unwrapItem<T>(payload: T | { data: T }): T {
  return payload && typeof payload === 'object' && 'data' in payload ? (payload as { data: T }).data : payload as T;
}

function parseBoolean(value: unknown): boolean {
  return value === true || value === 1 || value === '1' || value === 'true';
}

function normalizeBuyingMode(value: unknown): EventItem['buyingMode'] {
  return value === 'plan' || value === 'reservation' ? value : 'ticket';
}

function normalizePlanType(value: unknown): EventItem['planType'] {
  return value === 'stadium' || value === 'theatre' || value === 'generic' ? value : null;
}

function mapEvent(raw: EventItem & Record<string, unknown>): EventItem {
  const image = normalizeMediaUrl(raw.image_url ?? raw.image);
  const buyingMode = normalizeBuyingMode(raw.buyingMode ?? raw.buying_mode);
  const planType = normalizePlanType(raw.planType ?? raw.plan_type);
  const hasPlan = parseBoolean(raw.hasPlan ?? raw.has_plan);
  const seatingEnabled = parseBoolean(raw.seatingEnabled ?? raw.seating_enabled);

  return {
    ...raw,
    image_url: image,
    organizer_slug: publicProfileSlug(raw.organizer_slug as string | null | undefined, raw.organizer),
    producer_slug: publicProfileSlug((raw as { producer_slug?: string | null }).producer_slug, raw.organizer),
    buyingMode,
    buying_mode: buyingMode,
    hasPlan,
    has_plan: hasPlan,
    planType,
    plan_type: planType,
    seatingEnabled,
    seating_enabled: seatingEnabled,
  };
}

function mapMovie(raw: Record<string, unknown>): PublicMovie {
  const poster = normalizeMediaUrl(raw.poster ?? raw.image);
  return {
    id: String(raw.id),
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? ''),
    genre: String(raw.genre ?? ''),
    duration: String(raw.duration ?? ''),
    releaseDate: String(raw.releaseDate ?? raw.release_date ?? ''),
    poster,
    image: poster,
    synopsis: String(raw.synopsis ?? raw.description ?? ''),
    description: String(raw.description ?? raw.synopsis ?? ''),
    featured: raw.featured === true || raw.featured === 1 || raw.featured === '1',
  };
}

function mapTravel(raw: Record<string, unknown>): PublicTravel {
  const price = Number(raw.price ?? 0);
  return {
    id: String(raw.id),
    slug: String(raw.slug ?? ''),
    title: String(raw.title ?? ''),
    category: String(raw.category ?? raw.collection ?? ''),
    collection: String(raw.collection ?? raw.category ?? ''),
    destination: String(raw.destination ?? raw.location ?? ''),
    location: String(raw.location ?? raw.destination ?? ''),
    departureDate: String(raw.departureDate ?? raw.departure_date ?? ''),
    price,
    priceLabel: String(raw.priceLabel ?? `${price.toLocaleString('fr-FR')} MAD`),
    image: normalizeMediaUrl(raw.image),
    gallery: Array.isArray(raw.gallery) ? raw.gallery.map((item) => normalizeMediaUrl(item)) : [],
    description: String(raw.description ?? ''),
    featured: raw.featured === true || raw.featured === 1 || raw.featured === '1',
  };
}

function mapContent(raw: Record<string, unknown>): ContentBlock {
  return {
    id: String(raw.id),
    type: String(raw.type ?? 'section'),
    title: String(raw.title ?? ''),
    subtitle: typeof raw.subtitle === 'string' ? raw.subtitle : null,
    description: typeof raw.description === 'string' ? raw.description : null,
    ctaLabel: typeof raw.ctaLabel === 'string' ? raw.ctaLabel : typeof raw.cta_label === 'string' ? raw.cta_label : null,
    ctaLink: typeof raw.ctaLink === 'string' ? raw.ctaLink : typeof raw.cta_link === 'string' ? raw.cta_link : null,
    image: raw.image ? normalizeMediaUrl(raw.image) : null,
    backgroundImage: raw.backgroundImage ? normalizeMediaUrl(raw.backgroundImage) : raw.background_image ? normalizeMediaUrl(raw.background_image) : null,
    visible: raw.visible !== false && raw.visible !== 0 && raw.visible !== '0',
    displayOrder: Number(raw.displayOrder ?? raw.display_order ?? 0),
  };
}

export async function getPublicEvents(params: Record<string, string | number | boolean | undefined> = {}): Promise<PaginatedResponse<EventItem>> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value !== undefined && value !== '') search.set(key, String(value)); });
  const payload = await request<PaginatedResponse<EventItem>>(`/events${search.toString() ? `?${search}` : ''}`);
  return { ...payload, data: payload.data.map((item) => mapEvent(item as EventItem & Record<string, unknown>)) };
}

export async function getPublicEvent(slug: string): Promise<EventItem> {
  return mapEvent(unwrapItem(await request<EventItem | { data: EventItem }>(`/events/${slug}`)) as EventItem & Record<string, unknown>);
}


export interface PublicPlanZone {
  id: string;
  name: string;
  label: string;
  price: number;
  available: boolean;
  capacity: number;
  availableCapacity: number;
  color: string;
  planType: 'theatre' | 'stadium' | 'generic';
  sortOrder?: number;
}


export async function getEventPlan(eventId: number | string, planType?: string): Promise<{ eventId: string; planType: string; zones: PublicPlanZone[] }> {
  const search = planType ? `?planType=${encodeURIComponent(planType)}` : '';
  const payload = await request<({ eventId?: string; event_id?: string; planType?: string; plan_type?: string; zones: (PublicPlanZone & { plan_type?: PublicPlanZone['planType']; available_capacity?: number; sort_order?: number })[] })>(`/events/${eventId}/plan${search}`);
  const resolvedPlanType = String(payload.planType ?? payload.plan_type ?? planType ?? 'generic');
  return {
    eventId: String(payload.eventId ?? payload.event_id ?? eventId),
    planType: resolvedPlanType,
    zones: payload.zones.map((zone) => ({
      id: String(zone.id),
      name: String(zone.name),
      label: String(zone.label ?? zone.name),
      price: Number(zone.price ?? 0),
      available: zone.available === true,
      capacity: Number(zone.capacity ?? zone.availableCapacity ?? zone.available_capacity ?? 0),
      availableCapacity: Number(zone.availableCapacity ?? zone.available_capacity ?? zone.capacity ?? 0),
      color: String(zone.color ?? '#f97316'),
      planType: (zone.planType ?? zone.plan_type ?? resolvedPlanType) as PublicPlanZone['planType'],
      sortOrder: Number(zone.sortOrder ?? zone.sort_order ?? 0),
    })),
  };
}

export async function getPublicCategories(type?: string): Promise<Category[]> {
  const payload = await request<Category[] | { data: Category[] }>(`/categories${type ? `?type=${encodeURIComponent(type)}` : ''}`);
  return unwrapList(payload).map((item) => ({ ...item, image: normalizeMediaUrl((item as Category & { image?: string }).image, '') }));
}

export async function getPublicMovies(): Promise<PublicMovie[]> {
  return unwrapList(await request<Record<string, unknown>[] | { data: Record<string, unknown>[] }>('/movies')).map(mapMovie);
}

export async function getPublicMovie(slug: string): Promise<PublicMovie> {
  return mapMovie(unwrapItem(await request<Record<string, unknown> | { data: Record<string, unknown> }>(`/movies/${slug}`)));
}

type ReservedSeatInput = string | { row?: unknown; number?: unknown; seat?: unknown; id?: unknown };

function seatCodeFromReserved(value: ReservedSeatInput): string | null {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const objectMatch = trimmed.match(/^([A-Za-z]+)\s*[-:]?\s*(\d+)$/);
    return objectMatch ? `${objectMatch[1].toUpperCase()}${Number(objectMatch[2])}` : trimmed.toUpperCase();
  }
  if (value && typeof value === 'object') {
    if (typeof value.seat === 'string') return seatCodeFromReserved(value.seat);
    if (typeof value.id === 'string') return value.id.toUpperCase();
    const row = String(value.row ?? '').trim().toUpperCase();
    const number = Number(value.number ?? 0);
    if (row && number > 0) return `${row}${number}`;
  }
  return null;
}

function parseReservedSeats(value: unknown): string[] {
  const normalizeArray = (items: unknown[]): string[] => items.map((item) => seatCodeFromReserved(item as ReservedSeatInput)).filter((item): item is string => Boolean(item));
  if (Array.isArray(value)) return normalizeArray(value);
  if (typeof value === 'string' && value.trim()) {
    try {
      const decoded = JSON.parse(value) as unknown;
      if (Array.isArray(decoded)) return normalizeArray(decoded);
    } catch {
      // fall through to comma-separated legacy format
    }
    return value.split(',').map((item) => seatCodeFromReserved(item)).filter((item): item is string => Boolean(item));
  }
  return [];
}

export function cinemaTemplateDimensions(template: unknown): { rows: number; maxColumns: number; rowCounts: number[] } {
  if (template === 'small') return { rows: 8, maxColumns: 17, rowCounts: [7, 9, 11, 13, 15, 17, 16, 16] };
  if (template === 'large') return { rows: 12, maxColumns: 27, rowCounts: [11, 13, 17, 19, 21, 23, 25, 27, 26, 26, 28, 28] };
  if (template === 'premium') return { rows: 12, maxColumns: 23, rowCounts: [8, 10, 14, 16, 18, 20, 22, 22, 20, 20, 18, 18] };
  return { rows: 12, maxColumns: 23, rowCounts: [9, 11, 13, 15, 17, 19, 21, 23, 22, 22, 24, 24] };
}

function categoryForRow(rowIndex: number, totalRows: number): CinemaSeatCategory {
  if (rowIndex >= totalRows - 3) return 'VVIP';
  if (rowIndex >= Math.floor(totalRows * 0.35) && rowIndex < totalRows - 3) return 'VIP';
  return rowIndex <= 1 ? 'Balcon' : 'Standard';
}

function priceForCategory(session: Pick<MovieSession, 'price' | 'standardPrice' | 'standard_price' | 'vipPrice' | 'vip_price' | 'vvipPrice' | 'vvip_price'>, category: CinemaSeatCategory): number {
  const standard = Number(session.standardPrice ?? session.standard_price ?? session.price ?? 0);
  if (category === 'VIP') return Number(session.vipPrice ?? session.vip_price ?? Math.round(standard * 1.45));
  if (category === 'VVIP') return Number(session.vvipPrice ?? session.vvip_price ?? Math.round(standard * 2.1));
  return standard;
}

function sectionForSeat(seatIndex: number, count: number, rowIndex: number, totalRows: number): CinemaSeat['section'] {
  if (rowIndex >= totalRows - 2) return 'rear';
  const third = count / 3;
  if (seatIndex < third) return 'left';
  if (seatIndex >= third * 2) return 'right';
  return 'center';
}

function deterministicReserved(sessionId: MovieSession['id'], rowIndex: number, number: number, reservedSeatCount: number): boolean {
  const seed = String(sessionId).split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const hash = (seed + (rowIndex + 3) * 31 + number * 17) % 29;
  return hash === 0 || hash === 7 || (reservedSeatCount > 0 && ((rowIndex + 1) * number + seed) % 37 < Math.min(9, reservedSeatCount));
}

export function generateCinemaSeats(session: Pick<MovieSession, 'id' | 'price' | 'seatTemplate' | 'reservedSeats' | 'reservedSeatCount' | 'reserved_seat_count' | 'standardPrice' | 'standard_price' | 'vipPrice' | 'vip_price' | 'vvipPrice' | 'vvip_price'>): CinemaSeat[] {
  const dimensions = cinemaTemplateDimensions(session.seatTemplate);
  const reserved = new Set(session.reservedSeats ?? []);
  const reservedSeatCount = Number(session.reservedSeatCount ?? session.reserved_seat_count ?? 0);
  return dimensions.rowCounts.flatMap((count, rowIndex) => {
    const row = String.fromCharCode(65 + rowIndex);
    const category = categoryForRow(rowIndex, dimensions.rows);
    return Array.from({ length: count }).map((__, seatIndex) => {
      const number = seatIndex + 1;
      const id = `${session.id}-${row}${number}`;
      const code = `${row}${number}`;
      const status: CinemaSeatStatus = reserved.has(code) || reserved.has(id.toUpperCase()) || deterministicReserved(session.id, rowIndex, number, reservedSeatCount) ? 'reserved' : 'available';
      const section = sectionForSeat(seatIndex, count, rowIndex, dimensions.rows);
      return { id, row, number, category, zone: category, price: priceForCategory(session, category), status, section } as CinemaSeat;
    });
  });
}

function mapMovieSession(raw: MovieSession & Record<string, unknown>): MovieSession {
  const reservedSeats = parseReservedSeats(raw.reservedSeats ?? raw.reserved_seats);
  const seatTemplate = (raw.seatTemplate ?? raw.seat_template ?? 'medium') as CinemaSeatTemplate;
  const session: MovieSession = {
    ...raw,
    id: raw.id,
    session_date: String(raw.session_date ?? ''),
    session_time: String(raw.session_time ?? ''),
    cinema: raw.cinema ? String(raw.cinema) : null,
    city: raw.city ? String(raw.city) : null,
    hallName: String(raw.hallName ?? raw.hall_name ?? 'Salle 1'),
    hall_name: String(raw.hall_name ?? raw.hallName ?? 'Salle 1'),
    seatingEnabled: parseBoolean(raw.seatingEnabled ?? raw.seating_enabled),
    seating_enabled: raw.seating_enabled,
    seatTemplate,
    seat_template: seatTemplate,
    reservedSeats,
    price: Number(raw.price ?? 0),
    standardPrice: Number(raw.standardPrice ?? raw.standard_price ?? raw.price ?? 0),
    standard_price: Number(raw.standard_price ?? raw.standardPrice ?? raw.price ?? 0),
    vipPrice: Number(raw.vipPrice ?? raw.vip_price ?? Math.round(Number(raw.price ?? 0) * 1.45)),
    vip_price: Number(raw.vip_price ?? raw.vipPrice ?? Math.round(Number(raw.price ?? 0) * 1.45)),
    vvipPrice: Number(raw.vvipPrice ?? raw.vvip_price ?? Math.round(Number(raw.price ?? 0) * 2.1)),
    vvip_price: Number(raw.vvip_price ?? raw.vvipPrice ?? Math.round(Number(raw.price ?? 0) * 2.1)),
    reservedSeatCount: Number(raw.reservedSeatCount ?? raw.reserved_seat_count ?? 0),
    reserved_seat_count: Number(raw.reserved_seat_count ?? raw.reservedSeatCount ?? 0),
  };
  return { ...session, seats: Array.isArray(raw.seats) ? raw.seats : generateCinemaSeats(session) };
}

export async function getMovieSessions(slug: string): Promise<MovieSession[]> {
  return unwrapList(await request<MovieSession[] | { data: MovieSession[] }>(`/movies/${slug}/sessions`)).map((session) => mapMovieSession(session as MovieSession & Record<string, unknown>));
}

export async function getPublicTravels(params: Record<string, string | undefined> = {}): Promise<PublicTravel[]> {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => { if (value) search.set(key, value); });
  return unwrapList(await request<Record<string, unknown>[] | { data: Record<string, unknown>[] }>(`/travels${search.toString() ? `?${search}` : ''}`)).map(mapTravel);
}

export async function getPublicTravel(slug: string): Promise<PublicTravel> {
  return mapTravel(unwrapItem(await request<Record<string, unknown> | { data: Record<string, unknown> }>(`/travels/${slug}`)));
}

export async function getContentBlocks(): Promise<ContentBlock[]> {
  return unwrapList(await request<Record<string, unknown>[] | { data: Record<string, unknown>[] }>('/homepage/content')).map(mapContent);
}

export interface PublicOrganizerProfile {
  id: string;
  company_name: string;
  slug: string;
  logo?: string | null;
  cover_image?: string | null;
  description?: string | null;
  city?: string | null;
  address?: string | null;
  support_email?: string | null;
  support_phone?: string | null;
  verified?: boolean;
  is_active?: boolean;
}

export async function getPublicOrganizer(slug: string): Promise<{ organizer: PublicOrganizerProfile; events: EventItem[] }> {
  const payload = await request<{ organizer: PublicOrganizerProfile; events: Array<EventItem & Record<string, unknown>> }>(`${'/organizers/'}${encodeURIComponent(publicProfileSlug(slug) || slug)}`);
  return {
    organizer: {
      ...payload.organizer,
      slug: publicProfileSlug(payload.organizer.slug, payload.organizer.company_name),
      logo: payload.organizer.logo ? normalizeMediaUrl(payload.organizer.logo) : null,
      cover_image: payload.organizer.cover_image ? normalizeMediaUrl(payload.organizer.cover_image) : null,
    },
    events: payload.events.map((event) => mapEvent(event)),
  };
}
