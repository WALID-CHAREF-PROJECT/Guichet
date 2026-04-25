import { Category, City, EventItem, PaginatedResponse } from '../types/api';
import { apiClient } from './api/apiClient';

interface EventFilters {
  search?: string;
  category?: string;
  city?: string;
  quick_date?: string;
  sort?: string;
  page?: number;
}

export async function getEvents(filters: EventFilters): Promise<PaginatedResponse<EventItem>> {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') params.append(key, String(value));
  });
  return apiClient<PaginatedResponse<EventItem>>(`/events?${params.toString()}`);
}

export async function getEvent(slug: string): Promise<EventItem> {
  const response = await apiClient<{ data: EventItem }>(`/events/${slug}`);
  return response.data;
}

export async function getCategories(): Promise<Category[]> {
  const response = await apiClient<{ data: Category[] }>('/categories');
  return response.data;
}

export async function getCities(): Promise<City[]> {
  const response = await apiClient<{ data: City[] }>('/cities');
  return response.data;
}

export async function subscribeNewsletter(email: string): Promise<{ message: string }> {
  return apiClient('/newsletter/subscribe', {
    method: 'POST',
    body: { email },
    skipAuth: true
  });
}
