import { memo, useCallback, useState } from 'react';
import { ShoppingCart, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '../../store/cartStore';

interface ProductCardProps {
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

export const ProductCard = memo(function ProductCard({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  inStock,
  badge,
  specs,
  maxStock = 50,
}: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!inStock || isAdding) return;
      
      setIsAdding(true);
      
      // Simulate brief loading state for better UX feedback
      await new Promise(resolve => setTimeout(resolve, 150));
      
      addItem({ id, name, price, image, maxStock, inStock });
      toast.success('Đã thêm vào giỏ hàng!', {
        description: name,
        action: {
          label: 'Xem giỏ',
          onClick: () => (window.location.href = '/cart'),
        },
      });
      
      setIsAdding(false);
    },
    [id, name, price, image, maxStock, inStock, addItem, isAdding]
  );

  return (
    <a
      href={`/product/${id}`}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.03] transition-all duration-300 block"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted p-4">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-contain"
          loading="lazy"
        />
        {badge && (
          <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">
            {badge}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
            -{discount}%
          </div>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-foreground/50 flex items-center justify-center">
            <span className="text-background font-bold">Hết hàng</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Product Name */}
        <h3 className="font-medium text-foreground mb-2 line-clamp-2 h-12 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Specs */}
        {specs && specs.length > 0 && (
          <div className="mb-3 text-xs text-muted-foreground font-mono space-y-1">
            {specs.slice(0, 3).map((spec, index) => (
              <div key={index} className="truncate">• {spec}</div>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const full = Math.floor(rating);
              return (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < full
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'fill-muted text-muted-foreground/40'
                  }`}
                />
              );
            })}
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{rating > 0 ? rating.toFixed(1) : ''}</span>
          <span className="text-xs text-muted-foreground">({reviews})</span>
        </div>

        {/* Price */}
        <div className="mb-3">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-primary">
              {price.toLocaleString('vi-VN')}₫
            </span>
            {originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                {originalPrice.toLocaleString('vi-VN')}₫
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock || isAdding}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
            inStock && !isAdding
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <ShoppingCart className={`h-4 w-4 ${isAdding ? 'animate-pulse' : ''}`} />
          <span className="text-sm">
            {isAdding ? 'Đang thêm...' : inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
          </span>
        </button>
      </div>
    </a>
  );
});