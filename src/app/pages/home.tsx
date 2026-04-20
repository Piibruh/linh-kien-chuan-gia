import { HeroSlider } from '../components/hero-slider';
import { FeatureBar } from '../components/banner';
import { FlashSale } from '../components/flash-sale';
import { CategoryGrid } from '../components/category-grid';
import { CategorySection } from '../components/category-section';
import { useAdminStore, useEffectiveProducts } from '../../store/adminStore';
import { Newsletter } from '../components/newsletter';
import { TrustSection } from '../components/trust-section';
import { ArrowUp } from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';

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

  // ── Flash Sale: luôn 5 sản phẩm, giảm 5-25%, không dưới 5% ──────────────────
  const flashSaleProducts = useMemo(() => {
    const MIN_DISCOUNT = 0.05; // 5%
    const MAX_DISCOUNT = 0.25; // 25%
    const TARGET_COUNT = 5;

    const manualIds = new Set((storeConfig?.flashSaleItems || []).map((item: any) => item.productId));
    const manualPrices = new Map<string, number>(
      (storeConfig?.flashSaleItems || []).map((item: any) => [item.productId, item.flashSalePrice])
    );

    // Helper: tính % giảm giá đảm bảo trong khoảng 5-25%
    const clampDiscount = (pct: number) => Math.min(MAX_DISCOUNT, Math.max(MIN_DISCOUNT, pct));

    // Tính giá flash sale cho một sản phẩm
    const toFlashItem = (p: typeof products[0], forcedPct?: number) => {
      const baseOldPrice = p.oldPrice ?? p.price;
      let pct: number;
      let salePrice: number;

      if (manualPrices.has(p.id)) {
        // Admin đặt giá tay
        salePrice = manualPrices.get(p.id)!;
        pct = (baseOldPrice - salePrice) / baseOldPrice;
        // Đảm bảo không dưới 5%
        if (pct < MIN_DISCOUNT) {
          salePrice = Math.round(baseOldPrice * (1 - MIN_DISCOUNT));
          pct = MIN_DISCOUNT;
        }
      } else if (p.oldPrice && p.oldPrice > p.price) {
        pct = (p.oldPrice - p.price) / p.oldPrice;
        salePrice = p.price;
        pct = clampDiscount(pct);
        salePrice = Math.round(p.oldPrice * (1 - pct));
      } else if (forcedPct != null) {
        pct = forcedPct;
        salePrice = Math.round(p.price * (1 - pct));
      } else {
        // Tự động tạo discount ngẫu nhiên 5-20% dựa trên id (deterministic)
        const hash = p.id.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
        pct = MIN_DISCOUNT + (hash % 16) / 100; // 5% → 20%
        salePrice = Math.round(p.price * (1 - pct));
      }

      const discountPct = Math.round(pct * 100);
      const oldPrice = p.oldPrice ?? p.price;

      return {
        id: p.id,
        name: p.name,
        price: salePrice,
        originalPrice: oldPrice,
        image: (p.images?.length ? p.images[0] : (p.image || '')),
        inStock: p.stock > 0,
        discountPct,
        maxStock: p.stock,
        stockLeft: p.stock,
      };
    };

    // 1. Lấy sản phẩm manual + có giảm giá đủ điều kiện
    const qualified = products
      .filter((p) => {
        if (manualIds.has(p.id)) return true;
        const pct = p.oldPrice ? (p.oldPrice - p.price) / p.oldPrice : 0;
        return pct >= MIN_DISCOUNT;
      })
      .map((p) => toFlashItem(p))
      .sort((a, b) => b.discountPct - a.discountPct);

    if (qualified.length >= TARGET_COUNT) {
      return qualified.slice(0, TARGET_COUNT + 3); // hiển thị vài cái thừa để scroll
    }

    // 2. Fill up đến 5 từ sản phẩm còn hàng, tạo discount tự động
    const existingIds = new Set(qualified.map((p) => p.id));
    const fillers = products
      .filter((p) => p.stock > 0 && !existingIds.has(p.id))
      .sort((a, b) => (b.sold ?? 0) - (a.sold ?? 0)) // ưu tiên bán chạy
      .slice(0, TARGET_COUNT - qualified.length)
      .map((p) => toFlashItem(p));

    return [...qualified, ...fillers];
  }, [products, storeConfig]);


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
      image: (p.images?.length ? p.images[0] : (p.image || '')),
      rating: Math.floor(p.rating),
      reviews: p.sold,
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
      image: (p.images?.length ? p.images[0] : (p.image || '')),
      rating: Math.floor(p.rating),
      reviews: p.sold,
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
      image: (p.images?.length ? p.images[0] : (p.image || '')),
      rating: Math.floor(p.rating),
      reviews: p.sold,
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