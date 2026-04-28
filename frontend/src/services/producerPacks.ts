import { getAuthToken } from './api/authClient';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api';

export interface ProducerRecord {
  id: number;
  user_id: number | null;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  logo?: string;
  cover_image?: string;
  city?: string;
  address?: string;
  support_email?: string;
  support_phone?: string;
  description?: string;
}

export interface ProducerCreatePayload extends Partial<ProducerRecord> {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  pack_id?: number;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
}

export interface PackRecord {
  id: number;
  name: string;
  code: string;
  max_events_per_month: number | null;
  max_active_events: number | null;
  is_active: boolean;
  description: string | null;
}

export interface ProducerDashboardData {
  producer: ProducerRecord | null;
  pack: PackRecord | null;
  quota: {
    max_events_per_month: number | null;
    used_events_this_month: number;
    max_active_events: number | null;
    active_events_count: number;
    can_create_event: boolean;
  };
}

function authHeaders(): HeadersInit {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!getAuthToken()) {
    throw new Error('Veuillez vous reconnecter pour accéder à cette page.');
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      ...authHeaders(),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: `API error ${response.status}` }));
    const message = payload.message ?? `API error ${response.status}`;
    if (response.status === 401 || message.toLowerCase().includes('unauthenticated')) {
      throw new Error('Veuillez vous reconnecter pour accéder à cette page.');
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const producerPacksService = {
  listProducers: () => request<ProducerRecord[]>('/admin/producers'),
  createProducer: (payload: ProducerCreatePayload) => request<ProducerRecord>('/admin/producers', { method: 'POST', body: JSON.stringify(payload) }),
  updateProducer: (id: number, payload: Partial<ProducerRecord>) => request<ProducerRecord>(`/admin/producers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteProducer: (id: number) => request<{ success: boolean }>(`/admin/producers/${id}`, { method: 'DELETE' }),

  listPacks: () => request<PackRecord[]>('/admin/packs'),
  createPack: (payload: Partial<PackRecord>) => request<PackRecord>('/admin/packs', { method: 'POST', body: JSON.stringify(payload) }),
  updatePack: (id: number, payload: Partial<PackRecord>) => request<PackRecord>(`/admin/packs/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deletePack: (id: number) => request<{ success: boolean }>(`/admin/packs/${id}`, { method: 'DELETE' }),

  assignPack: (producerId: number, packId: number) => request(`/admin/producers/${producerId}/pack`, { method: 'PUT', body: JSON.stringify({ pack_id: packId }) }),

  getDashboard: () => request<ProducerDashboardData>('/producer/dashboard/pack'),
  listOwnEvents: () => request<Array<{ id: number; title: string; starts_at: string }>>('/producer/events'),
  createOwnEvent: (payload: Record<string, unknown>) => request('/producer/events', { method: 'POST', body: JSON.stringify(payload) }),
};
