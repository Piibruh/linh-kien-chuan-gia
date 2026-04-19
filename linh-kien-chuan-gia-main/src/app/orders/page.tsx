import Link from 'next/link';

import { prisma } from '../../server/db';
import { formatVnd } from '../../shared/lib/money';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: { items: true },
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-start justify-between gap-3 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Đơn hàng</h1>
          <p className="text-muted-foreground">Danh sách đơn hàng gần đây (demo).</p>
        </div>
        <Link href="/category/all" className="text-sm text-primary hover:underline">
          Tiếp tục mua sắm
        </Link>
      </div>

      {orders.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Chưa có đơn hàng</h2>
          <p className="text-muted-foreground mb-6">Hãy đặt hàng để thấy dữ liệu DB.</p>
          <Link
            href="/checkout"
            className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-bold hover:bg-primary/90"
          >
            Đi tới checkout
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="p-6 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="font-mono font-bold text-primary">{o.id}</div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(o.createdAt).toLocaleString('vi-VN')}
                  </div>
                  <div className="text-sm text-foreground mt-2">
                    {o.fullName} • {o.phone}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Tổng cộng</div>
                  <div className="text-2xl font-bold text-primary">{formatVnd(o.total)}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.paymentMethod.toUpperCase()} • {o.shippingMethod}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="text-sm font-bold text-foreground mb-3">Sản phẩm</div>
                <div className="space-y-2">
                  {o.items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/san-pham/${it.slug}`} className="text-foreground hover:text-primary line-clamp-1">
                          {it.name}
                        </Link>
                        <div className="text-xs text-muted-foreground">x{it.quantity}</div>
                      </div>
                      <div className="text-sm font-medium text-foreground whitespace-nowrap">
                        {formatVnd(it.price * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                  <div className="bg-muted/30 border border-border rounded-lg p-3">
                    <div className="text-muted-foreground">Tạm tính</div>
                    <div className="font-bold text-foreground">{formatVnd(o.subtotal)}</div>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-3">
                    <div className="text-muted-foreground">Giảm giá</div>
                    <div className="font-bold text-foreground">-{formatVnd(o.discount)}</div>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-3">
                    <div className="text-muted-foreground">Vận chuyển</div>
                    <div className="font-bold text-foreground">{formatVnd(o.shippingFee)}</div>
                  </div>
                  <div className="bg-muted/30 border border-border rounded-lg p-3">
                    <div className="text-muted-foreground">Tổng</div>
                    <div className="font-bold text-primary">{formatVnd(o.total)}</div>
                  </div>
                </div>

                <div className="mt-4 text-xs text-muted-foreground">
                  Giao tới: {o.address}, {o.ward}, {o.district}, {o.city}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
