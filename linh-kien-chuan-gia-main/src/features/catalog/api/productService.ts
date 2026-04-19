import 'server-only';

import productsJson from '../../../data/products.json';
import type {
  Product,
  ProductListParams,
  ProductListResult,
  ProductSort,
} from '../model/product';
import { slugifyVi } from '../../../shared/lib/slug';

import { prisma } from '../../../server/db';

const ALL_PRODUCTS: Product[] = productsJson as unknown as Product[];

function normalizeSearch(s: string) {
  return s.trim().toLowerCase();
}

function sortProducts(items: Product[], sort: ProductSort): Product[] {
  const copy = [...items];
  switch (sort) {
    case 'price-asc':
      return copy.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return copy.sort((a, b) => b.price - a.price);
    case 'best-selling':
      return copy.sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0));
    case 'rating-desc':
      return copy.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
    case 'newest':
      return copy.sort((a, b) => b.id.localeCompare(a.id));
    case 'relevance':
    default:
      return copy;
  }
}

function dbEnabled() {
  return Boolean(process.env.DATABASE_URL && process.env.DATABASE_URL.trim());
}

type DbProduct = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  oldPrice: number | null;
  stock: number;
  rating: number | null;
  sold: number | null;
  description: string | null;
  specs: any;
  images: any;
  categorySlug: string;
  brandSlug: string;
};

