import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface RecentlyViewedItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  viewedAt: number;
}

interface RecentlyViewedState {
  items: RecentlyViewedItem[];
  cap: number;
  add: (item: Omit<RecentlyViewedItem, 'viewedAt'>) => void;
  clear: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      items: [],
      cap: 20,
      add: (item) => {
        const now = Date.now();
        const next = [
          { ...item, viewedAt: now },
          ...get().items.filter((i) => i.id !== item.id),
        ].slice(0, get().cap);
        set({ items: next });
      },
      clear: () => set({ items: [] }),
    }),
    {
      name: 'recently-viewed-storage',
      version: 1,
    }
  )
);
