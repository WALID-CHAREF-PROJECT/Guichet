import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { CartItem, CartTotals } from '../types/commerce';
import { getCurrentUser, getUserState, saveUserState } from '../services/storage';

interface CartContextValue {
  items: CartItem[];
  totals: CartTotals;
  addItems: (items: CartItem[]) => void;
  removeItem: (itemId: string) => void;
  increaseQuantity: (itemId: string) => void;
  decreaseQuantity: (itemId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);

function readUserCart(): CartItem[] {
  const current = getCurrentUser();
  if (!current) return [];
  return getUserState(current.id, current).cart;
}

function persistUserCart(items: CartItem[]): void {
  const current = getCurrentUser();
  if (!current) return;
  const state = getUserState(current.id, current);
  state.cart = items;
  saveUserState(current.id, state);
}

function mergeByIdentity(current: CartItem[], incoming: CartItem[]): CartItem[] {
  const merged = [...current];
  incoming.forEach((nextItem) => {
    const found = merged.find(
      (item) =>
        item.slug === nextItem.slug &&
        item.ticketType === nextItem.ticketType &&
        (item.selectedSeats ?? []).join(',') === (nextItem.selectedSeats ?? []).join(',')
    );

    if (found) {
      found.quantity += nextItem.quantity;
      found.subtotal = found.quantity * found.unitPrice;
      if (found.advanceAmount !== undefined) found.advanceAmount += nextItem.advanceAmount ?? 0;
      if (found.remainingAmount !== undefined) found.remainingAmount += nextItem.remainingAmount ?? 0;
      return;
    }

    merged.push(nextItem);
  });

  return merged;
}

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
  const [items, setItems] = useState<CartItem[]>(() => readUserCart());

  useEffect(() => {
    const sync = (): void => setItems(readUserCart());
    window.addEventListener('ticketflow:update', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('ticketflow:update', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  useEffect(() => {
    persistUserCart(items);
    window.dispatchEvent(new Event('ticketflow:update'));
  }, [items]);

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
    addItems: (newItems) => setItems((current) => mergeByIdentity(current, newItems)),
    removeItem: (itemId) => setItems((current) => current.filter((item) => item.id !== itemId)),
    increaseQuantity: (itemId) => setItems((current) => current.map((item) => (item.id === itemId ? updateQuantity(item, item.quantity + 1) : item))),
    decreaseQuantity: (itemId) =>
      setItems((current) =>
        current
          .map((item) => {
            if (item.id !== itemId) return item;
            if (item.quantity <= 1) return null;
            return updateQuantity(item, item.quantity - 1);
          })
          .filter((item): item is CartItem => item !== null)
      ),
    clearCart: () => setItems([])
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
