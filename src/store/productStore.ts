import { create } from 'zustand';

export interface Product {
  maSanPham: string;
  tenSanPham: string;
  slug: string;
  maDanhMuc: string;
  thuongHieu: string;
  giaBan: number;
  oldPrice?: number;
  soLuongTon: number;
  rating: number;
  sold?: number;
  reviews?: number;
  moTaKT?: string;
  moTa?: string;
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

      return products.map((p) => {
        let finalPrice = p.giaBan;
        let oldPrice = p.oldPrice;

        // Apply dynamic Flash Sale price if configured
        if (isFlashSaleActive && storeConfig?.flashSaleItems) {
          const fsItem = storeConfig.flashSaleItems.find((i: any) => i.maSanPham === p.maSanPham);
          if (fsItem) {
            oldPrice = p.giaBan;
            finalPrice = fsItem.flashSalePrice;
          }
        }

        return {
          ...p,
          giaBan: finalPrice,
          oldPrice: oldPrice,
        };
      });
    }
  } catch (e) {
    console.error('Error reading products from adminStore:', e);
  }
  return [];
};

interface ProductStore {
  products: Product[];
  searchQuery: string;
  selectedCategory: string;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  getFilteredProducts: () => Product[];
  refreshProducts: () => void;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: getProductsFromAdminStore(),
  searchQuery: '',
  selectedCategory: 'all',

  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),

  refreshProducts: () => {
    set({ products: getProductsFromAdminStore() });
  },

  getFilteredProducts: () => {
    const { products, searchQuery, selectedCategory } = get();
    return products.filter((p) => {
      const matchesSearch =
        p.tenSanPham.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.thuongHieu.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || p.maDanhMuc === selectedCategory || p.slug === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  },
}));