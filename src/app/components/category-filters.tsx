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
  availableProducts?: any[];
}

export function CategoryFilters({ onFilterChange, currentCategory, availableProducts }: CategoryFiltersProps) {
  const allProducts = useAdminStore((state) => state.products);
  const products = availableProducts || allProducts;
  
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    brand: true,
    stock: true,
  });

  // Get unique brands from products with counts
  const brandOptions = useMemo(() => {
    const brandCounts = products.reduce((acc, p) => {
      // Only count products in current category or all if no category
      if (!currentCategory || p.category === currentCategory) {
        acc[p.brand] = (acc[p.brand] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(brandCounts)
      .map(([brand, count]) => ({ label: brand, value: brand, count }))
      .sort((a, b) => b.count - a.count);
  }, [products, currentCategory]);

  // Stock status counts
  const stockStats = useMemo(() => {
    const filtered = currentCategory 
      ? products.filter(p => p.category === currentCategory)
      : products;
    
    return {
      inStock: filtered.filter(p => p.stock > 0).length,
      outOfStock: filtered.filter(p => p.stock === 0).length,
    };
  }, [products, currentCategory]);

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBrandToggle = (brand: string) => {
    const newBrands = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    
    setSelectedBrands(newBrands);
    emitFilterChange(newBrands, priceMin, priceMax, inStockOnly);
  };

  const handlePriceChange = () => {
    emitFilterChange(selectedBrands, priceMin, priceMax, inStockOnly);
  };

  const handleStockToggle = (value: boolean) => {
    setInStockOnly(value);
    emitFilterChange(selectedBrands, priceMin, priceMax, value);
  };

  const emitFilterChange = (brands: string[], min: string, max: string, stockOnly: boolean) => {
    const parsedMin = parseFloat(min);
    const parsedMax = parseFloat(max);
    
    const minPrice = !isNaN(parsedMin) ? parsedMin : 0;
    const maxPrice = !isNaN(parsedMax) ? parsedMax : 999999999;
    
    onFilterChange?.({
      priceRange: [minPrice, maxPrice],
      brands,
      inStockOnly: stockOnly,
    });
  };

  const clearAllFilters = () => {
    setPriceMin('');
    setPriceMax('');
    setSelectedBrands([]);
    setInStockOnly(false);
    onFilterChange?.({
      priceRange: [0, 999999999],
      brands: [],
      inStockOnly: false,
    });
  };

  const hasActiveFilters = 
    priceMin !== '' || 
    priceMax !== '' || 
    selectedBrands.length > 0 || 
    inStockOnly;

  const activeFilterCount = 
    (priceMin || priceMax ? 1 : 0) + 
    selectedBrands.length + 
    (inStockOnly ? 1 : 0);

  return (
    <div className="sticky top-24 z-10 relative self-start max-h-[calc(100vh-7rem)] flex flex-col">
      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col min-h-0 w-full max-h-full overflow-hidden">
        {/* Header */}
        <div className="flex shrink-0 items-center justify-between gap-2 p-4 bg-muted/30 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="font-bold text-base text-foreground truncate">Bộ lọc nâng cao</h3>
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
              className="text-sm text-destructive hover:text-destructive/80 transition-colors font-medium flex items-center gap-1 shrink-0"
            >
              <X className="h-4 w-4" />
              Xóa tất cả
            </button>
          )}
        </div>

        <div className="p-4 overflow-y-auto overscroll-y-contain min-h-0 flex-1 [scrollbar-gutter:stable]">
        {/* Price Range */}
        <div className="border-b border-border pb-4 mb-4">
          <button
            type="button"
            onClick={() => toggleSection('price')}
            className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
          >
            <span className="font-semibold text-sm text-foreground">Khoảng giá</span>
            {expandedSections['price'] ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {expandedSections['price'] && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Từ (₫)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    onBlur={handlePriceChange}
                    placeholder="0"
                    className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Đến (₫)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    onBlur={handlePriceChange}
                    placeholder="Max"
                    className="w-full px-3 py-2 text-sm border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-ring [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  />
                </div>
              </div>
              
              {/* Quick price filters */}
              <div className="flex flex-wrap gap-2">
                {[
                  { label: '< 50K', min: 0, max: 50000 },
                  { label: '50K-200K', min: 50000, max: 200000 },
                  { label: '200K-500K', min: 200000, max: 500000 },
                  { label: '> 500K', min: 500000, max: 999999999 },
                ].map((range) => (
                  <button
                    type="button"
                    key={range.label}
                    onClick={() => {
                      setPriceMin(range.min.toString());
                      setPriceMax(range.max === 999999999 ? '' : range.max.toString());
                      emitFilterChange(selectedBrands, range.min.toString(), range.max === 999999999 ? '' : range.max.toString(), inStockOnly);
                    }}
                    className="px-2.5 py-1 text-xs border border-border rounded-md hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              {(priceMin || priceMax) && (
                <div className="flex items-center gap-2 p-2 bg-primary/5 rounded-lg border border-primary/20">
                  <span className="text-xs text-primary font-medium flex-1">
                    {priceMin ? parseInt(priceMin).toLocaleString('vi-VN') : '0'}₫ - {priceMax ? parseInt(priceMax).toLocaleString('vi-VN') : '∞'}₫
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPriceMin('');
                      setPriceMax('');
                      handlePriceChange();
                    }}
                    className="text-primary hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Brand Filter */}
        <div className="border-b border-border pb-4 mb-4">
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
            {expandedSections['brand'] ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {expandedSections['brand'] && (
            <div className="space-y-1.5">
              {brandOptions.map((brand) => (
                <label
                  key={brand.value}
                  className="flex items-center gap-2 cursor-pointer group hover:bg-muted/50 p-2 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.value)}
                    onChange={() => handleBrandToggle(brand.value)}
                    className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary cursor-pointer accent-primary"
                  />
                  <span className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors">
                    {brand.label}
                  </span>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                    {brand.count}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Stock Status */}
        <div>
          <button
            type="button"
            onClick={() => toggleSection('stock')}
            className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
          >
            <span className="font-semibold text-sm text-foreground">Tình trạng kho</span>
            {expandedSections['stock'] ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {expandedSections['stock'] && (
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer group hover:bg-muted/50 p-2 rounded-lg transition-colors">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => handleStockToggle(e.target.checked)}
                  className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary cursor-pointer accent-primary"
                />
                <span className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors">
                  Chỉ hiển thị còn hàng
                </span>
                <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {stockStats.inStock}
                </span>
              </label>
              
              <div className="flex items-center gap-2 p-2 text-xs text-muted-foreground">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>Còn hàng: {stockStats.inStock}</span>
                <div className="h-2 w-2 rounded-full bg-red-500 ml-2" />
                <span>Hết: {stockStats.outOfStock}</span>
              </div>
            </div>
          )}
        </div>
        </div>

        {/* Active Filters Summary */}
        {hasActiveFilters && (
          <div className="shrink-0 p-4 bg-muted/30 border-t border-border">
            <div className="flex flex-wrap gap-2">
              {selectedBrands.map((brand) => (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1 bg-primary/10 text-primary text-xs px-2 py-1 rounded-md border border-primary/20"
                >
                  {brand}
                  <button
                    type="button"
                    onClick={() => handleBrandToggle(brand)}
                    className="hover:text-primary/80"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              {inStockOnly && (
                <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-md border border-green-200">
                  Còn hàng
                  <button
                    type="button"
                    onClick={() => handleStockToggle(false)}
                    className="hover:text-green-600"
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