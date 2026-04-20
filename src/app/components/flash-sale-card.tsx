'use client';

import { memo, useCallback, useState } from 'react';
import { ShoppingCart, Star, Zap, BadgePercent } from 'lucide-react';
import { toast } from 'sonner';
import { useCartStore } from '../../store/cartStore';
import { useReviewStore } from '../../store/reviewStore';

interface FlashSaleCardProps {
  id: string;
  name: string;
  price: number;
  originalPrice: number; // required for flash sale
  image: string;
  discountPct: number;
  inStock: boolean;
  maxStock?: number;
  stockLeft?: number; // số lượng còn lại để hiện progress bar
}

/** Mini star row — đọc từ reviewStore */
function MiniStars({ productId }: { productId: string }) {
  const getProductSummary = useReviewStore((s) => s.getProductSummary);
  const summary = getProductSummary(productId);
  if (!summary.showRating || summary.totalReviews === 0) return null;

  const full = Math.floor(summary.averageRating);
  const hasHalf = summary.averageRating - full >= 0.3;

  return (
    <div className="flex items-center gap-1 mt-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-3 w-3 flex-shrink-0 ${
              i <= full
                ? 'fill-yellow-400 text-yellow-400'
                : i === full + 1 && hasHalf
                ? 'fill-yellow-200 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
        ))}
      </div>
      <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">{summary.averageRating.toFixed(1)}</span>
      <span className="text-[11px] text-gray-400">({summary.totalReviews})</span>
    </div>
  );
}

/** Component hiển thị 2 Review mới nhất */
function CardReviews({ productId }: { productId: string }) {
  const getProductReviews = useReviewStore((s) => s.getProductReviews);
  const reviews = getProductReviews(productId).slice(0, 2);

  if (reviews.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-dashed border-gray-200 dark:border-zinc-700 flex flex-col gap-3">
      <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
        <span>💬 ĐÁNH GIÁ KHÁCH HÀNG</span>
      </div>
      {reviews.map((rv) => (
        <div key={rv.id} className="flex gap-2">
          {/* Avatar box */}
          <div className="w-6 h-6 rounded-full flex-shrink-0 bg-orange-500 text-white flex items-center justify-center font-bold text-[10px] uppercase">
            {rv.userName.substring(0, 2)}
          </div>
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-gray-800 dark:text-gray-200 truncate max-w-[90px]">
                {rv.userName}
              </span>
              <div className="flex gap-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star
                    key={i}
                    className={`h-2.5 w-2.5 flex-shrink-0 ${i <= rv.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-snug line-clamp-2 mt-0.5" title={rv.comment}>
              {rv.comment}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export const FlashSaleCard = memo(function FlashSaleCard({
  id,
  name,
  price,
  originalPrice,
  image,
  discountPct,
  inStock,
  maxStock = 50,
  stockLeft,
}: FlashSaleCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);

  const stockPct = stockLeft != null && maxStock > 0
    ? Math.max(5, Math.min(100, Math.round((stockLeft / maxStock) * 100)))
    : null;

  const handleAddToCart = useCallback(
    async (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!inStock || isAdding) return;
      setIsAdding(true);
      await new Promise((r) => setTimeout(r, 150));
      addItem({ id, name, price, image, maxStock, inStock });
      toast.success('Đã thêm vào giỏ hàng!', {
        description: name,
        action: { label: 'Xem giỏ', onClick: () => (window.location.href = '/cart') },
      });
      setIsAdding(false);
    },
    [id, name, price, image, maxStock, inStock, addItem, isAdding]
  );

  return (
    <a
      href={`/product/${id}`}
      className="group relative flex flex-col bg-white dark:bg-zinc-900 rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 transition-all duration-300 hover:shadow-xl"
      style={{ minWidth: 260, maxWidth: 280 }}
    >
      {/* Container wrapper for white padding like the image */}
      <div className="p-3 pb-4 flex flex-col h-full">
        {/* Top Image Section (Grey background in image) */}
        <div className="relative bg-[#f5f5f5] dark:bg-zinc-800 aspect-[4/3] rounded-lg p-2 flex items-center justify-center overflow-hidden mb-3">
          {/* Discount Badge Pill */}
          <div className="absolute top-2 left-2 z-10">
            <div className="flex items-center gap-0.5 bg-[#f52b57] text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
              <Zap className="h-3 w-3 fill-white" />
              -{discountPct}%
            </div>
          </div>

          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 mix-blend-multiply dark:mix-blend-normal"
            loading="lazy"
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <span className="bg-white/90 text-gray-800 font-bold text-sm px-3 py-1 rounded-full">Hết hàng</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col flex-1 gap-1.5">
          {/* Name */}
          <h3 className="text-[13px] font-semibold text-gray-800 dark:text-gray-100 line-clamp-2 leading-tight group-hover:text-orange-600 transition-colors h-[34px]">
            {name}
          </h3>

          {/* Stars */}
          <MiniStars productId={id} />

          {/* Price */}
          <div className="flex items-end gap-2 mt-1">
            <span className="text-xl font-bold text-[#f55100] dark:text-orange-500 tabular-nums leading-none">
              {price.toLocaleString('vi-VN')}₫
            </span>
            <span className="text-[12px] text-gray-400 line-through tabular-nums leading-none mb-[2px]">
              {originalPrice.toLocaleString('vi-VN')}₫
            </span>
          </div>

          {/* Stock progress bar */}
          {stockPct != null && (
            <div className="mt-2.5">
              <div className="flex justify-between items-center text-[10px] mb-1 text-gray-500 font-medium">
                <span className="flex items-center gap-1 text-[#f55100]">
                  🔥 Đang bán chạy
                </span>
                <span>Còn {stockLeft}</span>
              </div>
              <div className="h-[4px] bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r from-[#fc8f37] to-[#f52b57] rounded-full transition-all duration-700`}
                  style={{ width: `${100 - stockPct}%` }}
                />
              </div>
            </div>
          )}

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!inStock || isAdding}
            className={`mt-3 w-full py-2 rounded-lg flex items-center justify-center gap-2 text-sm font-bold transition-all active:scale-95 ${
              inStock && !isAdding
                ? 'bg-[#fb7900] hover:bg-[#ea6200] text-white'
                : 'bg-gray-100 dark:bg-zinc-800 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ShoppingCart className={`h-4 w-4 ${isAdding ? 'animate-pulse' : ''}`} />
            {isAdding ? 'Đang thêm...' : inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
          </button>

          {/* Customer Reviews Fragment */}
          <CardReviews productId={id} />
        </div>
      </div>
    </a>
  );
});
