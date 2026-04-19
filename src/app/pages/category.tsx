import { useState, useMemo, useEffect } from 'react';
import { ArrowUpDown, Grid3x3, List, Search, X } from 'lucide-react';
import { useParams, useSearchParams, Link } from 'react-router';
import { CategoryFilters } from '../components/category-filters';
import { ProductCard } from '../components/product-card';
import { ProductGridSkeleton } from '../components/skeleton';
import { slugToCategory, CATEGORIES } from '../../store/productStore';
import { useAdminStore, useEffectiveProducts } from '../../store/adminStore';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'best-selling' | 'newest';
type ViewMode = 'grid' | 'list';

const ITEMS_PER_PAGE = 12;

export default function CategoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const products = useEffectiveProducts();

  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 999999999]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  // Determine category label
  const categoryLabel = slug === 'all' || !slug
    ? ''
    : slugToCategory(slug);

  // Simulate loading on navigation
  useEffect(() => {
    setIsLoading(true);
    setCurrentPage(1);
    const t = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(t);
  }, [slug, searchQuery]);

  // Base products
  const baseProducts = useMemo(() => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      let result = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q)
      );
      // If we're in a specific category (not 'all'), further filter the search results
      if (categoryLabel && slug !== 'all') {
        result = result.filter(p => p.category === categoryLabel);
      }
      return result;
    }
    if (categoryLabel) return products.filter((p) => p.category === categoryLabel);
    return products;
  }, [slug, searchQuery, categoryLabel, products]);

  // Apply filters
  const filteredProducts = useMemo(() => {
    let result = baseProducts.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );
    if (selectedBrands.length > 0) result = result.filter((p) => selectedBrands.includes(p.brand));
    if (inStockOnly) result = result.filter((p) => p.stock > 0);
    return result;
  }, [baseProducts, priceRange, selectedBrands, inStockOnly]);

  // Apply sorting
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price-asc':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-desc':
        return sorted.sort((a, b) => b.price - a.price);
      case 'best-selling':
        return sorted.sort((a, b) => b.sold - a.sold);
      case 'newest':
        return sorted.reverse();
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = sortedProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleFilterChange = (filters: {
    priceRange: [number, number];
    brands: string[];
    inStockOnly: boolean;
  }) => {
    setIsLoading(true);
    setPriceRange(filters.priceRange);
    setSelectedBrands(filters.brands);
    setInStockOnly(filters.inStockOnly);
    setCurrentPage(1);
    setTimeout(() => setIsLoading(false), 200);
  };

  const pageTitle = searchQuery
    ? `Kết quả tìm kiếm: "${searchQuery}"`
    : categoryLabel || 'Tất cả sản phẩm';

  const breadcrumb = categoryLabel
    ? CATEGORIES.find((c) => c.label === categoryLabel)?.label ?? categoryLabel
    : searchQuery ? 'Tìm kiếm' : 'Tất cả';

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span>/</span>
          <span className="text-foreground font-medium">{breadcrumb}</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8 flex items-center gap-3">
        {searchQuery && <Search className="h-6 w-6 text-muted-foreground" />}
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">{pageTitle}</h1>
          <p className="text-muted-foreground">Tìm thấy {sortedProducts.length} sản phẩm</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1">
          <CategoryFilters 
            onFilterChange={handleFilterChange}
            currentCategory={categoryLabel || undefined}
          />
          
          {/* Category quick links */}
          <div className="mt-4 bg-card border border-border rounded-xl p-4">
            <h3 className="font-medium text-foreground mb-3">Danh mục</h3>
            <div className="space-y-1">
              <Link
                to="/category/all"
                className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                  !categoryLabel && !searchQuery
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'hover:bg-muted text-foreground'
                }`}
              >
                <span>Tất cả sản phẩm</span>
                <span className="text-xs opacity-70">({products.length})</span>
              </Link>
              {CATEGORIES.map((cat) => {
                const count = products.filter((p) => p.category === cat.label).length;
                return (
                  <Link
                    key={cat.slug}
                    to={`/category/${cat.slug}`}
                    className={`flex justify-between items-center px-3 py-2 rounded-lg text-sm transition-colors ${
                      categoryLabel === cat.label
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'hover:bg-muted text-foreground'
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span className="text-xs opacity-70">{count}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Toolbar */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as SortOption);
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="default">Mặc định</option>
                  <option value="best-selling">Bán chạy nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid or Loading */}
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : paginatedProducts.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-16 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Không tìm thấy sản phẩm</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery ? `Không có kết quả cho "${searchQuery}"` : 'Thử thay đổi bộ lọc để xem thêm sản phẩm'}
              </p>
              <Link to="/category/all" className="text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                Xem tất cả sản phẩm →
              </Link>
            </div>
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
                  : 'space-y-4'
              }
            >
              {paginatedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  originalPrice={product.oldPrice}
                  image={product.images[0]}
                  rating={product.rating ?? 4.5}
                  reviews={product.sold ?? 0}
                  inStock={product.stock > 0}
                  maxStock={product.stock}
                  specs={Object.entries(product.specs).slice(0, 3).map(([k, v]) => `${k}: ${v}`)}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2 flex-wrap">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Trước
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    currentPage === page
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-card border border-border hover:bg-muted'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}