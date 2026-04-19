'use client';

import Image from 'next/image';
import Link from 'next/link';
import { HeartOff, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useWishlistStore } from '../../features/wishlist/store/wishlistStore';
import { useCartStore } from '../../store/cartStore';
import { formatVnd } from '../../shared/lib/money';

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const clear = useWishlistStore((s) => s.clear);

  const addItem = useCartStore((s) => s.addItem);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Wishlist</h1>
          <p className="text-muted-foreground">Sản phẩm bạn đã lưu để xem lại.</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clear();
              toast.success('Đã xóa wishlist');
            }}
            className="bg-muted text-foreground px-4 py-2 rounded-lg font-bold hover:bg-muted/80"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <HeartOff className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Chưa có sản phẩm yêu thích</h2>
          <p className="text-muted-foreground mb-6">Hãy nhấn trái tim để lưu sản phẩm.</p>
          <Link
            href="/category/all"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-xl p-4">
              <Link href={`/san-pham/${p.slug}`} className="flex gap-4">
                <div className="relative w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                  <Image src={p.image} alt={p.name} fill className="object-contain p-2" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground line-clamp-2 mb-1">{p.name}</div>
                  <div className="text-primary font-bold">{formatVnd(p.price)}</div>
                </div>
              </Link>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-bold hover:bg-primary/90 flex items-center justify-center gap-2"
                  onClick={() => {
                    addItem({
                      id: p.id,
                      slug: p.slug,
                      name: p.name,
                      price: p.price,
                      image: p.image,
                      stock: Number.isFinite(p.stock) ? p.stock : 9999,
                      quantity: 1,
                    });
                    toast.success('Đã thêm vào giỏ hàng');
                  }}
                >
                  <ShoppingCart className="h-4 w-4" />
                  Thêm vào giỏ
                </button>

                <button
                  type="button"
                  aria-label="Xóa khỏi wishlist"
                  className="px-3 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80"
                  onClick={() => {
                    remove(p.id);
                    toast.success('Đã xóa khỏi wishlist');
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
