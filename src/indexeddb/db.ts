import { openDB, type IDBPDatabase } from 'idb';

const DB_NAME = 'ecommerce_store';
const DB_VERSION = 1;

export interface CartItemCache {
  productId: string;
  variantId?: string;
  title: string;
  variantTitle?: string;
  price: number;
  quantity: number;
  coverImage?: string;
}

export interface ProductCache {
  id: string;
  title: string;
  slug: string;
  price: number;
  cover_image: string;
}

let dbPromise: Promise<IDBPDatabase> | null = null;

export function getDb(): Promise<IDBPDatabase> {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Create stores if they do not exist
        if (!db.objectStoreNames.contains('cart')) {
          db.createObjectStore('cart', { keyPath: 'productId' });
        }
        if (!db.objectStoreNames.contains('wishlist')) {
          db.createObjectStore('wishlist', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('recently_viewed')) {
          db.createObjectStore('recently_viewed', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('profile_cache')) {
          db.createObjectStore('profile_cache');
        }
        if (!db.objectStoreNames.contains('draft_checkout')) {
          db.createObjectStore('draft_checkout');
        }
      },
    });
  }
  return dbPromise;
}

// Generic Store Operations
export async function getFromStore<T>(storeName: string, key: string): Promise<T | undefined> {
  const db = await getDb();
  return db.get(storeName, key);
}

export async function getAllFromStore<T>(storeName: string): Promise<T[]> {
  const db = await getDb();
  return db.getAll(storeName);
}

export async function setToStore<T>(storeName: string, value: T): Promise<void> {
  const db = await getDb();
  await db.put(storeName, value);
}

export async function deleteFromStore(storeName: string, key: string): Promise<void> {
  const db = await getDb();
  await db.delete(storeName, key);
}

export async function clearStore(storeName: string): Promise<void> {
  const db = await getDb();
  await db.clear(storeName);
}

// Typed Helper Functions
export async function getCartCache(): Promise<CartItemCache[]> {
  return getAllFromStore<CartItemCache>('cart');
}

export async function saveCartCache(items: CartItemCache[]): Promise<void> {
  await clearStore('cart');
  for (const item of items) {
    await setToStore('cart', item);
  }
}

export async function getWishlistCache(): Promise<ProductCache[]> {
  return getAllFromStore<ProductCache>('wishlist');
}

export async function saveWishlistCache(items: ProductCache[]): Promise<void> {
  await clearStore('wishlist');
  for (const item of items) {
    await setToStore('wishlist', item);
  }
}

export async function getRecentlyViewedCache(): Promise<ProductCache[]> {
  return getAllFromStore<ProductCache>('recently_viewed');
}

export async function saveRecentlyViewedCache(items: ProductCache[]): Promise<void> {
  await clearStore('recently_viewed');
  for (const item of items) {
    await setToStore('recently_viewed', item);
  }
}
