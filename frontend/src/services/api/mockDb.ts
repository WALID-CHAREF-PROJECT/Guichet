import { ApiUser, EventModel, FavoriteModel, OrderModel, OrganizerModel } from './models';

const uid = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const users: ApiUser[] = [
  {
    id: 'admin-1', role: 'admin', firstName: 'Admin', lastName: 'Guichet', email: 'admin@guichet.com',
    password: 'Admin123!', phone: '+212600000000', isActive: true
  },
  {
    id: 'org-1', role: 'organizer', firstName: 'Organizer', lastName: 'Guichet', email: 'organizer@guichet.com',
    password: 'Organizer123!', phone: '+212611111111', companyName: 'Guichet Events Pro', organizationSlug: 'guichet-events-pro', isActive: true
  },
  {
    id: 'client-1', role: 'client', firstName: 'Client', lastName: 'Guichet', email: 'client@guichet.com',
    password: 'Client123!', phone: '+212622222222', isActive: true
  }
];

const organizers: OrganizerModel[] = [
  {
    id: 'organizer-1', userId: 'org-1', companyName: 'Guichet Events Pro', slug: 'guichet-events-pro', logo: '/assets/organizer-bal.png',
    coverImage: '/assets/organizer-cover.jpg', isApproved: true
  }
];

const events: EventModel[] = [];
const orders: OrderModel[] = [];
const favorites: FavoriteModel[] = [];
const carts = new Map<string, unknown[]>();
const payouts = new Map<string, { id: string; amount: number; status: 'pending' | 'paid' }[]>();
const categories = ['Concerts', 'Festivals', 'Théâtre', 'Sport'];
const content = { homeHero: [], promotedEvents: [] };
const settings = { platformName: 'Guichet', currency: 'MAD' };

export const mockDb = { users, organizers, events, orders, favorites, carts, payouts, categories, content, settings };

export function createUser(payload: Omit<ApiUser, 'id' | 'isActive'>): ApiUser {
  const next: ApiUser = { ...payload, id: uid('user'), isActive: true };
  users.push(next);
  if (next.role === 'organizer' && next.companyName) {
    organizers.push({
      id: uid('org'),
      userId: next.id,
      companyName: next.companyName,
      slug: next.organizationSlug ?? next.companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      logo: '',
      coverImage: '',
      isApproved: false
    });
  }
  return next;
}
