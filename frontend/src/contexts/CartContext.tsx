import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, CartTotals } from '../types/commerce';
import { clientApi } from '../services/api/laravelApi';
import { isAuthenticated } from '../services/api/authClient';

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

export function CartProvider({ children }: { children: ReactNode }): JSX.Element {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const load = async (): Promise<void> => {
      if (!isAuthenticated()) {
        setItems([]);
        return;
      }
      try {
        const remoteItems = await clientApi.getCart();
        setItems(remoteItems);
      } catch {
        setItems([]);
      }
    };

    void load();
    const sync = (): void => void load();
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
      for (const item of newItems) {
        await clientApi.addCartItem(item);
      }
      const remote = await clientApi.getCart();
      setItems(remote);
    },
    removeItem: async (itemId) => {
      await clientApi.deleteCartItem(itemId);
      setItems((current) => current.filter((item) => item.id !== itemId));
    },
    increaseQuantity: async (itemId) => {
      const item = items.find((current) => current.id === itemId);
      if (!item) return;
      const updated = updateQuantity(item, item.quantity + 1);
      await clientApi.updateCartItem(itemId, { quantity: updated.quantity });
      setItems((current) => current.map((row) => (row.id === itemId ? updated : row)));
    },
    decreaseQuantity: async (itemId) => {
      const item = items.find((current) => current.id === itemId);
      if (!item) return;
      if (item.quantity <= 1) {
        await clientApi.deleteCartItem(itemId);
        setItems((current) => current.filter((row) => row.id !== itemId));
        return;
      }
      const updated = updateQuantity(item, item.quantity - 1);
      await clientApi.updateCartItem(itemId, { quantity: updated.quantity });
      setItems((current) => current.map((row) => (row.id === itemId ? updated : row)));
    },
    clearCart: async () => {
      await Promise.all(items.map((item) => clientApi.deleteCartItem(item.id)));
      setItems([]);
    }
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
