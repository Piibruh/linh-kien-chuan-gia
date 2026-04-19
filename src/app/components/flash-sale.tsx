import { Zap, ChevronLeft, ChevronRight, Flame, Clock, ShoppingCart, Star, User, Quote } from 'lucide-react';
import { useMemo, useState, useEffect, useCallback, memo } from 'react';
import { useHorizontalScroll } from './hooks/useHorizontalScroll';
import { useCartStore } from '../../store/cartStore';
import { toast } from 'sonner';

// ── Types ──────────────────────────────────────────────────
interface FlashProduct {
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

interface FlashSaleProps {
  products: FlashProduct[];
  durationHours?: number;
}

// ── Deterministic rating seed (4.0 – 5.0) ─────────────────
function getStableRating(id: string, baseRating: number): number {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const jitter = (hash % 21) / 100; // 0.00 – 0.20
  const rating = baseRating + jitter;
  return Math.min(5, Math.max(4, parseFloat(rating.toFixed(1))));
}

// ── Deterministic user reviews ─────────────────────────────
const REVIEW_POOL = [
  { user: 'Nguyễn Minh Tuấn', avatar: 'NMT', comment: 'Sản phẩm chất lượng tốt, giao hàng nhanh. Rất hài lòng!', stars: 5 },
  { user: 'Trần Thị Lan', avatar: 'TTL', comment: 'Linh kiện chuẩn, hoạt động ổn định. Sẽ mua thêm.', stars: 5 },
  { user: 'Lê Văn Hùng', avatar: 'LVH', comment: 'Giá tốt, đúng mô tả. Giao hàng có hơi chậm nhưng chấp nhận được.', stars: 4 },
  { user: 'Phạm Thu Hà', avatar: 'PTH', comment: 'Mạch hoạt động tốt, lắp vào dự án ngay. Uy tín!', stars: 5 },
  { user: 'Hoàng Đức Nam', avatar: 'HĐN', comment: 'Chính hãng, tem mác đầy đủ. Đóng gói cẩn thận.', stars: 4 },
  { user: 'Vũ Thị Mai', avatar: 'VTM', comment: 'Mua lần thứ 3 rồi, lần nào cũng ổn. Shop uy tín!', stars: 5 },
  { user: 'Đặng Quốc Bảo', avatar: 'ĐQB', comment: 'Code ngon, tài liệu đầy đủ, hỗ trợ nhiệt tình.', stars: 5 },
  { user: 'Bùi Thị Ngọc', avatar: 'BTN', comment: 'Giá hợp lý, sản phẩm tốt, sẽ giới thiệu cho bạn bè.', stars: 4 },
];

function getReviewsForProduct(id: string): typeof REVIEW_POOL {
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const start = hash % REVIEW_POOL.length;
  return [
    REVIEW_POOL[start % REVIEW_POOL.length],
    REVIEW_POOL[(start + 1) % REVIEW_POOL.length],
  ];
}

// ── Filled star display ────────────────────────────────────
function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'xs' | 'sm' }) {
  const clampedRating = Math.min(5, Math.max(0, Number(rating) || 0));
  const full = Math.floor(clampedRating);
  const hasHalf = clampedRating - full >= 0.3 && clampedRating - full < 0.8;
  const emptyCount = Math.max(0, 5 - full - (hasHalf ? 1 : 0));
  const sizeClass = size === 'xs' ? 'h-3 w-3' : 'h-3.5 w-3.5';
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: full }).map((_, i) => (
        <Star key={`f${i}`} className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
      ))}
      {hasHalf && (
        <span
          className="relative inline-block"
          style={{ width: size === 'xs' ? 12 : 14, height: size === 'xs' ? 12 : 14 }}
        >
          <Star className={`${sizeClass} text-white/30 absolute top-0 left-0`} />
          <span className="absolute top-0 left-0 overflow-hidden" style={{ width: '60%' }}>
            <Star className={`${sizeClass} fill-yellow-400 text-yellow-400`} />
          </span>
        </span>
      )}
      {Array.from({ length: emptyCount }).map((_, i) => (
        <Star key={`e${i}`} className={`${sizeClass} fill-white/20 text-white/30`} />
      ))}
    </div>
  );
}

// ── Countdown ─────────────────────────────────────────────
function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="bg-gray-900/90 backdrop-blur text-white font-mono text-xl sm:text-2xl font-black w-12 sm:w-14 h-12 sm:h-14 rounded-xl flex items-center justify-center shadow-lg border border-yellow-400/40 tabular-nums">
          {String(value).padStart(2, '0')}
        </div>
        <div className="absolute left-0 right-0 top-1/2 h-px bg-black/30 pointer-events-none" />
      </div>
      <span className="text-[10px] text-yellow-300 font-semibold uppercase tracking-widest mt-1">{label}</span>
    </div>
  );
}

function FlashCountdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const calc = () => {
      const diff = Math.max(targetDate.getTime() - Date.now(), 0);
      setTimeLeft({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    calc();
    const id = setInterval(calc, 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1.5">
      <CountdownUnit value={timeLeft.h} label="Giờ" />
      <span className="text-yellow-300 font-black text-2xl mb-4 animate-pulse select-none">:</span>
      <CountdownUnit value={timeLeft.m} label="Phút" />
      <span className="text-yellow-300 font-black text-2xl mb-4 animate-pulse select-none">:</span>
      <CountdownUnit value={timeLeft.s} label="Giây" />
    </div>
  );
}

// ── Flash Product Card (self-contained) ─────────────────────
const FlashCard = memo(function FlashCard({ product }: { product: FlashProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const stableRating = getStableRating(product.id, product.rating);
  const userReviews = getReviewsForProduct(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Stock bar (visual urgency)
  const stockPercent = product.maxStock ? Math.min(100, Math.max(10, Math.round((product.maxStock * 0.3 / product.maxStock) * 100))) : 30;

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!product.inStock || isAdding) return;
      setIsAdding(true);
      await new Promise((r) => setTimeout(r, 150));
      addItem({ id: product.id, name: product.name, price: product.price, image: product.image, maxStock: product.maxStock ?? 50, inStock: product.inStock });
      toast.success('Đã thêm vào giỏ hàng!', {
        description: product.name,
        action: { label: 'Xem giỏ', onClick: () => (window.location.href = '/cart') },
      });
      setIsAdding(false);
    },
    [product, isAdding, addItem]
  );

  return (
    <div className="flex-shrink-0 w-[268px] sm:w-[296px] flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-2xl ring-1 ring-white/20 hover:ring-yellow-300/60 transition-all duration-300 hover:-translate-y-1.5 group/card">
      {/* ── Image area ── */}
      <a href={`/product/${product.id}`} className="block relative aspect-[4/3] bg-gray-50 dark:bg-gray-800 overflow-hidden">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-contain p-3 group-hover/card:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Discount badge – top-left */}
        {discount > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 flex items-center gap-0.5 bg-gradient-to-r from-red-500 to-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-lg">
            <Zap className="h-3 w-3 fill-white" />
            -{discount}%
          </div>
        )}

        {/* Out of stock overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-black/55 flex items-center justify-center">
            <span className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">Hết hàng</span>
          </div>
        )}
      </a>

      {/* ── Content ── */}
      <div className="flex flex-col flex-1 p-4 gap-3">
        {/* Name */}
        <a href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 leading-snug group-hover/card:text-orange-500 transition-colors">
            {product.name}
          </h3>
        </a>

        {/* Rating row */}
        <div className="flex items-center gap-2">
          <StarRating rating={stableRating} />
          <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{stableRating.toFixed(1)}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">({product.reviews?.toLocaleString('vi-VN') ?? 0})</span>
        </div>

        {/* Specs */}
        {product.specs && product.specs.length > 0 && (
          <ul className="text-[11px] text-gray-500 dark:text-gray-400 font-mono space-y-0.5">
            {product.specs.slice(0, 2).map((s, i) => (
              <li key={i} className="truncate">• {s}</li>
            ))}
          </ul>
        )}

        {/* Price block */}
        <div className="flex items-end gap-2">
          <span className="text-xl font-black text-orange-500">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
          {product.originalPrice && (
            <span className="text-sm text-gray-400 line-through mb-0.5">
              {product.originalPrice.toLocaleString('vi-VN')}₫
            </span>
          )}
        </div>

        {/* Stock urgency bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[10px] text-gray-500 dark:text-gray-400">
            <span className="text-orange-500 font-semibold">🔥 Đang bán chạy</span>
            <span>Còn {product.maxStock ?? '?'}</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all"
              style={{ width: `${100 - stockPercent}%` }}
            />
          </div>
        </div>

        {/* Add to cart */}
        <button
          onClick={handleAddToCart}
          disabled={!product.inStock || isAdding}
          className={`mt-auto w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95 ${
            product.inStock && !isAdding
              ? 'bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-orange-500/40'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
        >
          <ShoppingCart className={`h-4 w-4 ${isAdding ? 'animate-bounce' : ''}`} />
          {isAdding ? 'Đang thêm...' : product.inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
        </button>
      </div>

      {/* ── User Reviews strip ── */}
      <div className="border-t border-gray-100 dark:border-gray-800 bg-gray-50/80 dark:bg-gray-800/60 px-4 pt-3 pb-4 space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
          <Quote className="h-3 w-3" />
          Đánh giá khách hàng
        </div>
        {userReviews.map((rev, idx) => (
          <div key={idx} className="flex gap-2 items-start">
            {/* Avatar */}
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white text-[9px] font-black shadow">
              {rev.avatar.slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 truncate">{rev.user}</span>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: Math.min(5, Math.max(0, rev.stars)) }).map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 fill-yellow-400 text-yellow-400" />
                  ))}
                  {Array.from({ length: Math.max(0, 5 - rev.stars) }).map((_, i) => (
                    <Star key={i} className="h-2.5 w-2.5 fill-gray-300 text-gray-300" />
                  ))}
                </div>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2">{rev.comment}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

// ── Main FlashSale component ────────────────────────────────
export function FlashSale({ products, durationHours = 6 }: FlashSaleProps) {
  const { scrollContainerRef, canScrollLeft, canScrollRight, scroll } = useHorizontalScroll();
  const displayProducts = products.filter((p) => p.inStock).length > 0
    ? products.filter((p) => p.inStock)
    : products;

  const endDate = useMemo(() => {
    const KEY = 'electro-flash-sale-end';
    const DURATION = durationHours * 3_600_000;
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) {
        const t = parseInt(saved, 10);
        if (!isNaN(t) && t > Date.now()) return new Date(t);
      }
      const end = Date.now() + DURATION;
      localStorage.setItem(KEY, String(end));
      return new Date(end);
    } catch {
      return new Date(Date.now() + DURATION);
    }
  }, [durationHours]);

  return (
    <section className="relative my-12 overflow-hidden">
      {/* ── Background ── */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-rose-700 dark:from-orange-900 dark:via-red-900 dark:to-rose-950" />
      {/* Decorative glows */}
      <div
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 15% 50%, #fff8 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, #fbbf24aa 0%, transparent 55%)',
        }}
      />
      {/* Subtle dot pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '24px 24px' }}
      />

      <div className="relative container mx-auto px-4 py-10">
        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          {/* Title section */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-xl">
                <Flame className="h-8 w-8 text-orange-700 fill-orange-600" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping opacity-60" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                  FLASH SALE
                </h2>
                <Zap className="h-7 w-7 text-yellow-300 fill-yellow-300 animate-bounce" />
              </div>
              <p className="text-orange-100 text-sm font-medium mt-0.5 flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                Giảm giá sốc — Số lượng có hạn!
              </p>
            </div>
          </div>

          {/* Countdown */}
          <div className="flex flex-col items-start sm:items-end gap-1.5">
            <div className="flex items-center gap-1.5 text-orange-100 text-xs font-semibold uppercase tracking-wider">
              <Clock className="h-3.5 w-3.5" />
              Kết thúc trong
            </div>
            <FlashCountdown targetDate={endDate} />
          </div>
        </div>

        {/* ── Product Cards ── */}
        {displayProducts.length === 0 ? (
          <div className="rounded-2xl bg-white/10 backdrop-blur-sm p-12 text-center border border-white/20">
            <p className="text-2xl font-bold text-white mb-2">Flash Sale đã cháy hàng! 🔥</p>
            <p className="text-orange-200 text-sm">Các ưu đãi siêu hot đã được săn hết. Ghé lại sau nhé!</p>
          </div>
        ) : (
          <div className="relative group/scroll">
            {/* Left arrow */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="Cuộn trái"
              className={`absolute left-0 top-[45%] -translate-y-1/2 -translate-x-3 z-20 w-10 h-10 bg-white/95 text-orange-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 opacity-0 group-hover/scroll:opacity-100 hover:scale-110 ${
                !canScrollLeft ? 'pointer-events-none !opacity-0' : ''
              }`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Scroll container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-3"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayProducts.map((product) => (
                <FlashCard key={product.id} product={product} />
              ))}
            </div>

            {/* Right arrow */}
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="Cuộn phải"
              className={`absolute right-0 top-[45%] -translate-y-1/2 translate-x-3 z-20 w-10 h-10 bg-white/95 text-orange-600 rounded-full shadow-2xl flex items-center justify-center transition-all duration-200 opacity-0 group-hover/scroll:opacity-100 hover:scale-110 ${
                !canScrollRight ? 'pointer-events-none !opacity-0' : ''
              }`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* ── Footer indicator ── */}
        {displayProducts.length > 0 && (
          <div className="flex items-center justify-between mt-6 px-1">
            <span className="text-orange-200 text-sm flex items-center gap-1.5">
              🔥 <strong className="text-white">{displayProducts.length}</strong> sản phẩm đang giảm giá
            </span>
            <a
              href="/products"
              className="text-yellow-300 text-sm font-semibold hover:text-white transition-colors flex items-center gap-1"
            >
              Xem tất cả →
            </a>
          </div>
        )}
      </div>
    </section>
  );
}