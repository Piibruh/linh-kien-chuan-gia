import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface WishlistState {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
  clearWishlist: () => void;
  get totalItems(): number;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (item) => {
        const items = get().items;
        const exists = items.some((i) => i.id === item.id);
        if (exists) {
          set({ items: items.filter((i) => i.id !== item.id) });
        } else {
          set({ items: [...items, item] });
        }
      },
      isInWishlist: (id) => get().items.some((i) => i.id === id),
      clearWishlist: () => set({ items: [] }),
      get totalItems() {
        return get().items.length;
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
