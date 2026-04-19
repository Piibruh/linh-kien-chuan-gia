'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Scale,
  Shield,
  ShoppingCart,
  Star,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

import type { Product } from '../model/product';
import { formatVnd } from '../../../shared/lib/money';
import { slugifyVi } from '../../../shared/lib/slug';
import { useCartStore } from '../../../store/cartStore';
import { useWishlistStore } from '../../wishlist/store/wishlistStore';
import { useCompareStore } from '../../compare/store/compareStore';
import { useRecentlyViewedStore } from '../../recently-viewed/store/recentlyViewedStore';
import { ProductCard } from '../../../app-old/components/product-card';

function RatingStars({ rating }: { rating: number }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center" aria-label={`Đánh giá ${rating}/5`}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < rounded ? 'fill-yellow-400 text-yellow-400' : 'text-muted'
          }`}
        />
      ))}
    </div>
  );
}

export function ProductDetailClient({
  product,
  related,
}: {
  product: Product;
  related: Product[];
}) {
  const [selectedImage, setSelectedImage] = useState(0);

  const images = product.images && product.images.length > 0 ? product.images : ['/images/og-default.jpg'];
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');
  const [isZoomed, setIsZoomed] = useState(false);

  const inStock = product.stock > 0;

  const addItem = useCartStore((s) => s.addItem);
  const wishlistActive = useWishlistStore((s) => s.has(product.id));
  const toggleWishlist = useWishlistStore((s) => s.toggle);

  const compareActive = useCompareStore((s) => s.has(product.id));
  const toggleCompare = useCompareStore((s) => s.toggle);

  const recentlyViewedItems = useRecentlyViewedStore((s) => s.items);
  const addRecentlyViewed = useRecentlyViewedStore((s) => s.add);

  useEffect(() => {
    addRecentlyViewed({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? '',
    });
  }, [addRecentlyViewed, product.id, product.name, product.price, product.slug, product.images]);

  const recentlyViewed = useMemo(
    () => recentlyViewedItems.filter((i) => i.id !== product.id).slice(0, 8),
    [recentlyViewedItems, product.id]
  );

  const nextImage = () => setSelectedImage((i) => (i + 1) % images.length);
  const prevImage = () => setSelectedImage((i) => (i - 1 + images.length) % images.length);

  const discountPercent =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6" aria-label="Breadcrumb">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary transition-colors">
            Trang chủ
          </Link>
          <span>/</span>
          <Link
            href={`/category/${slugifyVi(product.category)}`}
            className="hover:text-primary transition-colors"
          >
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Gallery */}
        <div>
          <div className="relative bg-card border border-border rounded-xl overflow-hidden mb-4 group">
            <button
              type="button"
              onClick={() => setIsZoomed((z) => !z)}
              aria-label={isZoomed ? 'Thu nhỏ ảnh' : 'Phóng to ảnh'}
              className={`relative aspect-square w-full ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
            >
              <Image
                src={images[selectedImage]}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className={`object-contain p-6 transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
              />
            </button>

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  aria-label="Ảnh trước"
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur hover:bg-background text-foreground p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={nextImage}
                  aria-label="Ảnh kế tiếp"
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur hover:bg-background text-foreground p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => (
                <button
                  key={img}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                  aria-label={`Chọn ảnh ${index + 1}`}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedImage === index
                      ? 'border-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Image src={img} alt={`${product.name} ${index + 1}`} fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <div className="text-sm text-muted-foreground mb-2">
                Thương hiệu:{' '}
                <span className="text-primary font-medium">{product.brand}</span>
                {'  '}| SKU: <span className="font-mono">{product.id}</span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-3">{product.name}</h1>

              <div className="flex items-center gap-4 mb-3">
                <RatingStars rating={product.rating ?? 0} />
                <span className="text-sm text-muted-foreground">{product.sold ?? 0} đã bán</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Tình trạng:</span>
                {inStock ? (
                  <span className="text-sm text-green-600 font-medium flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-600 rounded-full" />
                    Còn hàng ({product.stock})
                  </span>
                ) : (
                  <span className="text-sm text-destructive font-medium">Hết hàng</span>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                aria-label={wishlistActive ? 'Bỏ khỏi yêu thích' : 'Thêm vào yêu thích'}
                onClick={() => {
                  toggleWishlist({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.images[0] ?? '',
                    stock: product.stock,
                  });
                  toast.success(wishlistActive ? 'Đã bỏ khỏi wishlist' : 'Đã thêm vào wishlist');
                }}
                className={`p-3 rounded-xl border transition-colors ${
                  wishlistActive
                    ? 'bg-primary text-primary-foreground border-primary/30'
                    : 'bg-card hover:bg-muted border-border'
                }`}
              >
                <Heart className={wishlistActive ? 'h-5 w-5 fill-current' : 'h-5 w-5'} />
              </button>

              <button
                type="button"
                aria-label={compareActive ? 'Bỏ khỏi so sánh' : 'Thêm vào so sánh'}
                onClick={() => {
                  const result = toggleCompare({
                    id: product.id,
                    slug: product.slug,
                    name: product.name,
                    price: product.price,
                    image: product.images[0] ?? '',
                    specs: product.specs,
                  });
                  if (result.reason === 'max') {
                    toast.error('Bạn chỉ có thể so sánh tối đa 4 sản phẩm');
                    return;
                  }
                  toast.success(result.added ? 'Đã thêm vào so sánh' : 'Đã bỏ khỏi so sánh');
                }}
                className={`p-3 rounded-xl border transition-colors ${
                  compareActive
                    ? 'bg-accent text-accent-foreground border-accent/30'
                    : 'bg-card hover:bg-muted border-border'
                }`}
              >
                <Scale className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Price */}
          <div className="bg-muted/30 border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-2 flex-wrap">
              <span className="text-4xl font-bold text-destructive">
                {formatVnd(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {formatVnd(product.oldPrice)}
                </span>
              )}
            </div>
            {discountPercent > 0 && (
              <div className="inline-block bg-destructive text-destructive-foreground text-sm px-3 py-1 rounded-full font-bold">
                Tiết kiệm {discountPercent}%
              </div>
            )}
          </div>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Bảo hành 12 tháng</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Giao nhanh toàn quốc</span>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Số lượng</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors"
                  aria-label="Giảm số lượng"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const next = Math.max(1, Number.parseInt(e.target.value || '1', 10) || 1);
                    setQuantity(inStock ? Math.min(next, product.stock) : 1);
                  }}
                  className="w-16 text-center bg-transparent border-x border-border focus:outline-none"
                  min={1}
                  max={Math.max(1, product.stock)}
                />
                <button
                  type="button"
                  onClick={() => setQuantity((q) => (inStock ? Math.min(product.stock, q + 1) : q))}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors"
                  aria-label="Tăng số lượng"
                  disabled={!inStock || quantity >= product.stock}
                >
                  +
                </button>
              </div>
              {!inStock && (
                <span className="text-sm text-destructive">Sản phẩm hiện hết hàng</span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                if (!inStock) return;
                addItem({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.images[0] ?? '',
                  stock: product.stock,
                  quantity,
                });
                toast.success('Đã thêm vào giỏ hàng', {
                  action: { label: 'Xem giỏ', onClick: () => (window.location.href = '/cart') },
                });
              }}
              disabled={!inStock}
              className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-4 rounded-lg font-bold hover:bg-accent/90 transition-all active:scale-95 disabled:opacity-50"
            >
              <ShoppingCart className="h-5 w-5" />
              Thêm vào giỏ
            </button>
            <button
              type="button"
              onClick={() => {
                if (!inStock) return;
                addItem({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.images[0] ?? '',
                  stock: product.stock,
                  quantity,
                });
                window.location.href = '/checkout';
              }}
              disabled={!inStock}
              className="bg-primary text-primary-foreground px-6 py-4 rounded-lg font-bold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <section className="bg-card border border-border rounded-xl overflow-hidden mb-12">
        <div className="flex border-b border-border" role="tablist" aria-label="Thông tin sản phẩm">
          <button
            type="button"
            onClick={() => setActiveTab('description')}
            role="tab"
            aria-selected={activeTab === 'description'}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'description'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Mô tả
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('specs')}
            role="tab"
            aria-selected={activeTab === 'specs'}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'specs'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Thông số
          </button>
        </div>

        <div className="p-6">
          {activeTab === 'description' && (
            <div className="prose prose-sm max-w-none text-foreground">
              <p>{product.description ?? 'Đang cập nhật mô tả chi tiết.'}</p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {Object.entries(product.specs ?? {}).map(([label, value], index) => (
                    <tr key={label} className={index % 2 === 0 ? 'bg-muted/30' : 'bg-transparent'}>
                      <td className="px-4 py-3 font-medium text-foreground border border-border w-1/3">
                        {label}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground border border-border font-mono text-sm">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-foreground mb-6">Sản phẩm liên quan</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {related.map((p) => (
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
        </section>
      )}

      {/* Recently viewed */}
      {recentlyViewed.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Đã xem gần đây</h2>
            <Link href="/" className="text-sm text-primary hover:underline">
              Tiếp tục mua sắm
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recentlyViewed.map((p) => (
              <Link
                key={p.id}
                href={`/san-pham/${p.slug}`}
                className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
              >
                <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                  <Image src={p.image} alt={p.name} fill className="object-contain p-3" />
                </div>
                <div className="text-sm font-medium text-foreground line-clamp-2 mb-1">
                  {p.name}
                </div>
                <div className="text-sm font-bold text-primary">{formatVnd(p.price)}</div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
