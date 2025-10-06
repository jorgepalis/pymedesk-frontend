'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Product } from '@/api/types';
import { parsePrice } from '@/utils/currency';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (product: Product, quantity?: number) => boolean;
  increment: (productId: number) => boolean;
  decrement: (productId: number) => boolean;
  removeItem: (productId: number) => void;
  clearCart: () => void;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CART_STORAGE_KEY = 'pymedesk.cart';

const CartContext = createContext<CartContextValue | undefined>(undefined);

const readCartFromStorage = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  const data = window.localStorage.getItem(CART_STORAGE_KEY);
  if (!data) return [];

  try {
    const parsed = JSON.parse(data) as CartItem[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is CartItem =>
        Boolean(item && item.product && typeof item.quantity === 'number'),
      )
      .map((item) => ({
        product: item.product,
        quantity: Math.max(1, Math.floor(item.quantity)),
      }));
  } catch {
    return [];
  }
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readCartFromStorage());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const totalItems = useMemo(
    () => items.reduce((acc, item) => acc + item.quantity, 0),
    [items],
  );

  const totalPrice = useMemo(
    () => items.reduce((acc, item) => acc + parsePrice(item.product.price) * item.quantity, 0),
    [items],
  );

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const addItem = useCallback(
    (product: Product, quantity: number = 1) => {
      if (product.stock <= 0) return false;

      let result = false;
      const maxQuantity = Math.max(0, product.stock);

      setItems((prev) => {
        const existingIndex = prev.findIndex((item) => item.product.id === product.id);

        if (existingIndex >= 0) {
          const existing = prev[existingIndex];
          const desired = Math.min(existing.quantity + quantity, maxQuantity);
          if (desired === existing.quantity) {
            result = true;
            return prev;
          }
          result = true;
          const next = [...prev];
          next[existingIndex] = { ...existing, quantity: desired };
          return next;
        }

        const initialQuantity = Math.min(Math.max(1, quantity), maxQuantity);
        if (initialQuantity <= 0) {
          return prev;
        }
        result = true;
        return [...prev, { product, quantity: initialQuantity }];
      });

      if (result) {
        setIsOpen(true);
      }

      return result;
    },
    [],
  );

  const increment = useCallback((productId: number) => {
    let updated = false;
    setItems((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) {
          return item;
        }
        const max = Math.max(0, item.product.stock);
        if (item.quantity >= max) {
          return item;
        }
        updated = true;
        return { ...item, quantity: item.quantity + 1 };
      }),
    );
    return updated;
  }, []);

  const decrement = useCallback((productId: number) => {
    let updated = false;
    setItems((prev) => {
      const next: CartItem[] = [];
      for (const item of prev) {
        if (item.product.id !== productId) {
          next.push(item);
          continue;
        }
        if (item.quantity <= 1) {
          updated = true;
          continue;
        }
        updated = true;
        next.push({ ...item, quantity: item.quantity - 1 });
      }
      return next;
    });
    return updated;
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setIsOpen(false);
  }, []);

  const value = useMemo(
    () => ({
      items,
      totalItems,
      totalPrice,
      addItem,
      increment,
      decrement,
      removeItem,
      clearCart,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      items,
      totalItems,
      totalPrice,
      addItem,
      increment,
      decrement,
      removeItem,
      clearCart,
      isOpen,
      openCart,
      closeCart,
      toggleCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de CartProvider');
  }
  return context;
};