function mapDbProduct(p: DbProduct): Product {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    brand: p.brand,
    price: p.price,
    oldPrice: p.oldPrice ?? undefined,
    stock: p.stock,
    rating: p.rating ?? undefined,
    sold: p.sold ?? undefined,
    description: p.description ?? undefined,
    specs: (p.specs as any) ?? undefined,
    images: (p.images as any) ?? [],
  };
}

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    if (!dbEnabled()) return ALL_PRODUCTS;
    const items = await prisma.product.findMany({ orderBy: { id: 'asc' } });
    return items.map(mapDbProduct as any);
  },

  async getAllCategories(): Promise<{ name: string; slug: string; count: number }[]> {
    if (!dbEnabled()) {
      const map = new Map<string, number>();
      for (const p of ALL_PRODUCTS) map.set(p.category, (map.get(p.category) ?? 0) + 1);
      return [...map.entries()]
        .map(([name, count]) => ({ name, slug: slugifyVi(name), count }))
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    const grouped = await prisma.product.groupBy({
      by: ['category', 'categorySlug'],
      _count: { _all: true },
      orderBy: { category: 'asc' },
    });

    return grouped.map((g) => ({
      name: g.category,
      slug: g.categorySlug,
      count: g._count._all,
    }));
  },

  async getAllBrands(): Promise<{ name: string; slug: string; count: number }[]> {
    if (!dbEnabled()) {
      const map = new Map<string, number>();
      for (const p of ALL_PRODUCTS) map.set(p.brand, (map.get(p.brand) ?? 0) + 1);
      return [...map.entries()]
        .map(([name, count]) => ({ name, slug: slugifyVi(name), count }))
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    const grouped = await prisma.product.groupBy({
      by: ['brand', 'brandSlug'],
      _count: { _all: true },
      orderBy: { brand: 'asc' },
    });

    return grouped.map((g) => ({
      name: g.brand,
      slug: g.brandSlug,
      count: g._count._all,
    }));
  },

  async getBySlug(slug: string): Promise<Product | null> {
    if (!dbEnabled()) {
      return ALL_PRODUCTS.find((p) => p.slug === slug) ?? null;
    }

    const p = await prisma.product.findUnique({ where: { slug } });
    return p ? mapDbProduct(p as any) : null;
  },

  async getById(id: string): Promise<Product | null> {
    if (!dbEnabled()) {
      return ALL_PRODUCTS.find((p) => p.id === id) ?? null;
    }

    const p = await prisma.product.findUnique({ where: { id } });
    return p ? mapDbProduct(p as any) : null;
  },

  async list(params: ProductListParams = {}): Promise<ProductListResult> {
    const {
      categorySlug,
      search,
      sort = 'relevance',
      page = 1,
      pageSize = 24,
      inStock,
      brands,
      priceMin,
      priceMax,
    } = params;

    if (!dbEnabled()) {
      // JSON fallback
      let items = ALL_PRODUCTS;

      if (categorySlug && categorySlug !== 'all') {
        items = items.filter((p) => slugifyVi(p.category) === categorySlug);
      }
      if (typeof inStock === 'boolean') {
        items = items.filter((p) => (inStock ? p.stock > 0 : p.stock === 0));
      }
      if (brands && brands.length > 0) {
        const set = new Set(brands.map((b) => slugifyVi(b)));
        items = items.filter((p) => set.has(slugifyVi(p.brand)));
      }
      if (typeof priceMin === 'number') items = items.filter((p) => p.price >= priceMin);
      if (typeof priceMax === 'number') items = items.filter((p) => p.price <= priceMax);

      if (search && search.trim()) {
        const q = normalizeSearch(search);
        items = items.filter((p) => {
          const hay = `${p.name} ${p.brand} ${p.category} ${p.id}`.toLowerCase();
          return hay.includes(q);
        });
      }

      items = sortProducts(items, sort);
      const total = items.length;
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const safePage = Math.min(Math.max(page, 1), totalPages);
      const start = (safePage - 1) * pageSize;
      const paged = items.slice(start, start + pageSize);

      return { items: paged, total, page: safePage, pageSize, totalPages };
    }

    const where: any = {};

    if (categorySlug && categorySlug !== 'all') {
      where.categorySlug = categorySlug;
    }

    if (typeof inStock === 'boolean') {
      where.stock = inStock ? { gt: 0 } : { equals: 0 };
    }

    if (brands && brands.length > 0) {
      where.brandSlug = { in: brands.map((b) => String(b)) };
    }

    if (typeof priceMin === 'number' || typeof priceMax === 'number') {
      where.price = {
        ...(typeof priceMin === 'number' ? { gte: priceMin } : {}),
        ...(typeof priceMax === 'number' ? { lte: priceMax } : {}),
      };
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        { id: { contains: q, mode: 'insensitive' } },
      ];
    }

    const orderBy: any = (() => {
      switch (sort) {
        case 'price-asc':
          return { price: 'asc' };
        case 'price-desc':
          return { price: 'desc' };
        case 'best-selling':
          return [{ sold: 'desc' }, { id: 'asc' }];
        case 'rating-desc':
          return [{ rating: 'desc' }, { id: 'asc' }];
        case 'newest':
          return { createdAt: 'desc' };
        default:
          return { id: 'asc' };
      }
    })();

    const total = await prisma.product.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(page, 1), totalPages);

    const items = await prisma.product.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * pageSize,
      take: pageSize,
    });

    return {
      items: items.map(mapDbProduct as any),
      total,
      page: safePage,
      pageSize,
      totalPages,
    };
  },

  async getRelatedProducts(slug: string, limit = 8): Promise<Product[]> {
    const product = await this.getBySlug(slug);
    if (!product) return [];

    if (!dbEnabled()) {
      const sameCategory = ALL_PRODUCTS.filter(
        (p) => p.slug !== product.slug && p.category === product.category
      );
      const scored = sameCategory
        .map((p) => {
          const brandScore = p.brand === product.brand ? 2 : 0;
          const priceScore = 1 - Math.min(1, Math.abs(p.price - product.price) / Math.max(1, product.price));
          const ratingScore = (p.rating ?? 0) / 5;
          return { p, score: brandScore + priceScore + ratingScore };
        })
        .sort((a, b) => b.score - a.score)
        .map((x) => x.p);

      return scored.slice(0, limit);
    }

    const categorySlug = slugifyVi(product.category);
    const items = await prisma.product.findMany({
      where: {
        categorySlug,
        slug: { not: product.slug },
      },
      take: 30,
    });

    const scored = items
      .map((p: any) => {
        const mapped = mapDbProduct(p);
        const brandScore = mapped.brand === product.brand ? 2 : 0;
        const priceScore = 1 - Math.min(1, Math.abs(mapped.price - product.price) / Math.max(1, product.price));
        const ratingScore = (mapped.rating ?? 0) / 5;
        return { p: mapped, score: brandScore + priceScore + ratingScore };
      })
      .sort((a, b) => b.score - a.score)
      .map((x) => x.p)
      .slice(0, limit);

    return scored;
  },
};
