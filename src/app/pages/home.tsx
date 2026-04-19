import { HeroSlider } from '../components/hero-slider';
import { FeatureBar } from '../components/banner';
import { FlashSale } from '../components/flash-sale';
import { CategoryGrid } from '../components/category-grid';
import { CategorySection } from '../components/category-section';
import { useAdminStore, useEffectiveProducts } from '../../store/adminStore';
import { Newsletter } from '../components/newsletter';
import { TrustSection } from '../components/trust-section';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function HomePage() {
  const { storeConfig } = useAdminStore();
  const products = useEffectiveProducts();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Flash sale: products with discount >= threshold OR manually added
  // Fallback: if fewer than 4 qualifying, fill with best-discounted products that have oldPrice
  const flashSaleProducts = (() => {
    const FLASH_THRESHOLD = storeConfig?.flashSaleThreshold || 0.15; // lowered to 15% default
    const manualIds = new Set((storeConfig?.flashSaleItems || []).map((item: any) => item.productId));

    const qualified = products
      .filter((p) => {
        const isManual = manualIds.has(p.id);
        const discount = p.oldPrice ? ((p.oldPrice - p.price) / p.oldPrice) : 0;
        return isManual || discount >= FLASH_THRESHOLD;
      })
      .map((p) => {
        const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
        return {
          id: p.id,
          name: p.name,
          price: p.price,
          originalPrice: p.oldPrice,
          image: p.images[0],
          rating: p.rating ?? 4.5,
          reviews: p.sold ?? 0,
          inStock: p.stock > 0,
          badge: discount > 0 ? `-${discount}%` : undefined,
          specs: Object.entries(p.specs || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`),
          maxStock: p.stock,
          discountPct: discount,
        };
      })
      .sort((a, b) => b.discountPct - a.discountPct)
      .slice(0, 8);

    // Always ensure at least 4 products by filling with best-discounted inStock products
    if (qualified.length < 4) {
      const existingIds = new Set(qualified.map(p => p.id));
      const fillers = products
        .filter((p) => p.stock > 0 && p.oldPrice && !existingIds.has(p.id))
        .sort((a, b) => {
          const dA = a.oldPrice ? (a.oldPrice - a.price) / a.oldPrice : 0;
          const dB = b.oldPrice ? (b.oldPrice - b.price) / b.oldPrice : 0;
          return dB - dA;
        })
        .slice(0, 8 - qualified.length)
        .map((p) => {
          const discount = p.oldPrice ? Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100) : 0;
          return {
            id: p.id,
            name: p.name,
            price: p.price,
            originalPrice: p.oldPrice,
            image: p.images[0],
            rating: p.rating ?? 4.5,
            reviews: p.sold ?? 0,
            inStock: p.stock > 0,
            badge: discount > 0 ? `-${discount}%` : undefined,
            specs: Object.entries(p.specs || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`),
            maxStock: p.stock,
            discountPct: discount,
          };
        });
      return [...qualified, ...fillers];
    }
    return qualified;
  })();

  // Best selling microcontrollers
  const bestMicrocontrollers = products
    .filter((p) => p.category === 'Vi điều khiển')
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.oldPrice,
      image: p.images[0],
      rating: p.rating ?? 4.5,
      reviews: p.sold ?? 0,
      inStock: p.stock > 0,
      specs: Object.entries(p.specs || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`),
      maxStock: p.stock,
    }));

  // Popular sensors
  const popularSensors = products
    .filter((p) => p.category === 'Cảm biến')
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.oldPrice,
      image: p.images[0],
      rating: p.rating ?? 4.5,
      reviews: p.sold ?? 0,
      inStock: p.stock > 0,
      specs: Object.entries(p.specs || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`),
      maxStock: p.stock,
    }));

  // DIY Modules
  const diyModules = products
    .filter((p) => p.category === 'Module')
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      originalPrice: p.oldPrice,
      image: p.images[0],
      rating: p.rating ?? 4.5,
      reviews: p.sold ?? 0,
      inStock: p.stock > 0,
      specs: Object.entries(p.specs || {}).slice(0, 3).map(([k, v]) => `${k}: ${v}`),
      maxStock: p.stock,
    }));
  return (
    <div className="bg-background">
      <HeroSlider />
      <FeatureBar />
      <FlashSale products={flashSaleProducts} durationHours={storeConfig?.flashSaleDurationHours || 6} />
      <CategoryGrid />
      
      <div className="container mx-auto px-4 py-20">
        <CategorySection
          title="🔥 Vi điều khiển bán chạy"
          products={bestMicrocontrollers}
          viewAllLink="/category/vi-dieu-khien"
        />
        
        <div className="h-16"></div>

        <CategorySection
          title="📡 Cảm biến phổ biến"
          products={popularSensors}
          viewAllLink="/category/cam-bien"
        />
        
        <div className="h-16"></div>

        <CategorySection
          title="🛠️ Module DIY"
          products={diyModules}
          viewAllLink="/category/module"
        />
      </div>

      <TrustSection />
      <Newsletter />

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 p-4 bg-primary text-primary-foreground rounded-2xl shadow-xl z-50 transition-all duration-300 active:scale-90 ${
          showBackToTop ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
        }`}
        aria-label="Lên đầu trang"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </div>
  );
}