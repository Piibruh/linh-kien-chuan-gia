'use client';

import { FeatureBar } from '../components/banner';
import { FlashSale } from '../components/flash-sale';
import { CategoryGrid } from '../components/category-grid';
import { CategorySection } from '../components/category-section';
import { HeroSlider } from '../components/hero-slider';

import productsData from '../../data/products.json';

const allProducts = (productsData as any[]).map((p) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  price: p.price,
  originalPrice: p.oldPrice,
  image:
    p.images && p.images[0]
      ? p.images[0]
      : 'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  rating: p.rating ?? 4.5,
  reviews: p.sold ?? 0,
  inStock: (p.stock ?? 0) > 0,
  stock: p.stock ?? 0,
  badge:
    p.oldPrice && p.price < p.oldPrice
      ? `-${Math.round((1 - p.price / p.oldPrice) * 100)}%`
      : undefined,
  specs: p.specs ? (Object.values(p.specs) as string[]).slice(0, 3) : [],
  specsMap: p.specs ?? undefined,
  category: p.category,
}));

const flashSaleProducts = allProducts
  .filter((p) => p.badge && p.badge.includes('-'))
  .slice(0, 10);

const bestMicrocontrollers = allProducts
  .filter((p) => p.category === 'Vi điều khiển')
  .slice(0, 10);

const popularSensors = allProducts
  .filter((p) => p.category === 'Cảm biến')
  .slice(0, 10);

const diyModules = allProducts
  .filter((p) => p.category === 'Module')
  .slice(0, 10);

export default function HomePage() {
  return (
    <div>
      <HeroSlider />
      <FeatureBar />
      <FlashSale products={flashSaleProducts} />
      <CategoryGrid />

      <div className="container mx-auto px-4 py-12">
        <CategorySection
          title="Vi điều khiển bán chạy"
          products={bestMicrocontrollers}
          viewAllLink="/category/vi-dieu-khien"
        />

        <CategorySection
          title="Cảm biến phổ biến"
          products={popularSensors}
          viewAllLink="/category/cam-bien"
        />

        <CategorySection
          title="Module DIY"
          products={diyModules}
          viewAllLink="/category/module"
        />
      </div>
    </div>
  );
}
