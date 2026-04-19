'use client';

import { Heart, Scale, ShoppingCart, Star } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { toast } from 'sonner';

import { useCartStore } from '../../store/cartStore';
import { useCompareStore } from '../../features/compare/store/compareStore';
import { useWishlistStore } from '../../features/wishlist/store/wishlistStore';

interface ProductCardProps {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  stock?: number;
  badge?: string;
  specs?: string[];
  specsMap?: Record<string, string>;
}

export function ProductCard({
  id,
  slug,
  name,
  price,
  originalPrice,
  image,
  rating = 0,
  reviews = 0,
  inStock,
  stock = inStock ? 9999 : 0,
  badge,
  specs,
  specsMap,
}: ProductCardProps) {
  const href = slug ? `/san-pham/${slug}` : `/product/${id}`;
  const discount = originalPrice
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;

  const addItem = useCartStore((s) => s.addItem);

  const wishlistActive = useWishlistStore((s) => s.has(id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const compareActive = useCompareStore((s) => s.has(id));
  const toggleCompare = useCompareStore((s) => s.toggle);

  return (
    <Link
      href={href}
      className="group bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg hover:scale-[1.02] transition-all duration-300 block"
    >
      {/* Image Container */}
      <div className="relative aspect-square bg-muted p-4">
        <Image
          src={image}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-contain p-4"
        />

        {/* Quick actions */}
        <div className="absolute top-2 right-2 flex flex-col gap-2">
          <button
            type="button"
            aria-label={wishlistActive ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleWishlist({ id, slug: slug ?? id, name, price, image, stock });
              toast.success(
                wishlistActive ? 'Đã bỏ khỏi wishlist' : 'Đã thêm vào wishlist'
              );
            }}
            className={`p-2 rounded-lg backdrop-blur border transition-colors ${
              wishlistActive
                ? 'bg-primary text-primary-foreground border-primary/30'
                : 'bg-white/80 text-foreground border-border hover:bg-white'
            }`}
          >
            <Heart className={wishlistActive ? 'h-4 w-4 fill-current' : 'h-4 w-4'} />
          </button>

          <button
            type="button"
            aria-label={compareActive ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh'}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              const result = toggleCompare({
                id,
                slug: slug ?? id,
                name,
                price,
                image,
                specs: specsMap,
              });

              if (result.reason === 'max') {
                toast.error('Bạn chỉ có thể so sánh tối đa 4 sản phẩm');
                return;
              }

              toast.success(result.added ? 'Đã thêm vào so sánh' : 'Đã bỏ khỏi so sánh');
            }}
            className={`p-2 rounded-lg backdrop-blur border transition-colors ${
              compareActive
                ? 'bg-accent text-accent-foreground border-accent/30'
                : 'bg-white/80 text-foreground border-border hover:bg-white'
            }`}
          >
            <Scale className="h-4 w-4" />
          </button>
        </div>

        {badge && (
          <div className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs font-bold px-2 py-1 rounded">
            {badge}
          </div>
        )}
        {discount > 0 && (
          <div className="absolute bottom-2 left-2 bg-destructive text-destructive-foreground text-xs font-bold px-2 py-1 rounded">
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
        <h3 className="font-medium text-foreground mb-2 line-clamp-2 min-h-12 group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Specs */}
        {specs && specs.length > 0 && (
          <div className="mb-3 text-xs text-muted-foreground font-mono space-y-1">
            {specs.slice(0, 3).map((spec, index) => (
              <div key={index} className="truncate">
                • {spec}
              </div>
            ))}
          </div>
        )}

        {/* Rating */}
        <div className="flex items-center gap-2 mb-3" aria-label={`Đánh giá ${rating}/5`}>
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted'
                }`}
              />
            ))}
          </div>
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
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!inStock) return;

            addItem({
              id,
              slug: slug ?? id,
              name,
              price,
              image,
              stock,
              quantity: 1,
            });

            toast.success('Đã thêm vào giỏ hàng', {
              action: {
                label: 'Xem giỏ',
                onClick: () => (window.location.href = '/cart'),
              },
            });
          }}
          disabled={!inStock}
          aria-disabled={!inStock}
          className={`w-full py-2 px-4 rounded-lg flex items-center justify-center gap-2 font-medium transition-all ${
            inStock
              ? 'bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95'
              : 'bg-muted text-muted-foreground cursor-not-allowed'
          }`}
        >
          <ShoppingCart className="h-4 w-4" />
          <span className="text-sm">{inStock ? 'Thêm vào giỏ' : 'Hết hàng'}</span>
        </button>
      </div>
    </Link>
  );
}
