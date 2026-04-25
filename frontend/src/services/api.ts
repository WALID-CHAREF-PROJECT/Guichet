import { Category, City, EventItem, PaginatedResponse } from '../types/api';
import { apiClient } from './api/apiClient';
import { eventTags, platformEvents } from './platformData';
import { safeFetchData } from './safeApi';

interface EventFilters {
  search?: string;
  category?: string;
  city?: string;
  quick_date?: string;
  sort?: string;
  page?: number;
}

const fallbackCategories: Category[] = eventTags.map((tag, index) => ({
  id: index + 1,
  name: tag.label,
  slug: tag.id
}));

const fallbackCities: City[] = [
  { id: 1, name: 'Casablanca', slug: 'casablanca' },
  { id: 2, name: 'Rabat', slug: 'rabat' },
  { id: 3, name: 'Marrakech', slug: 'marrakech' }
];

function mapPlatformEventToApiEvent(event: (typeof platformEvents)[number]): EventItem {
  const city = fallbackCities.find((item) => event.location.toLowerCase().includes(item.name.toLowerCase())) ?? fallbackCities[0];
  const category = fallbackCategories.find((item) => event.tags.includes(item.slug)) ?? fallbackCategories[0];
  return {
    id: event.id,
    slug: event.slug,
    organizer: event.organizer,
    title: event.title,
    venue: event.location,
    city,
    category,
    description: event.description,
    image_url: event.image,
    starts_at: event.date,
    starts_at_human: `${event.date} · ${event.time}`,
    price_mad: Number(event.price.replace(/[^\d]/g, '')) || 0,
    is_free: false,
    is_sold_out: false,
    badge: null
  };
}

function applyFilters(events: EventItem[], filters: EventFilters): EventItem[] {
  const query = (filters.search ?? '').toLowerCase().trim();
  return events
    .filter((event) => !query || event.title.toLowerCase().includes(query) || event.venue.toLowerCase().includes(query))
    .filter((event) => !filters.category || event.category.slug === filters.category)
    .filter((event) => !filters.city || event.city.slug === filters.city);
}

function fallbackEvents(filters: EventFilters): PaginatedResponse<EventItem> {
  const mapped = platformEvents.map(mapPlatformEventToApiEvent);
  const data = applyFilters(mapped, filters);
  return {
    data,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: data.length,
      total: data.length
    }
  };
}

export async function getEvents(filters: EventFilters): Promise<PaginatedResponse<EventItem>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.append(key, String(value));
  });
  return safeFetchData(
    () => apiClient<PaginatedResponse<EventItem>>(`/events?${params.toString()}`),
    fallbackEvents(filters)
  );
}

export async function getEvent(slug: string): Promise<EventItem> {
  const fallback = mapPlatformEventToApiEvent(platformEvents.find((item) => item.slug === slug) ?? platformEvents[0]);
  return safeFetchData(
    async () => {
      const response = await apiClient<{ data: EventItem }>(`/events/${slug}`);
      return response.data;
    },
    fallback
  );
}

export async function getCategories(): Promise<Category[]> {
  return safeFetchData(
    async () => {
      const response = await apiClient<{ data: Category[] }>('/categories');
      return response.data;
    },
    fallbackCategories
  );
}

export async function getCities(): Promise<City[]> {
  return safeFetchData(
    async () => {
      const response = await apiClient<{ data: City[] }>('/cities');
      return response.data;
    },
    fallbackCities
  );
}

export async function subscribeNewsletter(email: string): Promise<{ message: string }> {
  return apiClient('/newsletter/subscribe', {
    method: 'POST',
    body: { email },
    skipAuth: true
  });
}
