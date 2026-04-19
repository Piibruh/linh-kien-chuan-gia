'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2, TicketPercent } from 'lucide-react';
import { toast } from 'sonner';

import { useCartStore } from '../../store/cartStore';
import { computePricing } from '../../features/cart/lib/pricing';
import { formatVnd } from '../../shared/lib/money';

const FREE_SHIPPING_THRESHOLD = 500_000;
const BASE_SHIPPING_FEE = 30_000;

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const clearCart = useCartStore((s) => s.clearCart);

  const [coupon, setCoupon] = useState('');

  const pricing = useMemo(
    () =>
      computePricing({
        items,
        coupon,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        baseShippingFee: BASE_SHIPPING_FEE,
      }),
    [items, coupon]
  );

  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - pricing.subtotal);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/"
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          Tiếp tục mua hàng
        </Link>
      </div>

      <div className="flex items-start justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <ShoppingBag className="h-8 w-8" />
          Giỏ hàng
          <span className="text-xl text-muted-foreground">({items.length})</span>
        </h1>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearCart();
              toast.success('Đã xóa giỏ hàng');
            }}
            className="bg-muted text-foreground px-4 py-2 rounded-lg font-bold hover:bg-muted/80"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Giỏ hàng trống</h2>
          <p className="text-muted-foreground mb-6">Hãy thêm sản phẩm để tiếp tục.</p>
          <Link
            href="/category/all"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 space-y-4">
            {remainingForFreeShip > 0 ? (
              <div className="bg-muted/40 border border-border rounded-xl p-4 text-sm text-foreground">
                Mua thêm{' '}
                <span className="font-bold text-primary">{formatVnd(remainingForFreeShip)}</span>{' '}
                để được miễn phí vận chuyển.
              </div>
            ) : (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm text-green-800">
                Bạn đã được <span className="font-bold">miễn phí vận chuyển</span>.
              </div>
            )}

            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="divide-y divide-border">
                {items.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      <div className="md:col-span-6 flex items-center gap-4">
                        <Link
                          href={`/san-pham/${item.slug}`}
                          className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden flex-shrink-0"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-contain p-2"
                            sizes="80px"
                          />
                        </Link>
                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/san-pham/${item.slug}`}
                            className="font-medium text-foreground mb-1 line-clamp-2 hover:text-primary"
                          >
                            {item.name}
                          </Link>
                          <div className="text-xs text-muted-foreground">Tồn kho: {item.stock}</div>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <div className="flex md:justify-center items-center gap-2">
                          <span className="md:hidden text-sm text-muted-foreground">Giá:</span>
                          <span className="font-medium text-foreground">
                            {formatVnd(item.price)}
                          </span>
                        </div>
                      </div>

                      <div className="md:col-span-3">
                        <div className="flex md:justify-center items-center gap-2">
                          <span className="md:hidden text-sm text-muted-foreground">Số lượng:</span>
                          <div className="flex items-center border border-border rounded-lg overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-2 hover:bg-muted transition-colors"
                              aria-label="Giảm số lượng"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, Number(e.target.value) || 1)}
                              className="w-14 text-center bg-transparent focus:outline-none"
                              min={1}
                              max={Math.max(1, item.stock)}
                            />
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-2 hover:bg-muted transition-colors"
                              aria-label="Tăng số lượng"
                              disabled={item.quantity >= item.stock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div className="md:col-span-1 flex md:justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            removeItem(item.id);
                            toast.success('Đã xóa sản phẩm khỏi giỏ');
                          }}
                          className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                          aria-label="Xóa sản phẩm"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="md:col-span-12 flex justify-between md:justify-end">
                        <div className="md:hidden text-sm text-muted-foreground">Tạm tính:</div>
                        <div className="font-bold text-primary">
                          {formatVnd(item.price * item.quantity)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
              <h2 className="text-xl font-bold text-foreground mb-6">Tóm tắt đơn hàng</h2>

              <div className="mb-5">
                <label className="block text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <TicketPercent className="h-4 w-4" />
                  Mã giảm giá
                </label>
                <div className="flex gap-2">
                  <input
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="SAVE10 / FREESHIP"
                    className="flex-1 px-3 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="button"
                    className="px-4 py-3 bg-muted text-foreground rounded-lg font-bold hover:bg-muted/80"
                    onClick={() => {
                      if (!coupon.trim()) {
                        toast.message('Nhập mã giảm giá để áp dụng');
                        return;
                      }
                      toast.message(pricing.couponMessage ?? 'Đã áp dụng');
                    }}
                  >
                    Áp dụng
                  </button>
                </div>
                {pricing.couponMessage && (
                  <div className="text-xs text-muted-foreground mt-2">{pricing.couponMessage}</div>
                )}
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-foreground">
                  <span>Tạm tính:</span>
                  <span className="font-medium">{formatVnd(pricing.subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span>Giảm giá:</span>
                  <span className="font-medium text-green-700">-{formatVnd(pricing.discount)}</span>
                </div>
                <div className="flex items-center justify-between text-foreground">
                  <span>Vận chuyển:</span>
                  <span className="font-medium">
                    {pricing.shippingFee === 0 ? (
                      <span className="text-green-700">Miễn phí</span>
                    ) : (
                      formatVnd(pricing.shippingFee)
                    )}
                  </span>
                </div>
                <div className="border-t border-border pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">Tổng cộng:</span>
                    <span className="text-2xl font-bold text-primary">{formatVnd(pricing.total)}</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-primary text-primary-foreground text-center px-6 py-4 rounded-lg font-bold hover:bg-primary/90 transition-all active:scale-95 mb-3"
              >
                Tiến hành thanh toán
              </Link>

              <Link
                href="/category/all"
                className="block w-full bg-muted text-foreground text-center px-6 py-3 rounded-lg font-medium hover:bg-muted/80 transition-colors"
              >
                Tiếp tục mua sắm
              </Link>

              <p className="text-xs text-muted-foreground mt-4">
                Gợi ý: dùng SAVE10 (giảm 10%) hoặc FREESHIP (miễn ship).
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mobile sticky bar */}
      {items.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 lg:hidden">
          <div className="container mx-auto px-4 flex items-center justify-between gap-3">
            <div>
              <div className="text-xs text-muted-foreground">Tổng cộng</div>
              <div className="text-lg font-bold text-primary">{formatVnd(pricing.total)}</div>
            </div>
            <Link
              href="/checkout"
              className="bg-primary text-primary-foreground px-5 py-3 rounded-lg font-bold"
            >
              Thanh toán
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
