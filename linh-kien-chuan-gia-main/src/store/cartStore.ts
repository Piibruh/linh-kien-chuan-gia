import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  maxStock: number;
  inStock: boolean;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          // Check if item is out of stock
          if (!newItem.inStock) {
            return state;
          }

          const existing = state.items.find((i) => i.id === newItem.id);
          if (existing) {
            // Don't add more if already at max stock
            if (existing.quantity >= existing.maxStock) {
              return state;
            }
            return {
              items: state.items.map((i) =>
                i.id === newItem.id
                  ? {
                      ...i,
                      quantity: Math.min(i.quantity + 1, i.maxStock),
                      // Update stock status in case it changed
                      inStock: newItem.inStock,
                      maxStock: newItem.maxStock,
                    }
                  : i
              ),
            };
          }
          return {
            items: [...state.items, { ...newItem, quantity: 1 }],
          };
        });
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id
              ? { ...i, quantity: Math.max(1, Math.min(quantity, i.maxStock)) }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),

      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    {
      name: 'electro-cart',
    }
  )
);