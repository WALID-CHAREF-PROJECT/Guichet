import { Category, City, EventItem, PaginatedResponse } from '../types/api';

export const mockCategories: Category[] = [
  { id: 1, name: 'Concert', slug: 'concert' },
  { id: 2, name: 'Festival', slug: 'festival' },
  { id: 3, name: 'Sport', slug: 'sport' },
  { id: 4, name: 'Humour', slug: 'humour' },
  { id: 5, name: 'Voyages', slug: 'voyages' },
  { id: 6, name: 'Cinéma', slug: 'cinema' }
];

export const mockCities: City[] = [
  { id: 1, name: 'Casablanca', slug: 'casablanca' },
  { id: 2, name: 'Rabat', slug: 'rabat' },
  { id: 3, name: 'Marrakech', slug: 'marrakech' }
];

export const mockEvents: EventItem[] = [
  {
    id: 1,
    slug: 'soirree-jazz-casa',
    organizer: 'Jazz Morocco',
    title: 'Soirée Jazz à Casablanca',
    venue: 'Studio des Arts',
    city: mockCities[0],
    category: mockCategories[0],
    description: 'Une soirée jazz avec des artistes locaux et internationaux.',
    image_url: 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?auto=format&fit=crop&w=1200&q=80',
    starts_at: '2026-05-15T20:00:00Z',
    starts_at_human: '15 mai 2026 • 20:00',
    price_mad: 180,
    is_free: false,
    is_sold_out: false,
    badge: 'Populaire'
  },
  {
    id: 2,
    slug: 'festival-food-rabat',
    organizer: 'Rabat Food Club',
    title: 'Festival Street Food Rabat',
    venue: 'Corniche de Rabat',
    city: mockCities[1],
    category: mockCategories[1],
    description: 'Découvrez les meilleures spécialités culinaires du Maroc.',
    image_url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80',
    starts_at: '2026-06-02T10:00:00Z',
    starts_at_human: '2 juin 2026 • 10:00',
    price_mad: 0,
    is_free: true,
    is_sold_out: false,
    badge: 'Gratuit'
  },
  {
    id: 3,
    slug: 'match-amical-marrakech',
    organizer: 'Atlas Sport',
    title: 'Match Amical Marrakech',
    venue: 'Stade Municipal',
    city: mockCities[2],
    category: mockCategories[2],
    description: 'Vivez une grande soirée football en famille.',
    image_url: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
    starts_at: '2026-05-29T19:30:00Z',
    starts_at_human: '29 mai 2026 • 19:30',
    price_mad: 120,
    is_free: false,
    is_sold_out: false,
    badge: null
  }
];

export function buildPaginatedEvents(events: EventItem[]): PaginatedResponse<EventItem> {
  return {
    data: events,
    meta: {
      current_page: 1,
      last_page: 1,
      per_page: events.length,
      total: events.length
    }
  };
}
