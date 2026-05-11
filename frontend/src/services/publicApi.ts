import { API_BASE_URL } from './api/config';
import { Category, EventItem, PaginatedResponse } from '../types/api';

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

export interface MovieSession {
  id: number | string;
  session_date: string;
  session_time: string;
  cinema: string | null;
  city: string | null;
  price: number;
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

function mapEvent(raw: EventItem & Record<string, unknown>): EventItem {
  const image = normalizeMediaUrl(raw.image_url ?? raw.image);
  return { ...raw, image_url: image };
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

export async function getMovieSessions(slug: string): Promise<MovieSession[]> {
  return unwrapList(await request<MovieSession[] | { data: MovieSession[] }>(`/movies/${slug}/sessions`));
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
}

export async function getPublicOrganizer(slug: string): Promise<{ organizer: PublicOrganizerProfile; events: EventItem[] }> {
  const payload = await request<{ organizer: PublicOrganizerProfile; events: Array<EventItem & Record<string, unknown>> }>(`/organizers/${slug}`);
  return {
    organizer: {
      ...payload.organizer,
      logo: payload.organizer.logo ? normalizeMediaUrl(payload.organizer.logo) : null,
      cover_image: payload.organizer.cover_image ? normalizeMediaUrl(payload.organizer.cover_image) : null,
    },
    events: payload.events.map((event) => mapEvent(event)),
  };
}
