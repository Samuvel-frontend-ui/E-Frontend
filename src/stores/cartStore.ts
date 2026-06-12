import { create } from 'zustand';
import { getCartCache, saveCartCache, type CartItemCache } from '../indexeddb/db';

interface CartState {
  items: CartItemCache[];
  isLoaded: boolean;
  loadCart: () => Promise<void>;
  addItem: (item: Omit<CartItemCache, 'quantity'> & { quantity?: number }) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isLoaded: false,

  loadCart: async () => {
    try {
      const cached = await getCartCache();
      set({ items: cached, isLoaded: true });
    } catch (error) {
      console.error('Failed to load cart from IndexedDB', error);
      set({ isLoaded: true });
    }
  },

  addItem: (newItem) => {
    const current = get().items;
    const qty = newItem.quantity || 1;
    
    const existingIndex = current.findIndex(
      (item) => item.productId === newItem.productId && item.variantId === newItem.variantId
    );

    let updatedItems: CartItemCache[] = [];

    if (existingIndex > -1) {
      updatedItems = [...current];
      updatedItems[existingIndex].quantity += qty;
    } else {
      updatedItems = [...current, { ...newItem, quantity: qty }];
    }

    set({ items: updatedItems });
    saveCartCache(updatedItems);
  },

  removeItem: (productId, variantId) => {
    const current = get().items;
    const updatedItems = current.filter(
      (item) => !(item.productId === productId && item.variantId === variantId)
    );
    set({ items: updatedItems });
    saveCartCache(updatedItems);
  },

  updateQuantity: (productId, quantity, variantId) => {
    if (quantity <= 0) {
      get().removeItem(productId, variantId);
      return;
    }
    
    const current = get().items;
    const updatedItems = current.map((item) => {
      if (item.productId === productId && item.variantId === variantId) {
        return { ...item, quantity };
      }
      return item;
    });

    set({ items: updatedItems });
    saveCartCache(updatedItems);
  },

  clearCart: () => {
    set({ items: [] });
    saveCartCache([]);
  },

  getCartTotal: () => {
    return get().items.reduce((total, item) => total + item.price * item.quantity, 0);
  },

  getCartCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  }
}));
