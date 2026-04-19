import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: string;
  brand: string;
  price: number;
  oldPrice?: number;
  stock: number;
  rating: number;
  sold?: number;
  reviews?: number;
  specs?: Record<string, string>;
  specifications?: Record<string, string>; // Support both field names
  description?: string;
  images: string[];
  publishDate?: string;
  editCount?: number;
  lastEditedBy?: string;
  views?: number;
}

export const CATEGORIES = [
  { slug: 'vi-dieu-khien', label: 'Vi điều khiển' },
  { slug: 'cam-bien', label: 'Cảm biến' },
  { slug: 'module', label: 'Module' },
  { slug: 'linh-kien-co-ban', label: 'Linh kiện cơ bản' },
  { slug: 'phu-kien', label: 'Phụ kiện' },
];

export const slugToCategory = (slug: string): string => {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? '';
};

// Get products from adminStore dynamically, applying Flash Sale prices if active
const getProductsFromAdminStore = (): Product[] => {
  try {
    const adminStoreState = localStorage.getItem('electro-admin');
    if (adminStoreState) {
      const parsed = JSON.parse(adminStoreState);
      const products: Product[] = parsed.state?.products || [];
      const storeConfig = parsed.state?.storeConfig;

      // Check if Flash Sale is currently active
      const flashSaleEndStr = localStorage.getItem('electro-flash-sale-end');
      const flashSaleEnd = flashSaleEndStr ? parseInt(flashSaleEndStr, 10) : 0;
      const isFlashSaleActive = !isNaN(flashSaleEnd) && flashSaleEnd > Date.now();

      if (isFlashSaleActive && storeConfig?.flashSaleItems?.length > 0) {
        return products.map(product => {
          const fsItem = storeConfig.flashSaleItems.find((item: any) => item.productId === product.id);
          if (fsItem && fsItem.flashSalePrice < product.price) {
            // Apply custom flash sale price, overriding old price
            return {
              ...product,
              oldPrice: product.price,
              price: fsItem.flashSalePrice,
            };
          }
          return product;
        });
      }

      return products;
    }
  } catch (error) {
    console.error('Error loading products from adminStore:', error);
  }
  return [];
};

interface ProductStore {
  getProducts: () => Product[];
  getById: (id: string) => Product | undefined;
  getByCategory: (category: string) => Product[];
  search: (query: string) => Product[];
}

export const useProductStore = create<ProductStore>()(() => ({
  getProducts: () => getProductsFromAdminStore(),

  getById: (id) => getProductsFromAdminStore().find((p) => p.id === id),

  getByCategory: (category) => {
    const products = getProductsFromAdminStore();
    return category ? products.filter((p) => p.category === category) : products;
  },

  search: (query) => {
    const products = getProductsFromAdminStore();
    const q = query.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  },
}));

// For backward compatibility
export const ALL_PRODUCTS = getProductsFromAdminStore();