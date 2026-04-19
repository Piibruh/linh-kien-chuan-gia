import type { MetadataRoute } from 'next';

import { productService } from '../features/catalog/api/productService';
import { getSiteUrl } from '../shared/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const now = new Date();

  const categories = await productService.getAllCategories();
  const products = await productService.getAllProducts();

  return [
    {
      url: `${base}/`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${base}/category/all`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...categories.map((c) => ({
      url: `${base}/category/${c.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.7,
    })),
    ...products.map((p) => ({
      url: `${base}/san-pham/${p.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    })),
  ];
}
