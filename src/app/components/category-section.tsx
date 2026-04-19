import { ChevronRight, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router';
import { ProductCard } from './product-card';
import { useHorizontalScroll } from './hooks/useHorizontalScroll';

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  badge?: string;
  specs?: string[];
}

interface CategorySectionProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

export function CategorySection({ title, products, viewAllLink }: CategorySectionProps) {
  const { scrollContainerRef, canScrollLeft, canScrollRight, scroll } = useHorizontalScroll();
  const availableProducts = products.filter((product) => product.inStock);

  return (
    <section className="mb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {viewAllLink && (
          <Link
            to={viewAllLink}
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors group"
          >
            <span className="font-medium">Xem tất cả</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>

      {/* Products Horizontal Scroll */}
      <div className="relative group">
        {availableProducts.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card p-10 text-center">
            <p className="text-xl font-semibold text-foreground mb-2">Ôi không, mục này đang cháy hàng!</p>
            <p className="text-sm text-muted-foreground">Tất cả sản phẩm trong danh mục này đang nghỉ tạm. Quay lại sau để săn tiếp nhé.</p>
          </div>
        ) : (
          <>
            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-card border border-border rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all flex items-center justify-center -ml-5 ${
                !canScrollLeft ? 'cursor-not-allowed opacity-0 group-hover:opacity-40' : ''
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className={`h-5 w-5 ${canScrollLeft ? 'text-foreground' : 'text-muted-foreground'}`} />
            </button>

            {/* Products Scroll Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {availableProducts.map((product) => (
                <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[300px]">
                  <ProductCard {...product} />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-card border border-border rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all flex items-center justify-center -mr-5 ${
                !canScrollRight ? 'cursor-not-allowed opacity-0 group-hover:opacity-40' : ''
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className={`h-5 w-5 ${canScrollRight ? 'text-foreground' : 'text-muted-foreground'}`} />
            </button>
          </>
        )}
      </div>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}