'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Clock, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useRecentlyViewedStore } from '../../features/recently-viewed/store/recentlyViewedStore';
import { formatVnd } from '../../shared/lib/money';

export default function RecentlyViewedPage() {
  const items = useRecentlyViewedStore((s) => s.items);
  const clear = useRecentlyViewedStore((s) => s.clear);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Đã xem gần đây</h1>
          <p className="text-muted-foreground">Danh sách sản phẩm bạn đã xem.</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clear();
              toast.success('Đã xóa lịch sử đã xem');
            }}
            className="bg-muted text-foreground px-4 py-2 rounded-lg font-bold hover:bg-muted/80 flex items-center gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Xóa
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Clock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Chưa có sản phẩm nào</h2>
          <p className="text-muted-foreground mb-6">Hãy xem một vài sản phẩm để bắt đầu.</p>
          <Link
            href="/category/all"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((p) => (
            <Link
              key={p.id}
              href={`/san-pham/${p.slug}`}
              className="bg-card border border-border rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-square bg-muted rounded-lg overflow-hidden mb-3">
                <Image src={p.image} alt={p.name} fill className="object-contain p-3" />
              </div>
              <div className="text-sm font-medium text-foreground line-clamp-2 mb-1">{p.name}</div>
              <div className="text-sm font-bold text-primary">{formatVnd(p.price)}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
