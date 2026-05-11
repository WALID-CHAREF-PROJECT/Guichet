import { movies, platformEvents, voyages } from './platformData';
import { StoredUser, getCurrentUser, getUsers, saveUsers, setCurrentUser } from './storage';

export type Role = 'client' | 'organizer' | 'admin';
export type EventStatus = 'draft' | 'published' | 'archived' | 'past';

export interface OrganizerProfile {
  id: string;
  userId: string;
  companyName: string;
  slug: string;
  logo: string;
  coverImage: string;
  description?: string;
  city?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  socialLinks?: string;
  supportInfo?: string;
  isApproved: boolean;
}

export interface TicketType {
  id: string;
  name: string;
  price: number;
  stock: number;
  seatPlanRequired: boolean;
}

export interface PlanZoneModel {
  id: string;
  name: string;
  label?: string;
  price: number;
  capacity: number;
  availableCapacity: number;
  color: string;
  sortOrder: number;
  isAvailable: boolean;
}

export interface BackofficeEvent {
  id: string;
  organizerId: string;
  title: string;
  slug: string;
  category: string;
  shortDescription: string;
  description: string;
  city: string;
  location: string;
  mapsLink?: string;
  date: string;
  time: string;
  image: string;
  gallery: string[];
  tags: string[];
  featuredImage?: string;
  terms?: string;
  status: EventStatus;
  featured: boolean;
  ticketsSold: number;
  revenue: number;
  buyingMode: 'ticket' | 'plan' | 'reservation';
  hasPlan: boolean;
  planType?: 'theatre' | 'stadium' | 'generic' | null;
  seatingEnabled: boolean;
  planZones: PlanZoneModel[];
  ticketTypes: TicketType[];
  createdAt: string;
  updatedAt: string;
}

export interface BackofficeOrder {
  id: string;
  reference: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  organizerId?: string;
  productType: 'event' | 'travel' | 'movie';
  productId: string;
  productName: string;
  ticketType?: string;
  quantity: number;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  bookingStatus: 'confirmed' | 'cancelled' | 'checked_in';
  createdAt: string;
}

export interface PayoutModel {
  id: string;
  organizerId: string;
  reference: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid' | 'failed';
}

export interface CategoryModel {
  id: string;
  type: 'event' | 'travel' | 'movie' | 'sport' | 'other';
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  order: number;
}

export interface TravelModel { id: string; image: string; gallery?: string[]; title: string; category: string; destination: string; departureDate: string; price: number; description?: string; status: EventStatus; featured: boolean }
export interface MovieModel { id: string; poster: string; title: string; genre: string; duration: string; releaseDate: string; cinemas: string; description?: string; status: EventStatus; featured: boolean }
export interface ContentBlock { id: string; type: 'banner' | 'section' | 'hero' | 'cta'; title: string; subtitle?: string; description?: string; ctaLabel?: string; ctaLink?: string; image?: string; backgroundImage?: string; visible: boolean; order: number }

export interface DbShape {
  organizers: OrganizerProfile[];
  events: BackofficeEvent[];
  orders: BackofficeOrder[];
  payouts: PayoutModel[];
  categories: CategoryModel[];
  travels: TravelModel[];
  movies: MovieModel[];
  content: ContentBlock[];
  settings: { platformName: string; supportEmail: string; currency: string; defaultLocale: string; paymentProvider: string; notificationsEnabled: boolean };
}

const DB_KEY = 'app:backoffice:v1';
const uid = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
const slugify = (value: string): string => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const normalizeSlug = (value: string): string => slugify(value);
const organizerSlugOverrides: Record<string, string> = {
  'nostalgia lovers': 'nostalgia-lovers',
  'basketball africa league': 'basketball-africa-league-bal',
  'association edom': 'association-edom'
};


