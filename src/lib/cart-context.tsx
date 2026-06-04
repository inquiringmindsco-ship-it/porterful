'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface CartItem {
  productId: string;
  variantKey?: string;
  quantity: number;
  size?: string;
  color?: string;
  price: number;
  name: string;
  artist: string;
  image: string;
  artistCut: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  artistCut: number;
  itemCount: number;
  mounted: boolean;
}

const CartContext = createContext<CartContextType | null>(null);

function buildCartLineKey(item: Pick<CartItem, 'productId' | 'variantKey' | 'size' | 'color'>) {
  if (item.variantKey?.trim()) {
    return item.variantKey.trim();
  }

  return [item.productId, item.size?.trim() || '', item.color?.trim() || ''].join('::');
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('porterful-cart');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setItems(Array.isArray(parsed)
          ? parsed.map((item) => ({
              ...item,
              variantKey: buildCartLineKey(item),
            }))
          : []);
      } catch (e) {
        console.error('Failed to load cart:', e);
      }
    }
    setIsLoaded(true);
    setMounted(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('porterful-cart', JSON.stringify(items));
    }
  }, [items, isLoaded]);

  const addItem = (item: Omit<CartItem, 'quantity'>) => {
    const variantKey = buildCartLineKey(item)
    setItems(prev => {
      const existing = prev.find(i => buildCartLineKey(i) === variantKey);
      if (existing) {
        return prev.map(i => 
          buildCartLineKey(i) === variantKey
            ? { ...i, quantity: i.quantity + 1, variantKey }
            : i
        );
      }
      return [...prev, { ...item, variantKey, quantity: 1 }];
    });
  };

  const removeItem = (lineKey: string) => {
    setItems(prev => prev.filter(i => buildCartLineKey(i) !== lineKey && i.productId !== lineKey));
  };

  const updateQuantity = (lineKey: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(lineKey);
      return;
    }
    setItems(prev => prev.map(i => 
      buildCartLineKey(i) === lineKey || i.productId === lineKey ? { ...i, quantity } : i
    ));
  };

  const clearCart = () => {
    setItems([]);
    localStorage.removeItem('porterful-cart');
  };

  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const artistCut = items.reduce((sum, i) => sum + i.artistCut * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      subtotal,
      artistCut,
      itemCount,
      mounted,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
