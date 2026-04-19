'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Scale, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { useCompareStore } from '../../features/compare/store/compareStore';
import { formatVnd } from '../../shared/lib/money';

export default function ComparePage() {
  const items = useCompareStore((s) => s.items);
  const remove = useCompareStore((s) => s.remove);
  const clear = useCompareStore((s) => s.clear);

  const specKeys = Array.from(
    new Set(items.flatMap((i) => Object.keys(i.specs ?? {})))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">So sánh sản phẩm</h1>
          <p className="text-muted-foreground">So sánh tối đa 4 sản phẩm theo thông số.</p>
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clear();
              toast.success('Đã xóa danh sách so sánh');
            }}
            className="bg-muted text-foreground px-4 py-2 rounded-lg font-bold hover:bg-muted/80"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Scale className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Chưa có sản phẩm để so sánh</h2>
          <p className="text-muted-foreground mb-6">
            Hãy nhấn biểu tượng so sánh trên thẻ sản phẩm.
          </p>
          <Link
            href="/category/all"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90"
          >
            Khám phá sản phẩm
          </Link>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-x-auto">
          <table className="min-w-[900px] w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-bold text-foreground w-48">
                  Thuộc tính
                </th>
                {items.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-left">
                    <div className="flex items-start gap-3">
                      <Link href={`/san-pham/${p.slug}`} className="flex gap-3">
                        <div className="relative w-14 h-14 bg-background rounded-lg overflow-hidden border border-border">
                          <Image src={p.image} alt={p.name} fill className="object-contain p-1" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-foreground line-clamp-2">
                            {p.name}
                          </div>
                          <div className="text-primary font-bold">{formatVnd(p.price)}</div>
                        </div>
                      </Link>
                      <button
                        type="button"
                        aria-label="Xóa khỏi so sánh"
                        onClick={() => remove(p.id)}
                        className="ml-auto p-2 hover:bg-background rounded-lg"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {['Giá', ...specKeys].map((k) => (
                <tr key={k} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium text-foreground border-r border-border">
                    {k}
                  </td>
                  {items.map((p) => (
                    <td key={p.id + k} className="px-4 py-3 text-sm text-foreground">
                      {k === 'Giá'
                        ? formatVnd(p.price)
                        : (p.specs?.[k] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