const theatreSeedZones = (): PlanZoneModel[] => [
  { id: uid('zone'), name: 'Orchestre VIP', label: 'Premiers rangs premium', price: 650, capacity: 48, availableCapacity: 18, color: '#f59e0b', sortOrder: 0, isAvailable: true },
  { id: uid('zone'), name: 'Orchestre', label: 'Face scène', price: 320, capacity: 220, availableCapacity: 180, color: '#38bdf8', sortOrder: 1, isAvailable: true },
  { id: uid('zone'), name: 'Balcon', label: 'Vue surélevée', price: 220, capacity: 160, availableCapacity: 100, color: '#818cf8', sortOrder: 2, isAvailable: true },
  { id: uid('zone'), name: 'Mezzanine', label: 'Centre mezzanine', price: 260, capacity: 96, availableCapacity: 45, color: '#a78bfa', sortOrder: 3, isAvailable: true },
  { id: uid('zone'), name: 'Galerie', label: 'Placement économique', price: 140, capacity: 180, availableCapacity: 120, color: '#14b8a6', sortOrder: 4, isAvailable: true },
];
const stadiumSeedZones = (): PlanZoneModel[] => [
  { id: uid('zone'), name: 'Tribune Nord', label: 'Virage Nord', price: 120, capacity: 1200, availableCapacity: 640, color: '#22c55e', sortOrder: 0, isAvailable: true },
  { id: uid('zone'), name: 'Tribune Sud', label: 'Virage Sud', price: 120, capacity: 1200, availableCapacity: 580, color: '#14b8a6', sortOrder: 1, isAvailable: true },
  { id: uid('zone'), name: 'Tribune Est', label: 'Latérale Est', price: 180, capacity: 900, availableCapacity: 340, color: '#3b82f6', sortOrder: 2, isAvailable: true },
  { id: uid('zone'), name: 'Tribune Ouest', label: 'Latérale Ouest', price: 220, capacity: 820, availableCapacity: 260, color: '#6366f1', sortOrder: 3, isAvailable: true },
  { id: uid('zone'), name: 'VIP', label: 'Salon premium', price: 650, capacity: 120, availableCapacity: 40, color: '#f97316', sortOrder: 4, isAvailable: true },
  { id: uid('zone'), name: 'Virage', label: 'Supporters', price: 90, capacity: 1600, availableCapacity: 900, color: '#ef4444', sortOrder: 5, isAvailable: true },
];
const seedIsoDate = (offsetDays: number): string => new Date(Date.now() + offsetDays * 86400000).toISOString().slice(0, 10);
function seedPlanFor(category: string, slug: string): { buyingMode: BackofficeEvent['buyingMode']; hasPlan: boolean; planType: BackofficeEvent['planType']; seatingEnabled: boolean; planZones: PlanZoneModel[] } {
  const normalized = `${category} ${slug}`.toLowerCase();
  if (normalized.includes('bal') || normalized.includes('sport') || normalized.includes('stad')) return { buyingMode: 'plan', hasPlan: true, planType: 'stadium', seatingEnabled: true, planZones: stadiumSeedZones() };
  if (normalized.includes('theatre') || normalized.includes('spectacle') || normalized.includes('piaf') || normalized.includes('tim')) return { buyingMode: 'plan', hasPlan: true, planType: 'theatre', seatingEnabled: true, planZones: theatreSeedZones() };
  return { buyingMode: 'ticket', hasPlan: false, planType: null, seatingEnabled: false, planZones: [] };
}

function organizerSlug(value: string): string {
  return organizerSlugOverrides[normalizeSlug(value).replace(/-/g, ' ')] ?? slugify(value);
}

function buildPublicOrganizers(existingOrganizers: OrganizerProfile[]): OrganizerProfile[] {
  const organizerBySlug = new Map(existingOrganizers.map((organizer) => [normalizeSlug(organizer.slug), organizer]));
  const nextOrganizers = [...existingOrganizers];

  platformEvents.forEach((event) => {
    const slug = organizerSlug(event.organizer);
    if (organizerBySlug.has(slug)) return;
    const generated: OrganizerProfile = {
      id: uid('organizer'),
      userId: `public-${slug}`,
      companyName: event.organizer,
      slug,
      logo: event.organizerLogo,
      coverImage: event.image,
      description: `Organisateur de ${event.title}.`,
      city: event.location.split('-').pop()?.trim() ?? 'Casablanca',
      email: `contact+${slug}@guichet.ma`,
      phone: '+212600000000',
      address: event.location,
      website: 'https://guichet.example.com',
      socialLinks: '@guichet',
      supportInfo: 'Support 24/7',
      isApproved: true
    };
    organizerBySlug.set(slug, generated);
    nextOrganizers.push(generated);
  });

  return nextOrganizers;
}

