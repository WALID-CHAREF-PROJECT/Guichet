import { CartItem, CustomerInfo, Order } from '../../types/commerce';
import { commerceApi } from '../api/laravelApi';

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

export async function createPendingOrder(items: CartItem[], customer: CustomerInfo): Promise<PendingOrder> {
  const totalNow = items.reduce((sum, item) => sum + (item.advanceAmount ?? item.subtotal), 0);
  const remainingLater = items.reduce((sum, item) => sum + (item.remainingAmount ?? 0), 0);
  const response = await commerceApi.createOrder({ items, customer });
  const pending: PendingOrder = {
    id: `pending-${response.id}`,
    orderId: response.id,
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
  const payment = await commerceApi.initPayment({ orderId: pending.orderId, ...payload });
  const next = { ...pending, paymentId: payment.paymentId };
  localStorage.setItem(pendingOrderKey, JSON.stringify(next));
  return next;
}

export async function finalizePendingOrder(): Promise<Order> {
  const pending = getPendingOrder();
  if (!pending || !pending.paymentId) throw new Error('Paiement non initialisé.');
  const order = await commerceApi.confirmPayment({ orderId: pending.orderId, paymentId: pending.paymentId });
  localStorage.setItem(lastOrderKey, JSON.stringify(order));
  clearPendingOrder();
  return order;
}

export async function getLastOrder(): Promise<Order | null> {
  const raw = localStorage.getItem(lastOrderKey);
  if (!raw) return null;
  try {
    const cached = JSON.parse(raw) as Order;
    return await commerceApi.getOrder(cached.id);
  } catch {
    return null;
  }
}

export async function downloadReceipt(orderId: string): Promise<Blob> {
  return commerceApi.getReceipt(orderId);
}
