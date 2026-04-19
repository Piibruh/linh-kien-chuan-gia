import { Zap, ChevronLeft, ChevronRight, Flame, Clock } from 'lucide-react';
import { useMemo, useState, useEffect, useRef } from 'react';
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
  maxStock?: number;
}

interface FlashSaleProps {
  products: Product[];
  durationHours?: number;
}

function CountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <div className="bg-gray-900 dark:bg-black text-white font-mono text-xl sm:text-2xl font-black w-12 sm:w-14 h-12 sm:h-14 rounded-lg flex items-center justify-center shadow-lg border border-orange-500/30 tabular-nums">
          {String(value).padStart(2, '0')}
        </div>
        {/* Flip line */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-black/40 dark:bg-white/10 pointer-events-none" />
      </div>
      <span className="text-[10px] text-orange-300 font-semibold uppercase tracking-wider mt-1">{label}</span>
    </div>
  );
}

function FlashCountdown({ targetDate }: { targetDate: Date }) {
  const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const calc = () => {
      const diff = Math.max(targetDate.getTime() - Date.now(), 0);
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft({ h, m, s });
    };
    calc();
    const id = setInterval(calc, 1_000);
    return () => clearInterval(id);
  }, [targetDate]);

  return (
    <div className="flex items-center gap-1.5">
      <CountdownUnit value={timeLeft.h} label="Giờ" />
      <span className="text-orange-400 font-black text-xl mb-4 animate-pulse">:</span>
      <CountdownUnit value={timeLeft.m} label="Phút" />
      <span className="text-orange-400 font-black text-xl mb-4 animate-pulse">:</span>
      <CountdownUnit value={timeLeft.s} label="Giây" />
    </div>
  );
}

export function FlashSale({ products, durationHours = 6 }: FlashSaleProps) {
  const { scrollContainerRef, canScrollLeft, canScrollRight, scroll } = useHorizontalScroll();
  const availableProducts = products.filter((product) => product.inStock);

  const endDate = useMemo(() => {
    const FLASH_SALE_KEY = 'electro-flash-sale-end';
    const FLASH_SALE_DURATION_MS = durationHours * 60 * 60 * 1000;
    try {
      const saved = localStorage.getItem(FLASH_SALE_KEY);
      if (saved) {
        const savedTime = parseInt(saved, 10);
        if (!isNaN(savedTime) && savedTime > Date.now()) {
          return new Date(savedTime);
        }
      }
      const newEndTime = Date.now() + FLASH_SALE_DURATION_MS;
      localStorage.setItem(FLASH_SALE_KEY, String(newEndTime));
      return new Date(newEndTime);
    } catch {
      return new Date(Date.now() + FLASH_SALE_DURATION_MS);
    }
  }, [durationHours]);

  const displayProducts = availableProducts.length > 0 ? availableProducts : products;

  return (
    <section className="relative my-12 overflow-hidden">
      {/* Fire gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-600 via-red-600 to-rose-700 dark:from-orange-800 dark:via-red-900 dark:to-rose-950" />
      {/* Animated ember pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(ellipse at 20% 50%, #fff 0%, transparent 60%), radial-gradient(ellipse at 80% 30%, #fbbf24 0%, transparent 60%)`,
        }}
      />

      <div className="relative container mx-auto px-4 py-10">
        {/* ─── Header ─── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-8">
          {/* Left: Title */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center shadow-xl">
                <Flame className="h-8 w-8 text-orange-700 fill-orange-600" />
              </div>
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping opacity-70" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight drop-shadow-lg">
                  FLASH SALE
                </h2>
                <Zap className="h-7 w-7 text-yellow-300 fill-yellow-300 animate-bounce" />
              </div>
              <p className="text-orange-200 text-sm font-medium mt-0.5">
                ⚡ Giảm giá sốc — Số lượng có hạn!
              </p>
            </div>
          </div>

          {/* Right: Countdown */}
          <div className="flex flex-col items-start sm:items-end gap-2">
            <div className="flex items-center gap-2 text-orange-200 text-sm font-medium">
              <Clock className="h-4 w-4" />
              <span>Kết thúc trong:</span>
            </div>
            <FlashCountdown targetDate={endDate} />
          </div>
        </div>

        {/* ─── Products ─── */}
        {displayProducts.length === 0 ? (
          <div className="rounded-2xl bg-white/10 backdrop-blur p-10 text-center border border-white/20">
            <p className="text-2xl font-bold text-white mb-2">Flash Sale đã cháy hàng! 🔥</p>
            <p className="text-orange-200 text-sm">Các ưu đãi siêu hot đã được săn hết. Ghé lại sau nhé!</p>
          </div>
        ) : (
          <div className="relative group">
            {/* Left Arrow */}
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 w-11 h-11 bg-white text-orange-600 rounded-full shadow-2xl border-2 border-orange-200 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-orange-50 ${
                !canScrollLeft ? 'cursor-not-allowed opacity-0! group-hover:opacity-30' : ''
              }`}
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            {/* Scroll container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-2"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex-shrink-0 w-[250px] sm:w-[280px] rounded-2xl overflow-hidden shadow-xl ring-2 ring-white/20 hover:ring-yellow-300/70 transition-all duration-300 hover:-translate-y-1"
                >
                  {/* Flash badge ribbon */}
                  {product.badge && (
                    <div className="relative">
                      <div className="absolute top-2 left-2 z-10 bg-yellow-400 text-orange-800 text-xs font-black px-2 py-1 rounded-lg shadow flex items-center gap-1">
                        <Zap className="h-3 w-3 fill-current" />
                        {product.badge}
                      </div>
                    </div>
                  )}
                  <ProductCard {...product} />
                </div>
              ))}
            </div>

            {/* Right Arrow */}
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 w-11 h-11 bg-white text-orange-600 rounded-full shadow-2xl border-2 border-orange-200 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 hover:scale-110 hover:bg-orange-50 ${
                !canScrollRight ? 'cursor-not-allowed opacity-0! group-hover:opacity-30' : ''
              }`}
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Products count indicator */}
        {displayProducts.length > 0 && (
          <div className="flex items-center justify-center mt-6 gap-2">
            <span className="text-orange-200 text-sm">
              🔥 {displayProducts.length} sản phẩm đang giảm giá
            </span>
          </div>
        )}
      </div>
    </section>
  );
}