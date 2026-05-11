import { City } from '../types/api';
import { API_BASE_URL } from './api/config';
import { getPublicCategories, getPublicEvent, getPublicEvents } from './publicApi';

interface EventFilters {
  search?: string;
  category?: string;
  city?: string;
  quick_date?: string;
  sort?: string;
  page?: number;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    cache: 'no-store',
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

export async function getEvents(filters: EventFilters) {
  return getPublicEvents({
    search: filters.search,
    category: filters.category,
    city: filters.city,
    quick_date: filters.quick_date,
    sort: filters.sort,
    page: filters.page,
  });
}

export async function getEvent(slug: string) {
  return getPublicEvent(slug);
}

export async function getCategories() {
  return getPublicCategories();
}

export async function getCities(): Promise<City[]> {
  const response = await request<{ data: City[] }>('/cities');
  return response.data;
}

export async function subscribeNewsletter(email: string): Promise<{ message: string }> {
  return request('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}
