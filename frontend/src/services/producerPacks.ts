import { getAuthToken } from './api/authClient';
import { API_BASE_URL } from './api/config';

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
  pack_id?: number | null;
  subscription_starts_at?: string;
  subscription_ends_at?: string;
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
  slug?: string;
  price?: number;
  billing_type?: 'monthly' | 'yearly' | 'custom';
  max_events_per_month: number | null;
  max_active_events: number | null;
  quotas?: string | null;
  features?: string[] | string | null;
  is_active: boolean;
  is_featured?: boolean;
  image?: string | null;
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

interface LocalPackDb { producers: ProducerRecord[]; packs: PackRecord[] }
const LOCAL_KEY = 'app:producer-packs:v2';
const nowId = (): number => Date.now() + Math.floor(Math.random() * 1000);
const seedLocal = (): LocalPackDb => ({
  producers: [],
  packs: [
    { id: 1, name: 'Starter', code: 'starter', slug: 'starter', price: 990, billing_type: 'monthly', max_events_per_month: 5, max_active_events: 3, quotas: '5 événements/mois · 3 actifs', features: ['Page fournisseur', 'Support email', 'Statistiques de base'], is_active: true, is_featured: false, image: '', description: 'Idéal pour lancer une activité de billetterie.' },
    { id: 2, name: 'Business', code: 'business', slug: 'business', price: 2490, billing_type: 'monthly', max_events_per_month: 25, max_active_events: 12, quotas: '25 événements/mois · 12 actifs', features: ['Mise en avant', 'Support prioritaire', 'Rapports avancés'], is_active: true, is_featured: true, image: '', description: 'Pour les producteurs qui publient régulièrement.' },
  ],
});
function getLocal(): LocalPackDb {
  const raw = localStorage.getItem(LOCAL_KEY);
  if (!raw) { const seeded = seedLocal(); localStorage.setItem(LOCAL_KEY, JSON.stringify(seeded)); return seeded; }
  try { return JSON.parse(raw) as LocalPackDb; } catch { const seeded = seedLocal(); localStorage.setItem(LOCAL_KEY, JSON.stringify(seeded)); return seeded; }
}
function saveLocal(db: LocalPackDb): void { localStorage.setItem(LOCAL_KEY, JSON.stringify(db)); window.dispatchEvent(new Event('ticketflow:update')); }
function authHeaders(json = true): HeadersInit {
  const token = getAuthToken();
  return { ...(json ? { 'Content-Type': 'application/json' } : {}), Accept: 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
}
async function request<T>(path: string, init?: RequestInit, json = true): Promise<T> {
  if (!getAuthToken()) throw new Error('Veuillez vous reconnecter pour accéder à cette page.');
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers: { ...authHeaders(json), ...(init?.headers ?? {}) } });
  } catch { throw new Error('Impossible de contacter le serveur Laravel. Mode local disponible.'); }
  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: `API error ${response.status}` }));
    throw new Error(payload.message ?? `API error ${response.status}`);
  }
  return response.json() as Promise<T>;
}
const normalizePack = (pack: Partial<PackRecord>): PackRecord => ({
  id: pack.id ?? nowId(), name: pack.name ?? 'Nouveau pack', code: pack.code ?? `pack-${Date.now()}`,
  slug: pack.slug ?? pack.code ?? '', price: Number(pack.price ?? 0), billing_type: pack.billing_type ?? 'monthly',
  max_events_per_month: pack.max_events_per_month ?? null, max_active_events: pack.max_active_events ?? null,
  quotas: pack.quotas ?? '', features: Array.isArray(pack.features) ? pack.features : String(pack.features ?? '').split('\n').map((v) => v.trim()).filter(Boolean),
  is_active: pack.is_active ?? true, is_featured: pack.is_featured ?? false, image: pack.image ?? '', description: pack.description ?? '',
});

export const producerPacksService = {
  async listProducers(): Promise<ProducerRecord[]> { try { return await request<ProducerRecord[]>('/admin/producers'); } catch { return getLocal().producers; } },
  async createProducer(payload: ProducerCreatePayload): Promise<ProducerRecord> { try { return await request<ProducerRecord>('/admin/producers', { method: 'POST', body: JSON.stringify(payload) }); } catch { const db = getLocal(); const producer: ProducerRecord = { id: nowId(), user_id: null, name: payload.name ?? `${payload.firstName} ${payload.lastName}`, slug: payload.slug ?? `producer-${Date.now()}`, email: payload.email, phone: payload.phone, is_active: payload.is_active ?? true, logo: payload.logo, cover_image: payload.cover_image, city: payload.city, address: payload.address, support_email: payload.support_email, support_phone: payload.support_phone, description: payload.description, pack_id: payload.pack_id ?? null, subscription_starts_at: payload.subscription_starts_at, subscription_ends_at: payload.subscription_ends_at }; db.producers.unshift(producer); saveLocal(db); return producer; } },
  async updateProducer(id: number, payload: Partial<ProducerRecord>): Promise<ProducerRecord> { try { return await request<ProducerRecord>(`/admin/producers/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); } catch { const db = getLocal(); const idx = db.producers.findIndex((producer) => producer.id === id); if (idx === -1) throw new Error('Producteur introuvable.'); db.producers[idx] = { ...db.producers[idx], ...payload }; saveLocal(db); return db.producers[idx]; } },
  async deleteProducer(id: number): Promise<{ success: boolean }> { try { return await request<{ success: boolean }>(`/admin/producers/${id}`, { method: 'DELETE' }); } catch { const db = getLocal(); db.producers = db.producers.filter((producer) => producer.id !== id); saveLocal(db); return { success: true }; } },
  async listPacks(): Promise<PackRecord[]> { try { return await request<PackRecord[]>('/admin/packs'); } catch { return getLocal().packs; } },
  async createPack(payload: Partial<PackRecord>): Promise<PackRecord> { try { return await request<PackRecord>('/admin/packs', { method: 'POST', body: JSON.stringify(payload) }); } catch { const db = getLocal(); const pack = normalizePack(payload); db.packs.unshift(pack); saveLocal(db); return pack; } },
  async updatePack(id: number, payload: Partial<PackRecord>): Promise<PackRecord> { try { return await request<PackRecord>(`/admin/packs/${id}`, { method: 'PUT', body: JSON.stringify(payload) }); } catch { const db = getLocal(); const idx = db.packs.findIndex((pack) => pack.id === id); if (idx === -1) throw new Error('Pack introuvable.'); db.packs[idx] = normalizePack({ ...db.packs[idx], ...payload, id }); saveLocal(db); return db.packs[idx]; } },
  async deletePack(id: number): Promise<{ success: boolean }> { try { return await request<{ success: boolean }>(`/admin/packs/${id}`, { method: 'DELETE' }); } catch { const db = getLocal(); db.packs = db.packs.filter((pack) => pack.id !== id); saveLocal(db); return { success: true }; } },
  async assignPack(producerId: number, packId: number): Promise<unknown> { try { return await request(`/admin/producers/${producerId}/pack`, { method: 'PUT', body: JSON.stringify({ pack_id: packId }) }); } catch { return this.updateProducer(producerId, { pack_id: packId }); } },
  getDashboard: () => request<ProducerDashboardData>('/producer/dashboard/pack'),
  listOwnEvents: () => request<Array<{ id: number; title: string; starts_at: string }>>('/producer/events'),
  createOwnEvent: (payload: Record<string, unknown>) => request('/producer/events', { method: 'POST', body: JSON.stringify(payload) }),
};
