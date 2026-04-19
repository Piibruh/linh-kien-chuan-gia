import type { Metadata } from 'next';
import Link from 'next/link';

import { productService } from '../../../features/catalog/api/productService';
import { slugifyVi } from '../../../shared/lib/slug';
import { buildCategoryMetadata } from '../../../shared/lib/seo';
import { ProductCard } from '../../../app-old/components/product-card';

function toNumber(v: string | undefined): number | undefined {
  if (!v) return undefined;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const categories = await productService.getAllCategories();
  const category = categories.find((c) => c.slug === slug)?.name;

  const title = slug === 'all' ? 'Tất cả sản phẩm' : category ?? `Danh mục ${slug}`;
  const description =
    slug === 'all'
      ? 'Khám phá tất cả linh kiện điện tử, module, cảm biến, phụ kiện tại Linh Kiện Chuẩn Giá.'
      : `Khám phá sản phẩm thuộc danh mục ${category ?? slug} tại Linh Kiện Chuẩn Giá.`;

  return buildCategoryMetadata({
    title,
    description,
    canonicalPath: `/category/${slug}`,
  });
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { slug } = await params;
  const sp = await searchParams;

  const search = typeof sp.search === 'string' ? sp.search : undefined;
  const sort = typeof sp.sort === 'string' ? (sp.sort as any) : 'relevance';
  const page = typeof sp.page === 'string' ? Number(sp.page) : 1;

  const inStock =
    typeof sp.inStock === 'string' ? sp.inStock === '1' : undefined;

  const brandSlugsRaw = sp.brands;
  const brandSlugs = Array.isArray(brandSlugsRaw)
    ? brandSlugsRaw.filter((x): x is string => typeof x === 'string')
    : typeof brandSlugsRaw === 'string'
      ? brandSlugsRaw.split(',').filter(Boolean)
      : undefined;

  const priceMin = typeof sp.priceMin === 'string' ? toNumber(sp.priceMin) : undefined;
  const priceMax = typeof sp.priceMax === 'string' ? toNumber(sp.priceMax) : undefined;

  const result = await productService.list({
    categorySlug: slug,
    search,
    sort,
    page,
    pageSize: 24,
    inStock,
    brands: brandSlugs,
    priceMin,
    priceMax,
  });

  const categories = await productService.getAllCategories();
  const brands = await productService.getAllBrands();

  const categoryName =
    slug === 'all'
      ? 'Tất cả sản phẩm'
      : categories.find((c) => c.slug === slug)?.name ?? slug;

  const currentBrands = new Set((brandSlugs ?? []).map((b) => String(b)));

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">{categoryName}</span>
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">{categoryName}</h1>
        <p className="text-muted-foreground">Tìm thấy {result.total} sản phẩm</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Filters */}
        <aside className="lg:col-span-1">
          <form className="bg-card border border-border rounded-xl p-4 sticky top-24">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <h2 className="font-bold text-lg text-foreground">Bộ lọc</h2>
              <Link
                href={`/category/${slug}`}
                className="text-sm text-primary hover:underline"
              >
                Reset
              </Link>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Tìm kiếm
                </label>
                <input
                  name="search"
                  defaultValue={search ?? ''}
                  placeholder="Arduino, ESP32, cảm biến..."
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Sắp xếp
                </label>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="w-full px-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="relevance">Mặc định</option>
                  <option value="best-selling">Bán chạy nhất</option>
                  <option value="rating-desc">Đánh giá cao</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="inStock"
                  type="checkbox"
                  name="inStock"
                  value="1"
                  defaultChecked={inStock === true}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-ring"
                />
                <label htmlFor="inStock" className="text-sm text-foreground">
                  Chỉ hiện sản phẩm còn hàng
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Giá từ
                  </label>
                  <input
                    name="priceMin"
                    inputMode="numeric"
                    defaultValue={priceMin ?? ''}
                    placeholder="0"
                    className="w-full px-3 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Đến
                  </label>
                  <input
                    name="priceMax"
                    inputMode="numeric"
                    defaultValue={priceMax ?? ''}
                    placeholder="999000"
                    className="w-full px-3 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-foreground">Thương hiệu</span>
                  <span className="text-xs text-muted-foreground">Chọn nhiều</span>
                </div>
                <div className="max-h-56 overflow-auto pr-1 space-y-2">
                  {brands.map((b) => {
                    const checked = currentBrands.has(b.slug);
                    return (
                      <label
                        key={b.slug}
                        className="flex items-center gap-2 cursor-pointer hover:bg-muted p-2 rounded-lg transition-colors"
                      >
                        <input
                          type="checkbox"
                          name="brands"
                          value={b.slug}
                          defaultChecked={checked}
                          className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-ring"
                        />
                        <span className="text-sm text-foreground flex-1">{b.name}</span>
                        <span className="text-xs text-muted-foreground">({b.count})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground px-4 py-3 rounded-lg font-bold hover:bg-primary/90"
              >
                Áp dụng
              </button>

              <p className="text-xs text-muted-foreground">
                Tip: Bạn có thể copy URL để share bộ lọc.
              </p>
            </div>
          </form>
        </aside>

        {/* Results */}
        <main className="lg:col-span-3">
          {result.items.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <div className="text-2xl font-bold text-foreground mb-2">
                Không tìm thấy sản phẩm
              </div>
              <p className="text-muted-foreground mb-6">
                Hãy thử thay đổi bộ lọc hoặc từ khóa.
              </p>
              <Link
                href={`/category/${slug}`}
                className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90"
              >
                Reset bộ lọc
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {result.items.map((p) => (
                  <ProductCard
                    key={p.id}
                    id={p.id}
                    slug={p.slug}
                    name={p.name}
                    price={p.price}
                    originalPrice={p.oldPrice}
                    image={p.images[0] ?? ''}
                    rating={p.rating ?? 0}
                    reviews={p.sold ?? 0}
                    inStock={p.stock > 0}
                    stock={p.stock}
                    specs={p.specs ? (Object.values(p.specs) as string[]).slice(0, 3) : []}
                    specsMap={p.specs}
                    badge={p.oldPrice && p.price < p.oldPrice ? `-${Math.round((1 - p.price / p.oldPrice) * 100)}%` : undefined}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="mt-10 flex items-center justify-center gap-2">
                {Array.from({ length: result.totalPages }).slice(0, 7).map((_, i) => {
                  const n = i + 1;
                  const isActive = n === result.page;
                  const url = new URLSearchParams();
                  if (search) url.set('search', search);
                  if (sort && sort !== 'relevance') url.set('sort', sort);
                  if (inStock) url.set('inStock', '1');
                  if (brandSlugs?.length) url.set('brands', brandSlugs.join(','));
                  if (typeof priceMin === 'number') url.set('priceMin', String(priceMin));
                  if (typeof priceMax === 'number') url.set('priceMax', String(priceMax));
                  if (n !== 1) url.set('page', String(n));

                  return (
                    <Link
                      key={n}
                      href={`/category/${slug}?${url.toString()}`}
                      className={`px-4 py-2 rounded-lg border transition-colors ${
                        isActive
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-card border-border hover:bg-muted'
                      }`}
                    >
                      {n}
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
