import { create } from 'zustand';
import { getWishlistCache, saveWishlistCache, type ProductCache } from '../indexeddb/db';

interface WishlistState {
  items: ProductCache[];
  isLoaded: boolean;
  loadWishlist: () => Promise<void>;
  toggleWishlist: (product: ProductCache) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoaded: false,

  loadWishlist: async () => {
    try {
      const cached = await getWishlistCache();
      set({ items: cached, isLoaded: true });
    } catch (error) {
      console.error('Failed to load wishlist from IndexedDB', error);
      set({ isLoaded: true });
    }
  },

  toggleWishlist: (product) => {
    const current = get().items;
    const exists = current.some((item) => item.id === product.id);
    let updated: ProductCache[] = [];

    if (exists) {
      updated = current.filter((item) => item.id !== product.id);
    } else {
      updated = [...current, product];
    }

    set({ items: updated });
    saveWishlistCache(updated);
  },

  isInWishlist: (id) => {
    return get().items.some((item) => item.id === id);
  }
}));
