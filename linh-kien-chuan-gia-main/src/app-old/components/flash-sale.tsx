'use client';

import { Zap } from 'lucide-react';
import { CountdownTimer } from './countdown-timer';
import { ProductCard } from './product-card';

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating?: number;
  reviews?: number;
  inStock: boolean;
  stock?: number;
  badge?: string;
  specs?: string[];
  specsMap?: Record<string, string>;
}

interface FlashSaleProps {
  products: Product[];
}

export function FlashSale({ products }: FlashSaleProps) {
  const endDate = new Date();
  endDate.setHours(endDate.getHours() + 6);

  return (
    <section className="bg-gradient-to-r from-orange-50 to-red-50 py-12 my-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-destructive text-destructive-foreground p-3 rounded-lg">
              <Zap className="h-8 w-8 fill-current" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-foreground">Flash Sale</h2>
              <p className="text-muted-foreground">Giảm giá sốc trong thời gian có hạn</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-muted-foreground">Kết thúc trong:</span>
            <CountdownTimer targetDate={endDate} />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="text-center mt-8">
          <button
            type="button"
            className="bg-destructive text-destructive-foreground px-8 py-3 rounded-lg font-bold hover:bg-destructive/90 transition-all active:scale-95"
          >
            Xem tất cả Flash Sale
          </button>
        </div>
      </div>
    </section>
  );
}
