'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
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

interface CategorySectionProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
}

export function CategorySection({ title, products, viewAllLink }: CategorySectionProps) {
  return (
    <section className="mb-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        {viewAllLink && (
          <Link
            href={viewAllLink}
            className="flex items-center gap-1 text-primary hover:text-primary/80 transition-colors group"
          >
            <span className="font-medium">Xem tất cả</span>
            <ChevronRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} {...product} />
        ))}
      </div>
    </section>
  );
}
