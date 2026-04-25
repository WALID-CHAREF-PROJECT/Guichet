import { CartItem, CustomerInfo, Order } from '../../types/commerce';
import { FavoriteItem } from '../storage';
import { apiBlob, apiClient } from './apiClient';
import { AuthUser } from './authClient';

export interface PendingOrderResponse {
  id: string;
  reference?: string;
  status: 'pending' | 'paid' | 'cancelled';
  amount: number;
}

export interface SportPlanZone {
  id: string;
  name: string;
  price: number;
  available: boolean;
  capacity: number;
}

export interface SportPlanResponse {
  eventId: string;
  zones: SportPlanZone[];
}

export const authApi = {
  login: (payload: { email: string; password: string }) => apiClient<{ user: AuthUser; token: string }>('/login', { method: 'POST', body: payload, skipAuth: true }),
  register: (payload: { firstName: string; lastName: string; email: string; password: string; role: 'client' | 'organizer'; companyName?: string; phone?: string }) =>
    apiClient<{ user: AuthUser; token: string }>('/register', { method: 'POST', body: payload, skipAuth: true }),
  logout: () => apiClient<{ success: boolean }>('/logout', { method: 'POST' }),
  me: () => apiClient<{ user: AuthUser }>('/me')
};

export const clientApi = {
  getProfile: () => apiClient<AuthUser>('/client/profile'),
  updateProfile: (payload: Partial<AuthUser>) => apiClient<AuthUser>('/client/profile', { method: 'PUT', body: payload }),
  getFavorites: () => apiClient<FavoriteItem[]>('/client/favorites'),
  addFavorite: (payload: Omit<FavoriteItem, 'id' | 'userId'>) => apiClient<FavoriteItem>('/client/favorites', { method: 'POST', body: payload }),
  deleteFavorite: (id: string) => apiClient<{ success: boolean }>(`/client/favorites/${id}`, { method: 'DELETE' }),
  getCart: () => apiClient<CartItem[]>('/client/cart'),
  addCartItem: (payload: CartItem) => apiClient<CartItem>('/client/cart', { method: 'POST', body: payload }),
  updateCartItem: (id: string, payload: Partial<CartItem>) => apiClient<CartItem>(`/client/cart/${id}`, { method: 'PUT', body: payload }),
  deleteCartItem: (id: string) => apiClient<{ success: boolean }>(`/client/cart/${id}`, { method: 'DELETE' }),
  getOrders: () => apiClient<Order[]>('/client/orders'),
  getOrder: (id: string) => apiClient<Order>(`/client/orders/${id}`),
  getReceiptByOrder: (orderId: string) => apiBlob(`/client/receipts/${orderId}`)
};

export const commerceApi = {
  createOrder: (payload: { items: CartItem[]; customer: CustomerInfo }) => apiClient<PendingOrderResponse>('/orders', { method: 'POST', body: payload }),
  initPayment: (payload: { orderId: string; method: string; cardHolder: string; cardNumber: string; expiry: string; cvv: string }) =>
    apiClient<{ paymentId: string; status: string }>('/payments/init', { method: 'POST', body: payload }),
  confirmPayment: (payload: { orderId: string; paymentId: string }) => apiClient<Order>('/payments/confirm', { method: 'POST', body: payload }),
  getOrder: (id: string) => apiClient<Order>(`/orders/${id}`),
  getReceipt: (id: string) => apiBlob(`/orders/${id}/receipt`)
};

