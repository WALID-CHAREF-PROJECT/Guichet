import { CartItem, CustomerInfo, Order } from '../../types/commerce';
import { uid } from './utils';
import { getCurrentUser, getUserState, saveUserState } from '../storage';

export async function submitOrder(items: CartItem[], customer: CustomerInfo): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 1200));

  if (Math.random() < 0.05) {
    throw new Error('Une erreur est survenue. Merci de réessayer.');
  }

  const totalNow = items.reduce((sum, item) => sum + (item.advanceAmount ?? item.subtotal), 0);
  const remainingLater = items.reduce((sum, item) => sum + (item.remainingAmount ?? 0), 0);

  const order: Order = {
    id: uid('order'),
    reference: `GC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    items,
    customer,
    paymentMethod: 'card',
    totalNow,
    remainingLater,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  const current = getCurrentUser();
  if (current) {
    const state = getUserState(current.id, current);
    state.orders = [order, ...state.orders];
    state.reservations = [order, ...state.reservations];
    state.travelBookings = [...items.filter((i) => i.productType === 'travel_booking'), ...state.travelBookings];
    state.cinemaBookings = [...items.filter((i) => i.productType === 'movie_ticket'), ...state.cinemaBookings];
    state.balanceTransactions = [
      { id: uid('txn'), label: `Commande ${order.reference}`, amount: -totalNow, createdAt: order.createdAt },
      ...state.balanceTransactions
    ];
    saveUserState(current.id, state);
    localStorage.setItem(`ticketflow_last_order:${current.id}`, JSON.stringify(order));
    window.dispatchEvent(new Event('ticketflow:update'));
  }

  return order;
}

export function getLastOrder(): Order | null {
  const current = getCurrentUser();
  if (!current) return null;
  const raw = localStorage.getItem(`ticketflow_last_order:${current.id}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}
