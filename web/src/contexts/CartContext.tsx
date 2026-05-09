"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CART_STORAGE_KEY,
  CartLine,
  cartLineCount,
  cartSubtotal,
  loadCartLines,
  mergeLine,
  saveCartLines,
} from "@/lib/cart-storage";

type CartProductInput = {
  id: string;
  slug: string | null;
  title: string;
  price: number;
  image_url: string | null;
};

type CartContextValue = {
  lines: CartLine[];
  /** Nombre total d’articles (somme des quantités) */
  totalItems: number;
  subtotal: number;
  addToCart: (product: CartProductInput, quantity?: number) => void;
  /** Acheter maintenant : panier remplacé par ce seul article (quantité 1) */
  buyNow: (product: CartProductInput) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeLine: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function toLine(product: CartProductInput, quantity: number): CartLine {
  return {
    productId: product.id,
    slug: product.slug ?? product.id,
    title: product.title,
    price: product.price,
    image_url: product.image_url,
    quantity,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const persist = useCallback((next: CartLine[]) => {
    saveCartLines(next);
    setLines(next);
  }, []);

  useEffect(() => {
    setLines(loadCartLines());
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CART_STORAGE_KEY) {
        setLines(loadCartLines());
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const addToCart = useCallback(
    (product: CartProductInput, quantity = 1) => {
      const next = mergeLine(lines, {
        ...toLine(product, 1),
        quantity,
      });
      persist(next);
    },
    [lines, persist]
  );

  const buyNow = useCallback(
    (product: CartProductInput) => {
      persist([toLine(product, 1)]);
    },
    [persist]
  );

  const setQuantity = useCallback(
    (productId: string, quantity: number) => {
      if (quantity < 1) {
        persist(lines.filter((l) => l.productId !== productId));
        return;
      }
      persist(
        lines.map((l) =>
          l.productId === productId ? { ...l, quantity } : l
        )
      );
    },
    [lines, persist]
  );

  const removeLine = useCallback(
    (productId: string) => {
      persist(lines.filter((l) => l.productId !== productId));
    },
    [lines, persist]
  );

  const clearCart = useCallback(() => {
    persist([]);
  }, [persist]);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      totalItems: cartLineCount(lines),
      subtotal: cartSubtotal(lines),
      addToCart,
      buyNow,
      setQuantity,
      removeLine,
      clearCart,
    }),
    [lines, addToCart, buyNow, setQuantity, removeLine, clearCart]
  );

  return (
    <CartContext.Provider value={value}>{children}</CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within CartProvider");
  }
  return ctx;
}
