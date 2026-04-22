import { CartItem, CustomerInfo, Order } from '../../types/commerce';
import { uid } from './utils';
import { getCurrentUser, getUserState, saveUserState } from '../storage';

interface PendingOrder {
  id: string;
  items: CartItem[];
  customer: CustomerInfo;
  totalNow: number;
  remainingLater: number;
  createdAt: string;
}

const pendingOrderKey = 'ticketflow_pending_order';

export function createPendingOrder(items: CartItem[], customer: CustomerInfo): PendingOrder {
  const totalNow = items.reduce((sum, item) => sum + (item.advanceAmount ?? item.subtotal), 0);
  const remainingLater = items.reduce((sum, item) => sum + (item.remainingAmount ?? 0), 0);
  const pending: PendingOrder = { id: uid('pending'), items, customer, totalNow, remainingLater, createdAt: new Date().toISOString() };
  localStorage.setItem(pendingOrderKey, JSON.stringify(pending));
  return pending;
}

export function getPendingOrder(): PendingOrder | null {
  const raw = localStorage.getItem(pendingOrderKey);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PendingOrder;
  } catch {
    return null;
  }
}

export function clearPendingOrder(): void {
  localStorage.removeItem(pendingOrderKey);
}

export async function finalizePendingOrder(paymentMethod: 'card' = 'card'): Promise<Order> {
  await new Promise((resolve) => setTimeout(resolve, 1200));
  const pending = getPendingOrder();
  if (!pending) throw new Error('Aucune commande en attente.');

  const order: Order = {
    id: uid('order'),
    reference: `GC-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
    items: pending.items,
    customer: pending.customer,
    paymentMethod,
    totalNow: pending.totalNow,
    remainingLater: pending.remainingLater,
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };

  const current = getCurrentUser();
  if (current) {
    const state = getUserState(current.id, current);
    state.orders = [order, ...state.orders];
    state.reservations = [order, ...state.reservations];
    state.travelBookings = [...pending.items.filter((i) => i.productType === 'travel_booking'), ...state.travelBookings];
    state.cinemaBookings = [...pending.items.filter((i) => i.productType === 'movie_ticket'), ...state.cinemaBookings];
    state.balanceTransactions = [
      { id: uid('txn'), label: `Commande ${order.reference}`, amount: -pending.totalNow, createdAt: order.createdAt },
      ...state.balanceTransactions
    ];
    saveUserState(current.id, state);
    localStorage.setItem(`ticketflow_last_order:${current.id}`, JSON.stringify(order));
    window.dispatchEvent(new Event('ticketflow:update'));
  }

  clearPendingOrder();
  return order;
}

export async function submitOrder(items: CartItem[], customer: CustomerInfo): Promise<Order> {
  createPendingOrder(items, customer);
  return finalizePendingOrder('card');
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
