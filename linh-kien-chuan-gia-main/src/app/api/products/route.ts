import { NextResponse } from 'next/server';

import { productService } from '../../../features/catalog/api/productService';

export function GET(req: Request) {
  const url = new URL(req.url);

  const categorySlug = url.searchParams.get('category') ?? undefined;
  const search = url.searchParams.get('search') ?? undefined;
  const sort = (url.searchParams.get('sort') ?? 'relevance') as any;
  const page = Number(url.searchParams.get('page') ?? '1');
  const pageSize = Number(url.searchParams.get('pageSize') ?? '24');
  const inStockParam = url.searchParams.get('inStock');
  const inStock = inStockParam ? inStockParam === '1' : undefined;

  const brands = url.searchParams.getAll('brands');
  const priceMin = url.searchParams.get('priceMin');
  const priceMax = url.searchParams.get('priceMax');

  return productService
    .list({
      categorySlug,
      search,
      sort,
      page,
      pageSize,
      inStock,
      brands: brands.length ? brands : undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    })
    .then((result) => NextResponse.json(result));
}
