import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProductCard } from './product-card';

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
  maxStock?: number;
}

interface ProductCarouselProps {
  products: Product[];
  title?: string;
  viewAllLink?: string;
}

export function ProductCarousel({ products, title, viewAllLink }: ProductCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of visible width
    const targetScroll = direction === 'left'
      ? container.scrollLeft - scrollAmount
      : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });
  };

  if (products.length === 0) return null;

  return (
    <div className="relative group">
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
          {viewAllLink && (
            <a
              href={viewAllLink}
              className="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
            >
              Xem tất cả →
            </a>
          )}
        </div>
      )}

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-card border border-border rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all disabled:opacity-0 flex items-center justify-center -ml-5"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5 text-foreground" />
        </button>

        {/* Products Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              className="flex-shrink-0 w-[280px] sm:w-[300px]"
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>

        {/* Right Arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-card border border-border rounded-full shadow-lg opacity-0 group-hover:opacity-100 hover:bg-muted transition-all disabled:opacity-0 flex items-center justify-center -mr-5"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5 text-foreground" />
        </button>
      </div>

      {/* CSS for hiding scrollbar */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
