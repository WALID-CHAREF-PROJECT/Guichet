export type UserRole = 'client' | 'organizer' | 'producer' | 'admin';

export interface ApiUser {
  id: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  companyName?: string;
  organizationSlug?: string;
  isActive: boolean;
  password: string;
}

export interface OrganizerModel {
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
  isApproved: boolean;
}

export interface EventModel {
  id: string;
  organizerId: string;
  title: string;
  slug: string;
  category: string;
  city: string;
  location: string;
  date: string;
  time: string;
  image: string;
  status: 'draft' | 'published' | 'archived' | 'past';
  featured: boolean;
  ticketsSold: number;
  revenue: number;
}

export interface OrderModel {
  id: string;
  reference: string;
  customerId: string;
  organizerId?: string;
  productType: 'event' | 'travel' | 'movie';
  productId: string;
  total: number;
  paymentStatus: 'pending' | 'paid' | 'cancelled';
  createdAt: string;
}

export interface FavoriteModel {
  id: string;
  userId: string;
  itemId: string;
  itemType: 'event' | 'movie' | 'travel' | 'sport';
  slug: string;
  title: string;
  image: string;
  location?: string;
  date?: string;
  route: string;
}
