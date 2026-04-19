import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface WishlistState {
  items: WishlistItem[];
  toggle: (item: WishlistItem) => void;
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        set({
          items: exists
            ? get().items.filter((i) => i.id !== item.id)
            : [item, ...get().items],
        });
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      has: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'wishlist-storage',
      version: 1,
    }
  )
);
