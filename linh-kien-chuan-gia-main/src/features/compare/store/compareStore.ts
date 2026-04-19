import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CompareItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  specs?: Record<string, string>;
}

interface CompareState {
  items: CompareItem[];
  max: number;
  toggle: (item: CompareItem) => { added: boolean; reason?: 'max' };
  remove: (id: string) => void;
  clear: () => void;
  has: (id: string) => boolean;
}

export const useCompareStore = create<CompareState>()(
  persist(
    (set, get) => ({
      items: [],
      max: 4,
      toggle: (item) => {
        const exists = get().items.some((i) => i.id === item.id);
        if (exists) {
          set({ items: get().items.filter((i) => i.id !== item.id) });
          return { added: false };
        }

        if (get().items.length >= get().max) {
          return { added: false, reason: 'max' };
        }

        set({ items: [...get().items, item] });
        return { added: true };
      },
      remove: (id) => set({ items: get().items.filter((i) => i.id !== id) }),
      clear: () => set({ items: [] }),
      has: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'compare-storage',
      version: 1,
    }
  )
);
