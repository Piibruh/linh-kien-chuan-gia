/**
 * flash-sale.tsx
 * Component Flash Sale — luôn hiển thị 5 sản phẩm, giảm 5-25%
 * Thiết kế theo phong cách An Phát / Hacom / Hoàng Hà
 */
import { ChevronLeft, ChevronRight, Flame, Zap, Clock, TrendingDown } from 'lucide-react';
import { useMemo, useState, useEffect } from 'react';
import { FlashSaleCard } from './flash-sale-card';
import { useHorizontalScroll } from './hooks/useHorizontalScroll';

// ── Types ──────────────────────────────────────────────────────────────────────

export interface FlashSaleProduct {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  inStock: boolean;
  discountPct: number;
  maxStock: number;
  stockLeft?: number;
}

interface FlashSaleProps {
  products: FlashSaleProduct[];
  durationHours?: number;
}

// ── Countdown ─────────────────────────────────────────────────────────────────

function CountdownUnit({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="bg-[#1c1c1c] text-white w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center text-xl sm:text-2xl font-black shadow-inner">
        {value}
      </div>
      <span className="text-[10px] sm:text-xs font-bold text-[#ffcd00] tracking-wider uppercase">
        {label}
      </span>
    </div>
  );
}

function FlashSaleCountdown({ targetDate }: { targetDate: Date }) {
  const [t, setT] = useState({ h: '00', m: '00', s: '00' });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const tick = () => {
      const diff = targetDate.getTime() - Date.now();
      if (diff <= 0) {
        setT({ h: '00', m: '00', s: '00' });
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setT({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      });
    };
    tick();
    const id = setInterval(tick, 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  const sep = (
    <span className="text-white/80 font-black text-xl sm:text-2xl mb-4 select-none self-start mt-2">
      :
    </span>
  );
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex items-center gap-1 text-white font-bold text-[11px] sm:text-xs">
        ⏱️ KẾT THÚC TRONG
      </div>
      <div className="flex items-start gap-1 sm:gap-2">
        <CountdownUnit value={t.h} label="Giờ" />
        {sep}
        <CountdownUnit value={t.m} label="Phút" />
        {sep}
        <CountdownUnit value={t.s} label="Giây" />
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export function FlashSale({ products, durationHours = 6 }: FlashSaleProps) {
  const { scrollContainerRef, canScrollLeft, canScrollRight, scroll } = useHorizontalScroll();

  const endDate = useMemo(() => {
    const KEY = 'electro-flash-sale-end';
    const MS = durationHours * 3_600_000;
    try {
      const saved = parseInt(localStorage.getItem(KEY) ?? '', 10);
      if (!isNaN(saved) && saved > Date.now()) return new Date(saved);
      const end = Date.now() + MS;
      localStorage.setItem(KEY, String(end));
      return new Date(end);
    } catch {
      return new Date(Date.now() + MS);
    }
  }, [durationHours]);

  const getProductMaxStock = (id: string, discount: number) => 50;

  // Luôn hiển thị TẤT CẢ sản phẩm: inStock trước, hết hàng sau (không tự biến mất)
  const display = useMemo(() => {
    const inStock = products.filter((p) => p.inStock);
    const outOfStock = products.filter((p) => !p.inStock);
    return [...inStock, ...outOfStock].slice(0, 8);
  }, [products]);

  if (display.length === 0) return null;

  return (
    <section className="relative my-8 sm:my-12 overflow-hidden mx-4 sm:mx-0">
      {/* ─── Solid red background with subtle pattern like the image ─── */}
      <div className="absolute inset-0 bg-[#df1a1a]" />
      
      {/* Tiny dot pattern overlay to simulate the grid texture */}
      <div
        className="absolute inset-0 opacity-10 mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#000 1px, transparent 1px)',
          backgroundSize: '12px 12px',
        }}
      />
      
      <div className="relative container mx-auto px-4 py-8">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 relative z-10">
          
          {/* Left: Title + badges */}
          <div className="flex items-center gap-3">
            {/* The flame box icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#ffcd00] to-[#f87800] flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-xl">🔥</span>
            </div>
            
            <div className="flex flex-col justify-center">
              <h2 className="text-3xl sm:text-[34px] font-black text-white italic tracking-tight leading-none drop-shadow-md flex items-center gap-2">
                FLASH SALE ⚡
              </h2>
              <div className="flex items-center gap-1.5 mt-1 sm:mt-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <p className="text-white text-xs sm:text-sm font-medium tracking-wide">
                  Giảm giá sốc — Số lượng có hạn!
                </p>
              </div>
            </div>
          </div>

          {/* Right: Countdown */}
          <FlashSaleCountdown targetDate={endDate} />
        </div>

        {/* ─── Products List (Horizontal Scroll) ─── */}
        <div className="group/nav relative -mx-4 sm:mx-0">
          {/* Arrows (Desktop only) */}
          {canScrollLeft && (
            <button
              onClick={() => scroll('left')}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/95 shadow-xl rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 hover:text-red-700 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/nav:opacity-100 hidden sm:flex border border-red-100"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-6 h-6 ml-[-2px]" />
            </button>
          )}
          {canScrollRight && (
            <button
              onClick={() => scroll('right')}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/95 shadow-xl rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 hover:text-red-700 hover:scale-110 active:scale-95 transition-all opacity-0 group-hover/nav:opacity-100 hidden sm:flex border border-red-100"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-6 h-6 mr-[-2px]" />
            </button>
          )}

          {/* Track */}
          <div
            ref={scrollContainerRef}
            className="flex gap-4 sm:gap-5 overflow-x-auto snap-x snap-mandatory px-4 sm:px-1 pb-6 pt-2 scrollbar-none"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {display.map((product) => {
              const maxStock = product.maxStock ?? 50;
              // Nếu hết hàng: stockLeft = 0, không fill random
              const stockLeft = product.inStock
                ? (product.stockLeft != null ? product.stockLeft : Math.max(1, Math.floor(maxStock * 0.3)))
                : 0;
              return (
                <div key={product.id} className="snap-start snap-always shrink-0 transform-gpu relative z-10">
                  <FlashSaleCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    originalPrice={product.originalPrice}
                    image={product.image}
                    discountPct={product.discountPct}
                    inStock={product.inStock}
                    maxStock={maxStock}
                    stockLeft={stockLeft}
                  />
                </div>
              );
            })}
            
            {/* View More Card for horizontal scroll */}
            <div className="snap-start snap-always shrink-0 flex items-center justify-center relative z-10 pb-6 pt-2">
              <a
                href="/products"
                className="group flex flex-col items-center justify-center bg-white/10 hover:bg-white/20 w-[140px] rounded-2xl border border-white/20 transition-all cursor-pointer backdrop-blur-sm shadow-xl"
                style={{ height: 'calc(100% - 24px)' }}
              >
                <div className="w-12 h-12 rounded-full bg-white text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 shadow-lg transition-transform">
                  <ChevronRight className="w-6 h-6 ml-[2px]" />
                </div>
                <span className="text-white font-bold text-sm">Xem tất cả</span>
              </a>
            </div>
          </div>
        </div>

        {/* Footer Area inside Red Section */}
        <div className="mt-2 flex items-center justify-between text-yellow-300 font-bold text-xs sm:text-sm px-1 relative z-10 w-full">
          <div className="flex items-center gap-1.5">
            <span>🔥</span>
            <span>{display.length} sản phẩm đang giảm giá</span>
          </div>
          <a href="/products" className="hover:text-white transition-colors cursor-pointer flex items-center gap-1">
            Xem tất cả <ChevronRight className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
}