export const organizerApi = {
  dashboard: () => apiClient<any>('/organizer/dashboard'),
  profile: () => apiClient<any>('/organizer/profile'),
  updateProfile: (payload: Record<string, unknown>) => apiClient<any>('/organizer/profile', { method: 'PUT', body: payload }),
  events: () => apiClient<any[]>('/organizer/events'),
  eventById: (id: string) => apiClient<any>(`/organizer/events/${id}`),
  createEvent: (payload: unknown) => apiClient<any>('/organizer/events', { method: 'POST', body: payload }),
  updateEvent: (id: string, payload: unknown) => apiClient<any>(`/organizer/events/${id}`, { method: 'PUT', body: payload }),
  deleteEvent: (id: string) => apiClient<{ success: boolean }>(`/organizer/events/${id}`, { method: 'DELETE' }),
  orders: () => apiClient<any[]>('/organizer/orders'),
  customers: () => apiClient<any[]>('/organizer/customers'),
  reports: () => apiClient<any>('/organizer/reports'),
  payouts: () => apiClient<any[]>('/organizer/payouts')
};

export const adminApi = {
  dashboard: () => apiClient<any>('/admin/dashboard'),
  users: () => apiClient<any[]>('/admin/users'),
  updateUser: (id: string, payload: unknown) => apiClient<any>(`/admin/users/${id}`, { method: 'PUT', body: payload }),
  deleteUser: (id: string) => apiClient<{ success: boolean }>(`/admin/users/${id}`, { method: 'DELETE' }),
  organizers: () => apiClient<any[]>('/admin/organizers'),
  updateOrganizer: (id: string, payload: unknown) => apiClient<any>(`/admin/organizers/${id}`, { method: 'PUT', body: payload }),
  events: () => apiClient<any[]>('/admin/events'),
  createEvent: (payload: unknown) => apiClient<any>('/admin/events', { method: 'POST', body: payload }),
  updateEvent: (id: string, payload: unknown) => apiClient<any>(`/admin/events/${id}`, { method: 'PUT', body: payload }),
  deleteEvent: (id: string) => apiClient<{ success: boolean }>(`/admin/events/${id}`, { method: 'DELETE' }),
  orders: () => apiClient<any[]>('/admin/orders'),
  categories: () => apiClient<any[]>('/admin/categories'),
  createCategory: (payload: unknown) => apiClient<any>('/admin/categories', { method: 'POST', body: payload }),
  updateCategory: (id: string, payload: unknown) => apiClient<any>(`/admin/categories/${id}`, { method: 'PUT', body: payload }),
  deleteCategory: (id: string) => apiClient<{ success: boolean }>(`/admin/categories/${id}`, { method: 'DELETE' }),
  travels: () => apiClient<any[]>('/admin/travels'),
  createTravel: (payload: unknown) => apiClient<any>('/admin/travels', { method: 'POST', body: payload }),
  updateTravel: (id: string, payload: unknown) => apiClient<any>(`/admin/travels/${id}`, { method: 'PUT', body: payload }),
  deleteTravel: (id: string) => apiClient<{ success: boolean }>(`/admin/travels/${id}`, { method: 'DELETE' }),
  movies: () => apiClient<any[]>('/admin/movies'),
  createMovie: (payload: unknown) => apiClient<any>('/admin/movies', { method: 'POST', body: payload }),
  updateMovie: (id: string, payload: unknown) => apiClient<any>(`/admin/movies/${id}`, { method: 'PUT', body: payload }),
  deleteMovie: (id: string) => apiClient<{ success: boolean }>(`/admin/movies/${id}`, { method: 'DELETE' }),
  content: () => apiClient<any[]>('/admin/content'),
  updateContent: (id: string, payload: unknown) => apiClient<any>(`/admin/content/${id}`, { method: 'PUT', body: payload })
};

export const catalogApi = {
  events: (query = '') => apiClient<any>(`/events${query ? `?${query}` : ''}`),
  eventBySlug: (slug: string) => apiClient<any>(`/events/${slug}`),
  sportPlan: (id: string) => apiClient<SportPlanResponse>(`/sport/events/${id}/plan`),
  selectSportPlace: (id: string, payload: { zoneId: string; quantity: number }) => apiClient<any>(`/sport/events/${id}/select-place`, { method: 'POST', body: payload })
};
