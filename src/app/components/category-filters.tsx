import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';

interface CategoryFiltersProps {
  onFilterChange?: (filters: {
    priceRange: [number, number];
    brands: string[];
    inStockOnly: boolean;
  }) => void;
  currentCategory?: string;
}

export function CategoryFilters({ onFilterChange, currentCategory }: CategoryFiltersProps) {
  const products = useAdminStore((state) => state.products);

  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    brand: true,
    stock: true,
  });

  // ── Derived data ──────────────────────────────────────────
  const brandOptions = useMemo(() => {
    const brandCounts = products.reduce((acc, p) => {
      if (!currentCategory || p.category === currentCategory) {
        acc[p.brand] = (acc[p.brand] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(brandCounts)
      .map(([brand, count]) => ({ label: brand, value: brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [products, currentCategory]);

  const stockStats = useMemo(() => {
    const filtered = currentCategory
      ? products.filter((p) => p.category === currentCategory)
      : products;
    return {
      inStock: filtered.filter((p) => p.stock > 0).length,
      outOfStock: filtered.filter((p) => p.stock === 0).length,
    };
  }, [products, currentCategory]);

  // ── Helpers ───────────────────────────────────────────────
  const toggleSection = (section: string) =>
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));

  /** Always call with explicit values to avoid stale-closure bugs */
  const emit = (
    brands: string[],
    min: string,
    max: string,
    stockOnly: boolean
  ) => {
    const parsedMin = parseFloat(min);
    const parsedMax = parseFloat(max);
    onFilterChange?.({
      priceRange: [
        isNaN(parsedMin) ? 0 : parsedMin,
        isNaN(parsedMax) ? 999_999_999 : parsedMax,
      ],
      brands,
      inStockOnly: stockOnly,
    });
  };

  // ── Handlers ──────────────────────────────────────────────
  const handleBrandToggle = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(next);
    emit(next, priceMin, priceMax, inStockOnly);
  };

  const handlePriceBlur = () => emit(selectedBrands, priceMin, priceMax, inStockOnly);

  const handleQuickPrice = (min: number, max: number) => {
    const minStr = min.toString();
    const maxStr = max === 999_999_999 ? '' : max.toString();
    setPriceMin(minStr);
    setPriceMax(maxStr);
    emit(selectedBrands, minStr, maxStr, inStockOnly);
  };

  const handleClearPrice = () => {
    setPriceMin('');
    setPriceMax('');
    emit(selectedBrands, '', '', inStockOnly); // pass '' directly, not stale state
  };

  const handleStockToggle = (value: boolean) => {
    setInStockOnly(value);
    emit(selectedBrands, priceMin, priceMax, value);
  };

  const clearAllFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedBrands([]);
    setInStockOnly(false);
    onFilterChange?.({ priceRange: [0, 999_999_999], brands: [], inStockOnly: false });
  };

  // ── Active filter state ───────────────────────────────────
  const hasActiveFilters = priceMin !== '' || priceMax !== '' || selectedBrands.length > 0 || inStockOnly;
  const activeFilterCount =
    (priceMin || priceMax ? 1 : 0) + selectedBrands.length + (inStockOnly ? 1 : 0);

  // ── Render ────────────────────────────────────────────────
  return (
    /* No sticky/fixed positioning — let it sit in normal document flow so it
       never overlaps the category links below it */
    <div className="w-full">
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between gap-2 px-4 py-3 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-bold text-sm text-foreground truncate">Bộ lọc nâng cao</h3>
            {activeFilterCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full shrink-0">
                {activeFilterCount}
              </span>
            )}
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs text-destructive hover:text-destructive/80 transition-colors font-medium flex items-center gap-1 shrink-0"
            >
              <X className="h-3.5 w-3.5" />
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="p-4 space-y-5">
          {/* ── Khoảng giá ── */}
          <div className="border-b border-border pb-5">
            <button
              type="button"
              onClick={() => toggleSection('price')}
              className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
            >
              <span className="font-semibold text-sm text-foreground">Khoảng giá</span>
              {expandedSections['price']
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {expandedSections['price'] && (
              <div className="space-y-3">
                {/* Manual inputs */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Từ (₫)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={priceMin}
                      onChange={(e) => setPriceMin(e.target.value)}
                      onBlur={handlePriceBlur}
                      onKeyDown={(e) => e.key === 'Enter' && handlePriceBlur()}
                      placeholder="0"
                      className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Đến (₫)</label>
                    <input
                      type="number"
                      inputMode="numeric"
                      value={priceMax}
                      onChange={(e) => setPriceMax(e.target.value)}
                      onBlur={handlePriceBlur}
                      onKeyDown={(e) => e.key === 'Enter' && handlePriceBlur()}
                      placeholder="Max"
                      className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    />
                  </div>
                </div>

                {/* Quick ranges */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    { label: '< 50K', min: 0, max: 50_000 },
                    { label: '50K-200K', min: 50_000, max: 200_000 },
                    { label: '200K-500K', min: 200_000, max: 500_000 },
                    { label: '> 500K', min: 500_000, max: 999_999_999 },
                  ].map((range) => {
                    const isActive =
                      priceMin === range.min.toString() &&
                      (range.max === 999_999_999 ? priceMax === '' : priceMax === range.max.toString());
                    return (
                      <button
                        type="button"
                        key={range.label}
                        onClick={() => handleQuickPrice(range.min, range.max)}
                        className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                          isActive
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border hover:bg-primary hover:text-primary-foreground hover:border-primary'
                        }`}
                      >
                        {range.label}
                      </button>
                    );
                  })}
                </div>

                {/* Active price chip */}
                {(priceMin || priceMax) && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/5 rounded-lg border border-primary/20">
                    <span className="text-xs text-primary font-medium flex-1">
                      {priceMin ? parseInt(priceMin).toLocaleString('vi-VN') : '0'}₫
                      {' — '}
                      {priceMax ? parseInt(priceMax).toLocaleString('vi-VN') : '∞'}₫
                    </span>
                    <button
                      type="button"
                      onClick={handleClearPrice}
                      className="text-primary hover:text-primary/70 transition-colors"
                      aria-label="Xóa khoảng giá"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Thương hiệu ── */}
          <div className="border-b border-border pb-5">
            <button
              type="button"
              onClick={() => toggleSection('brand')}
              className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
            >
              <span className="font-semibold text-sm text-foreground">
                Thương hiệu
                {selectedBrands.length > 0 && (
                  <span className="ml-2 text-xs text-primary">({selectedBrands.length})</span>
                )}
              </span>
              {expandedSections['brand']
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {expandedSections['brand'] && (
              <div className="space-y-1">
                {brandOptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2">Không có thương hiệu</p>
                ) : (
                  brandOptions.map((brand) => (
                    <label
                      key={brand.value}
                      className="flex items-center gap-2 cursor-pointer group hover:bg-muted/60 px-2 py-1.5 rounded-lg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedBrands.includes(brand.value)}
                        onChange={() => handleBrandToggle(brand.value)}
                        className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                      />
                      <span className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors truncate">
                        {brand.label}
                      </span>
                      <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                        {brand.count}
                      </span>
                    </label>
                  ))
                )}
              </div>
            )}
          </div>

          {/* ── Tình trạng kho ── */}
          <div>
            <button
              type="button"
              onClick={() => toggleSection('stock')}
              className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
            >
              <span className="font-semibold text-sm text-foreground">Tình trạng kho</span>
              {expandedSections['stock']
                ? <ChevronUp className="h-4 w-4 text-muted-foreground" />
                : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </button>

            {expandedSections['stock'] && (
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer group hover:bg-muted/60 px-2 py-1.5 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => handleStockToggle(e.target.checked)}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors">
                    Chỉ hiển thị còn hàng
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">
                    {stockStats.inStock}
                  </span>
                </label>

                <div className="flex items-center gap-3 px-2 py-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                    Còn hàng: <strong className="text-foreground">{stockStats.inStock}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-400 inline-block" />
                    Hết: <strong className="text-foreground">{stockStats.outOfStock}</strong>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Active filter chips ── */}
        {hasActiveFilters && (
          <div className="px-4 pb-4 pt-0">
            <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
              {selectedBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md border border-primary/20"
                >
                  {brand}
                  <button
                    type="button"
                    onClick={() => handleBrandToggle(brand)}
                    aria-label={`Xóa thương hiệu ${brand}`}
                    className="hover:text-primary/70 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs px-2 py-1 rounded-md border border-green-200 dark:border-green-800">
                  Còn hàng
                  <button
                    type="button"
                    onClick={() => handleStockToggle(false)}
                    aria-label="Xóa lọc còn hàng"
                    className="hover:opacity-70 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {(priceMin || priceMax) && (
                <span className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md border border-primary/20">
                  {priceMin ? parseInt(priceMin).toLocaleString('vi-VN') : '0'}₫–
                  {priceMax ? parseInt(priceMax).toLocaleString('vi-VN') : '∞'}₫
                  <button
                    type="button"
                    onClick={handleClearPrice}
                    aria-label="Xóa khoảng giá"
                    className="hover:text-primary/70 transition-colors"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}