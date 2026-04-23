import { ApiUser, EventModel, FavoriteModel, OrderModel, OrganizerModel } from './models';

const uid = (prefix: string): string => `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const users: ApiUser[] = [
  {
    id: 'admin-1', role: 'admin', firstName: 'Project', lastName: 'Admin', email: 'admin@guichet.ma',
    password: 'Admin@123', phone: '+212600000000', isActive: true
  },
  {
    id: 'org-1', role: 'organizer', firstName: 'BAL', lastName: 'Team', email: 'organizer@guichet.ma',
    password: 'Organizer@123', phone: '+212611111111', companyName: 'Basketball Africa League', organizationSlug: 'basketball-africa-league', isActive: true
  }
];

const organizers: OrganizerModel[] = [
  {
    id: 'organizer-1', userId: 'org-1', companyName: 'Basketball Africa League', slug: 'basketball-africa-league', logo: '/assets/organizer-bal.png',
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
