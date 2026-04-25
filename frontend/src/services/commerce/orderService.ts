import { CartItem, CustomerInfo, Order } from '../../types/commerce';
import { commerceApi } from '../api/laravelApi';
import { getCurrentUser, getUserState, saveUserState } from '../storage';
import { safeFetchData } from '../safeApi';
import { uid } from './utils';

interface PendingOrder {
  id: string;
  orderId: string;
  items: CartItem[];
  customer: CustomerInfo;
  totalNow: number;
  remainingLater: number;
  createdAt: string;
  paymentId?: string;
}

const pendingOrderKey = 'ticketflow_pending_order';
const lastOrderKey = 'ticketflow_last_order';

function toOrder(pending: PendingOrder): Order {
  return {
    id: pending.orderId,
    reference: `CMD-${pending.orderId.slice(-6).toUpperCase()}`,
    items: pending.items,
    customer: pending.customer,
    paymentMethod: 'card',
    totalNow: pending.totalNow,
    remainingLater: pending.remainingLater,
    status: 'confirmed',
    createdAt: pending.createdAt
  };
}

export async function createPendingOrder(items: CartItem[], customer: CustomerInfo): Promise<PendingOrder> {
  const totalNow = items.reduce((sum, item) => sum + (item.advanceAmount ?? item.subtotal), 0);
  const remainingLater = items.reduce((sum, item) => sum + (item.remainingAmount ?? 0), 0);

  const fallbackId = uid('order');
  const orderId = await safeFetchData(
    async () => {
      const response = await commerceApi.createOrder({ items, customer });
      return response.id;
    },
    fallbackId
  );

  const pending: PendingOrder = {
    id: `pending-${orderId}`,
    orderId,
    items,
    customer,
    totalNow,
    remainingLater,
    createdAt: new Date().toISOString()
  };
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

export async function initPendingPayment(payload: { method: string; cardHolder: string; cardNumber: string; expiry: string; cvv: string }): Promise<PendingOrder> {
  const pending = getPendingOrder();
  if (!pending) throw new Error('Aucune commande en attente.');

  const paymentId = await safeFetchData(
    async () => {
      const payment = await commerceApi.initPayment({ orderId: pending.orderId, ...payload });
      return payment.paymentId;
    },
    uid('payment')
  );

  const next = { ...pending, paymentId };
  localStorage.setItem(pendingOrderKey, JSON.stringify(next));
  return next;
}

export async function finalizePendingOrder(): Promise<Order> {
  const pending = getPendingOrder();
  if (!pending || !pending.paymentId) throw new Error('Paiement non initialisé.');

  const order = await safeFetchData(
    () => commerceApi.confirmPayment({ orderId: pending.orderId, paymentId: pending.paymentId! }),
    toOrder(pending)
  );

  localStorage.setItem(lastOrderKey, JSON.stringify(order));
  const currentUser = getCurrentUser();
  if (currentUser) {
    const state = getUserState(currentUser.id);
    state.orders.unshift(order);
    state.reservations.unshift(order);
    saveUserState(currentUser.id, state);
  }
  clearPendingOrder();
  return order;
}

export async function getLastOrder(): Promise<Order | null> {
  const raw = localStorage.getItem(lastOrderKey);
  if (!raw) return null;
  try {
    const cached = JSON.parse(raw) as Order;
    return safeFetchData(() => commerceApi.getOrder(cached.id), cached);
  } catch {
    return null;
  }
}

export async function downloadReceipt(orderId: string): Promise<Blob> {
  return safeFetchData(
    () => commerceApi.getReceipt(orderId),
    new Blob(['Reçu local - impression disponible depuis la page de confirmation.'], { type: 'text/plain' })
  );
}