function buildPublicEvents(existingEvents: BackofficeEvent[], organizers: OrganizerProfile[]): BackofficeEvent[] {
  const nextEvents = [...existingEvents];
  const existingBySlug = new Set(existingEvents.map((event) => event.slug));
  const organizerBySlug = new Map(organizers.map((organizer) => [normalizeSlug(organizer.slug), organizer]));

  platformEvents.forEach((event, index) => {
    if (existingBySlug.has(event.slug)) return;
    const organizer = organizerBySlug.get(organizerSlug(event.organizer));
    if (!organizer) return;
    nextEvents.push({
      id: uid('evt'),
      organizerId: organizer.userId,
      title: event.title,
      slug: event.slug,
      category: event.tags[0] ?? 'Concerts',
      shortDescription: event.description.slice(0, 120),
      description: event.description,
      city: event.location.split('-').pop()?.trim() ?? 'Casablanca',
      location: event.location,
      date: seedIsoDate(index + 1),
      time: event.time,
      image: event.image,
      gallery: [event.image],
      tags: event.tags,
      status: 'published',
      featured: index % 4 === 0,
      ticketsSold: 40 + index * 22,
      revenue: 12000 + index * 6400,
      ...seedPlanFor(event.tags[0] ?? '', event.slug),
      ticketTypes: [
        { id: uid('ticket'), name: 'Normal', price: Number.parseInt(event.price.replace(/[^\d]/g, ''), 10) || 150, stock: 300, seatPlanRequired: false },
        { id: uid('ticket'), name: 'VIP', price: (Number.parseInt(event.price.replace(/[^\d]/g, ''), 10) || 150) + 200, stock: 120, seatPlanRequired: true }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  });

  return nextEvents;
}

function makeSeedData(): DbShape {
  const users = getUsers();
  const organizerUser = users.find((u) => u.role === 'organizer') ?? users[0];
  const organizerId = organizerUser.id;

  const organizers: OrganizerProfile[] = [{
    id: 'organizer-1',
    userId: organizerId,
    companyName: organizerUser.companyName ?? 'Guichet Fournisseurs',
    slug: organizerUser.organizationSlug ?? slugify(organizerUser.companyName ?? 'Guichet Fournisseurs'),
    logo: '/assets/organizer-bal.png',
    coverImage: '/assets/organizer-cover.jpg',
    description: 'Organisateur premium orienté expériences culturelles.',
    city: 'Casablanca',
    email: organizerUser.email,
    phone: organizerUser.phone,
    address: 'Boulevard de la Corniche, Casablanca',
    website: 'https://guichet.example.com',
    socialLinks: '@guichet',
    supportInfo: 'Support 24/7',
    isApproved: true
  }];

  const events: BackofficeEvent[] = platformEvents.slice(0, 8).map((event, index) => ({
    id: `evt-${index + 1}`,
    organizerId,
    title: event.title,
    slug: event.slug,
    category: event.tags[0] ?? 'Concerts',
    shortDescription: event.description.slice(0, 120),
    description: event.description,
    city: event.location.split('-').pop()?.trim() ?? 'Casablanca',
    location: event.location,
    time: event.time,
    image: event.image,
    gallery: [event.image],
    tags: event.tags,
    status: 'published',
    featured: index === 0,
    ticketsSold: 40 + index * 22,
    revenue: 12000 + index * 6400,
    date: seedIsoDate(index + 1),
    ...seedPlanFor(event.tags[0] ?? '', event.slug),
    ticketTypes: [
      { id: uid('ticket'), name: 'Normal', price: 150, stock: 300, seatPlanRequired: false },
      { id: uid('ticket'), name: 'VIP', price: 350, stock: 120, seatPlanRequired: true }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
  const publicOrganizers = buildPublicOrganizers(organizers);
  const allEvents = buildPublicEvents(events, publicOrganizers);

  const orders: BackofficeOrder[] = events.flatMap((event, idx) => ([0, 1, 2].map((i) => ({
    id: uid('ord'),
    reference: `CMD-${1000 + idx * 10 + i}`,
    customerId: `client-${i + 1}`,
    customerName: ['Sara Benali', 'Youssef Idrissi', 'Nadia El Fassi'][i],
    customerEmail: ['sara@mail.com', 'youssef@mail.com', 'nadia@mail.com'][i],
    customerPhone: '+212600112233',
    organizerId,
    productType: 'event' as const,
    productId: event.id,
    productName: event.title,
    ticketType: i % 2 === 0 ? 'VIP' : 'Normal',
    quantity: i + 1,
    total: (i + 1) * (i % 2 === 0 ? 350 : 150),
    paymentStatus: i === 2 ? 'pending' : 'paid',
    bookingStatus: 'confirmed' as const,
    createdAt: new Date(Date.now() - (idx * 3 + i) * 86400000).toISOString()
  }))));

  const payouts: PayoutModel[] = [
    { id: uid('pay'), organizerId, reference: 'PAYOUT-1201', date: '2026-03-01', amount: 24000, status: 'paid' },
    { id: uid('pay'), organizerId, reference: 'PAYOUT-1202', date: '2026-04-10', amount: 12000, status: 'pending' }
  ];

  const categories: CategoryModel[] = [
    { id: 'cat-1', type: 'event', name: 'Concerts', slug: 'concerts', isActive: true, order: 1, icon: '🎤' },
    { id: 'cat-2', type: 'travel', name: 'Voyage organisé', slug: 'voyage-organise', isActive: true, order: 2, icon: '✈️' },
    { id: 'cat-3', type: 'movie', name: 'Action', slug: 'action', isActive: true, order: 3, icon: '🎬' },
    { id: 'cat-4', type: 'sport', name: 'Basketball', slug: 'basketball', isActive: true, order: 4, icon: '🏀' }
  ];

  const travels: TravelModel[] = voyages.map((travel, i) => ({ id: `travel-${travel.id}`, image: travel.image, title: travel.title, category: travel.collection, destination: travel.location, departureDate: seedIsoDate(7 + i * 9), price: Number.parseInt(travel.price, 10) || 3000, status: 'published', featured: i === 0 }));
  const movieItems: MovieModel[] = movies.map((movie, i) => ({ id: `movie-${movie.id}`, poster: movie.image, title: movie.title, genre: movie.genre, duration: movie.duration, releaseDate: seedIsoDate(i - 2), cinemas: 'Megarama, Imax, Pathé Californie', status: 'published', featured: i === 0 }));
  const content: ContentBlock[] = [
    { id: uid('content'), type: 'banner', title: 'Hero principal', subtitle: 'Campagne été', image: platformEvents[0]?.image, visible: true, order: 1 },
    { id: uid('content'), type: 'section', title: 'Événements promus', visible: true, order: 2 }
  ];

  return {
    organizers: publicOrganizers,
    events: allEvents,
    orders,
    payouts,
    categories,
    travels,
    movies: movieItems,
    content,
    settings: {
      platformName: 'Guichet Premium',
      supportEmail: 'support@guichet.ma',
      currency: 'MAD',
      defaultLocale: 'fr-MA',
      paymentProvider: 'MockPay',
      notificationsEnabled: true
    }
  };
}

function getDb(): DbShape {
  const raw = localStorage.getItem(DB_KEY);
  if (!raw) {
    const seeded = makeSeedData();
    localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try {
    const parsed = JSON.parse(raw) as DbShape;
    const organizers = buildPublicOrganizers(parsed.organizers ?? []);
    const events = buildPublicEvents(parsed.events ?? [], organizers);
    if (organizers.length !== (parsed.organizers ?? []).length || events.length !== (parsed.events ?? []).length) {
      const upgraded = { ...parsed, organizers, events };
      localStorage.setItem(DB_KEY, JSON.stringify(upgraded));
      return upgraded;
    }
    return parsed;
  } catch {
    const seeded = makeSeedData();
    localStorage.setItem(DB_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function saveDb(db: DbShape): void {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
  window.dispatchEvent(new Event('ticketflow:update'));
}

export const backofficeService = {
  getOrganizerProfile(userId: string): OrganizerProfile | null {
    const db = getDb();
    return db.organizers.find((o) => o.userId === userId) ?? null;
  },
  updateOrganizerProfile(userId: string, patch: Partial<OrganizerProfile>): OrganizerProfile {
    const db = getDb();
    const idx = db.organizers.findIndex((o) => o.userId === userId);
    if (idx === -1) throw new Error('Organisateur introuvable');
    const updated = { ...db.organizers[idx], ...patch, slug: patch.companyName ? slugify(patch.companyName) : db.organizers[idx].slug };
    db.organizers[idx] = updated;
    const users = getUsers();
    const uIdx = users.findIndex((u) => u.id === userId);
    if (uIdx >= 0) {
      users[uIdx] = { ...users[uIdx], companyName: updated.companyName, organizationSlug: updated.slug };
      saveUsers(users);
      const current = getCurrentUser();
      if (current?.id === userId) setCurrentUser(users[uIdx]);
    }
    saveDb(db);
    return updated;
  },
  getOrganizerEvents(userId: string): BackofficeEvent[] {
    return getDb().events.filter((event) => event.organizerId === userId);
  },
  getOrganizerEvent(userId: string, id: string): BackofficeEvent | null {
    return getDb().events.find((event) => event.organizerId === userId && event.id === id) ?? null;
  },
  createOrganizerEvent(userId: string, payload: Omit<BackofficeEvent, 'id' | 'organizerId' | 'ticketsSold' | 'revenue' | 'createdAt' | 'updatedAt'>): BackofficeEvent {
    const db = getDb();
    const next: BackofficeEvent = { ...payload, id: uid('evt'), organizerId: userId, ticketsSold: 0, revenue: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
    db.events.unshift(next);
    saveDb(db);
    return next;
  },
  updateOrganizerEvent(userId: string, id: string, patch: Partial<BackofficeEvent>): BackofficeEvent {
    const db = getDb();
    const idx = db.events.findIndex((event) => event.id === id && event.organizerId === userId);
    if (idx === -1) throw new Error('Événement introuvable');
    db.events[idx] = { ...db.events[idx], ...patch, updatedAt: new Date().toISOString() };
    saveDb(db);
    return db.events[idx];
  },
  deleteOrganizerEvent(userId: string, id: string): void {
    const db = getDb();
    const idx = db.events.findIndex((event) => event.id === id && event.organizerId === userId);
    if (idx === -1) return;
    db.events[idx].status = 'archived';
    saveDb(db);
  },
  duplicateOrganizerEvent(userId: string, id: string): BackofficeEvent {
    const existing = this.getOrganizerEvent(userId, id);
    if (!existing) throw new Error('Événement introuvable');
    return this.createOrganizerEvent(userId, {
      ...existing,
      slug: `${existing.slug}-copie-${Math.floor(Math.random() * 99)}`,
      title: `${existing.title} (Copie)`,
      status: 'draft',
      ticketTypes: existing.ticketTypes.map((ticket) => ({ ...ticket, id: uid('ticket') }))
    });
  },
  getOrganizerOrders(userId: string): BackofficeOrder[] {
    return getDb().orders.filter((order) => order.organizerId === userId);
  },
  getOrganizerCustomers(userId: string): Array<{ name: string; email: string; phone?: string; bookings: number; totalSpent: number; lastBookingDate: string; }> {
    const orders = this.getOrganizerOrders(userId);
    const map = new Map<string, { name: string; email: string; phone?: string; bookings: number; totalSpent: number; lastBookingDate: string }>();
    orders.forEach((order) => {
      const current = map.get(order.customerEmail) ?? { name: order.customerName, email: order.customerEmail, phone: order.customerPhone, bookings: 0, totalSpent: 0, lastBookingDate: order.createdAt };
      current.bookings += 1;
      current.totalSpent += order.total;
      if (new Date(order.createdAt).getTime() > new Date(current.lastBookingDate).getTime()) current.lastBookingDate = order.createdAt;
      map.set(order.customerEmail, current);
    });
    return Array.from(map.values());
  },
  getOrganizerPayouts(userId: string): PayoutModel[] {
    return getDb().payouts.filter((payout) => payout.organizerId === userId);
  },
  getAdminData: () => getDb(),
  updateUser(userId: string, patch: Partial<StoredUser>): StoredUser {
    const users = getUsers();
    const idx = users.findIndex((user) => user.id === userId);
    if (idx === -1) throw new Error('Utilisateur introuvable');
    users[idx] = { ...users[idx], ...patch };
    saveUsers(users);
    return users[idx];
  },
  deleteUser(userId: string): void {
    const users = getUsers().filter((user) => user.id !== userId);
    saveUsers(users);
  },
  updateOrganizer(organizerId: string, patch: Partial<OrganizerProfile>): OrganizerProfile {
    const db = getDb();
    const idx = db.organizers.findIndex((organizer) => organizer.id === organizerId);
    if (idx === -1) throw new Error('Organisateur introuvable');
    db.organizers[idx] = { ...db.organizers[idx], ...patch };
    saveDb(db);
    return db.organizers[idx];
  },
  createEvent(payload: Omit<BackofficeEvent, 'id'>): void {
    const db = getDb();
    db.events.unshift({ ...payload, id: uid('evt') });
    saveDb(db);
  },
  updateEventByAdmin(eventId: string, patch: Partial<BackofficeEvent>): BackofficeEvent {
    const db = getDb();
    const idx = db.events.findIndex((event) => event.id === eventId);
    if (idx === -1) throw new Error('Événement introuvable');
    db.events[idx] = { ...db.events[idx], ...patch, updatedAt: new Date().toISOString() };
    saveDb(db);
    return db.events[idx];
  },
  deleteEventByAdmin(eventId: string): void {
    const db = getDb();
    db.events = db.events.filter((event) => event.id !== eventId);
    saveDb(db);
  },
  updateTravel(travelId: string, patch: Partial<TravelModel>): void {
    const db = getDb();
    db.travels = db.travels.map((travel) => travel.id === travelId ? { ...travel, ...patch } : travel);
    saveDb(db);
  },
  createTravel(payload: Omit<TravelModel, 'id'>): void {
    const db = getDb();
    db.travels.unshift({ ...payload, id: uid('travel') });
    saveDb(db);
  },
  updateMovie(movieId: string, patch: Partial<MovieModel>): void {
    const db = getDb();
    db.movies = db.movies.map((movie) => movie.id === movieId ? { ...movie, ...patch } : movie);
    saveDb(db);
  },
  createMovie(payload: Omit<MovieModel, 'id'>): void {
    const db = getDb();
    db.movies.unshift({ ...payload, id: uid('movie') });
    saveDb(db);
  },
  createCategory(payload: Omit<CategoryModel, 'id'>): CategoryModel {
    const db = getDb();
    const next = { ...payload, id: uid('cat') };
    db.categories.push(next);
    saveDb(db);
    return next;
  },
  updateCategory(id: string, patch: Partial<CategoryModel>): void {
    const db = getDb();
    db.categories = db.categories.map((category) => category.id === id ? { ...category, ...patch } : category);
    saveDb(db);
  },
  deleteCategory(id: string): void {
    const db = getDb();
    db.categories = db.categories.filter((category) => category.id !== id);
    saveDb(db);
  },
  deleteTravel(id: string): void {
    const db = getDb();
    db.travels = db.travels.filter((travel) => travel.id !== id);
    saveDb(db);
  },
  deleteMovie(id: string): void {
    const db = getDb();
    db.movies = db.movies.filter((movie) => movie.id !== id);
    saveDb(db);
  },
  updateContent(id: string, patch: Partial<ContentBlock>): void {
    const db = getDb();
    db.content = db.content.map((item) => item.id === id ? { ...item, ...patch } : item);
    saveDb(db);
  },
  addContent(payload: Omit<ContentBlock, 'id'>): void {
    const db = getDb();
    db.content.push({ ...payload, id: uid('content') });
    saveDb(db);
  },
  deleteContent(id: string): void {
    const db = getDb();
    db.content = db.content.filter((item) => item.id !== id);
    saveDb(db);
  },
  updateSettings(patch: Partial<DbShape['settings']>): void {
    const db = getDb();
    db.settings = { ...db.settings, ...patch };
    saveDb(db);
  },
  getPublicOrganizer(slug: string): { organizer: OrganizerProfile; events: BackofficeEvent[] } | null {
    const db = getDb();
    const normalized = normalizeSlug(slug);
    const organizer = db.organizers.find((item) => normalizeSlug(item.slug) === normalized);
    if (!organizer) return null;
    return { organizer, events: db.events.filter((event) => event.organizerId === organizer.userId && event.status !== 'archived') };
  },
  getPublicEventBySlug(slug: string): { event: BackofficeEvent; organizer: OrganizerProfile | null } | null {
    const db = getDb();
    const event = db.events.find((item) => item.slug === slug && item.status === 'published');
    if (!event) return null;
    return { event, organizer: db.organizers.find((item) => item.userId === event.organizerId) ?? null };
  }
};
