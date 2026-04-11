import { Category, City, EventItem, PaginatedResponse } from '../types/api';

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
    throw new Error(`Erreur API (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export function getEvents(filters: EventFilters): Promise<PaginatedResponse<EventItem>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.append(key, String(value));
  });

  return request<PaginatedResponse<EventItem>>(`/events?${params.toString()}`);
}

export async function getEvent(slug: string): Promise<EventItem> {
  const response = await request<{ data: EventItem }>(`/events/${slug}`);
  return response.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await request<{ data: Category[] }>('/categories');
  return response.data;
}

export async function getCities(): Promise<City[]> {
  const response = await request<{ data: City[] }>('/cities');
  return response.data;
}

export function subscribeNewsletter(email: string): Promise<{ message: string }> {
  return request('/newsletter/subscribe', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
}
