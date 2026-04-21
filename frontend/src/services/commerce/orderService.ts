import { CartItem, CustomerInfo, Order } from '../../types/commerce';
import { uid } from './utils';

const ORDER_KEY = 'ticketflow_last_order';

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

  localStorage.setItem(ORDER_KEY, JSON.stringify(order));
  return order;
}

export function getLastOrder(): Order | null {
  const raw = localStorage.getItem(ORDER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Order;
  } catch {
    return null;
  }
}
