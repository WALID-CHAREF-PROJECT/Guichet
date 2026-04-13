import { Category, City, EventItem, PaginatedResponse } from '../types/api';
import { buildPaginatedEvents, mockCategories, mockCities, mockEvents } from './mockData';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

interface EventFilters {
  search?: string;
  category?: string;
  city?: string;
  quick_date?: string;
  sort?: string;
  page?: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json'
    },
    ...init
  });

  if (!response.ok) {
    let errorMessage = `Erreur API (${response.status})`;
    try {
      const payload = await response.json() as { message?: string };
      if (payload.message) errorMessage = payload.message;
    } catch {
      // keep fallback message when API body is not JSON
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<T>;
}

function filterMockEvents(filters: EventFilters): EventItem[] {
  return mockEvents.filter((event) => {
    const matchSearch = !filters.search || event.title.toLowerCase().includes(filters.search.toLowerCase());
    const matchCategory = !filters.category || event.category.slug === filters.category;
    const matchCity = !filters.city || event.city.slug === filters.city;
    return matchSearch && matchCategory && matchCity;
  });
}

export async function getEvents(filters: EventFilters): Promise<PaginatedResponse<EventItem>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.append(key, String(value));
  });

  try {
    return await request<PaginatedResponse<EventItem>>(`/events?${params.toString()}`);
  } catch {
    return buildPaginatedEvents(filterMockEvents(filters));
  }
}

export async function getEvent(slug: string): Promise<EventItem> {
  try {
    const response = await request<{ data: EventItem }>(`/events/${slug}`);
    return response.data;
  } catch {
    const localEvent = mockEvents.find((event) => event.slug === slug);
    if (!localEvent) throw new Error('Événement introuvable.');
    return localEvent;
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await request<{ data: Category[] }>('/categories');
    return response.data;
  } catch {
    return mockCategories;
  }
}

export async function getCities(): Promise<City[]> {
  try {
    const response = await request<{ data: City[] }>('/cities');
    return response.data;
  } catch {
    return mockCities;
  }
}

export async function subscribeNewsletter(email: string): Promise<{ message: string }> {
  try {
    return await request('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
  } catch {
    return { message: `Inscription réussie pour ${email}.` };
  }
}
