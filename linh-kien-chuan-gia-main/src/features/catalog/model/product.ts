export type ProductCategory = string;
export type ProductBrand = string;

export interface Product {
  id: string;
  name: string;
  slug: string;
  category: ProductCategory;
  brand: ProductBrand;
  price: number;
  oldPrice?: number;
  stock: number;
  rating?: number;
  sold?: number;
  specs?: Record<string, string>;
  description?: string;
  images: string[];
}

export type ProductSort =
  | 'relevance'
  | 'price-asc'
  | 'price-desc'
  | 'best-selling'
  | 'rating-desc'
  | 'newest';

export interface ProductListParams {
  categorySlug?: string; // slugified category
  search?: string;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
  inStock?: boolean;
  brands?: string[];
  priceMin?: number;
  priceMax?: number;
}

export interface ProductListResult {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
