import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, CartTotals } from '../types/commerce';
import { clientApi } from '../services/api/laravelApi';
import { getCurrentUser, getUserState, saveUserState } from '../services/storage';
import { safeRun } from '../services/safeApi';

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  addItems: (items: CartItem[]) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  increaseQuantity: (itemId: string) => Promise<void>;
  decreaseQuantity: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);
const GUEST_CART_KEY = 'app:guest:cart';

function updateQuantity(item: CartItem, quantity: number): CartItem {
  const safeQuantity = Math.max(1, quantity);
  const ratio = safeQuantity / item.quantity;
  return {
    ...item,
    quantity: safeQuantity,
    subtotal: item.unitPrice * safeQuantity,
    advanceAmount: item.advanceAmount !== undefined ? Math.round(item.advanceAmount * ratio) : undefined,
    remainingAmount: item.remainingAmount !== undefined ? Math.round(item.remainingAmount * ratio) : undefined
  };
}

function readGuestCart(): CartItem[] {
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) ?? '[]') as CartItem[];
  } catch {
    return [];
  }
}

function persistCart(next: CartItem[]): void {
  const currentUser = getCurrentUser();
  if (currentUser) {
    const state = getUserState(currentUser.id);
    state.cart = next;
    saveUserState(currentUser.id, state);
  } else {
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(next));
  }
  window.dispatchEvent(new Event('ticketflow:update'));
}

function loadCart(): CartItem[] {
  const currentUser = getCurrentUser();
  if (currentUser) return getUserState(currentUser.id).cart;
  return readGuestCart();
}

export function CartProvider({ children }: { children: ReactNode }): JSX.Element {
  const [items, setItems] = useState<CartItem[]>(() => loadCart());

  useEffect(() => {
    const sync = (): void => setItems(loadCart());
    window.addEventListener('ticketflow:update', sync);
    return () => window.removeEventListener('ticketflow:update', sync);
  }, []);

  const totals = useMemo<CartTotals>(() => {
    return items.reduce(
      (acc, item) => {
        acc.itemsCount += 1;
        acc.totalQuantity += item.quantity;
        acc.subtotal += item.subtotal;
        acc.totalNow += item.advanceAmount ?? item.subtotal;
        acc.remainingLater += item.remainingAmount ?? 0;
        return acc;
      },
      { itemsCount: 0, totalQuantity: 0, subtotal: 0, totalNow: 0, remainingLater: 0 }
    );
  }, [items]);

  const value: CartContextValue = {
    items,
    totals,
    addItems: async (newItems) => {
      const next = [...items, ...newItems];
      setItems(next);
      persistCart(next);
      await safeRun(async () => {
        for (const item of newItems) {
          await clientApi.addCartItem(item);
        }
      });
    },
    removeItem: async (itemId) => {
      const next = items.filter((item) => item.id !== itemId);
      setItems(next);
      persistCart(next);
      await safeRun(async () => {
        await clientApi.deleteCartItem(itemId);
      });
    },
    increaseQuantity: async (itemId) => {
      const next = items.map((item) => (item.id === itemId ? updateQuantity(item, item.quantity + 1) : item));
      const updated = next.find((row) => row.id === itemId);
      setItems(next);
      persistCart(next);
      if (!updated) return;
      await safeRun(async () => {
        await clientApi.updateCartItem(itemId, { quantity: updated.quantity });
      });
    },
    decreaseQuantity: async (itemId) => {
      const target = items.find((item) => item.id === itemId);
      if (!target) return;
      const next = target.quantity <= 1 ? items.filter((row) => row.id !== itemId) : items.map((item) => (item.id === itemId ? updateQuantity(item, item.quantity - 1) : item));
      setItems(next);
      persistCart(next);
      await safeRun(async () => {
        if (target.quantity <= 1) {
          await clientApi.deleteCartItem(itemId);
          return;
        }
        await clientApi.updateCartItem(itemId, { quantity: target.quantity - 1 });
      });
    },
    clearCart: async () => {
      const currentItems = [...items];
      setItems([]);
      persistCart([]);
      await safeRun(async () => {
        await Promise.all(currentItems.map((item) => clientApi.deleteCartItem(item.id)));
      });
    }
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
