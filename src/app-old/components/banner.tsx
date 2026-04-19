'use client';
import { ChevronRight, Zap, Shield, Truck, HeadphonesIcon } from 'lucide-react';

export function HeroBanner() {
  return (
    <div className="bg-gradient-to-r from-primary to-accent text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <div className="inline-block bg-white/20 text-white px-3 py-1 rounded-full text-sm font-medium mb-4">
              ⚡ Khuyến mãi đặc biệt
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Linh kiện điện tử
              <br />
              chất lượng cao
            </h1>
            <p className="text-lg text-white/90 mb-6">
              Arduino, ESP32, cảm biến và module cho mọi dự án DIY của bạn
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-white text-primary px-6 py-3 rounded-lg font-medium hover:bg-white/90 transition-colors flex items-center gap-2">
                Mua ngay
                <ChevronRight className="h-5 w-5" />
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-medium hover:bg-white/10 transition-colors">
                Xem catalog
              </button>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="relative">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
                    <div className="text-3xl font-bold mb-1">500+</div>
                    <div className="text-sm text-white/80">Sản phẩm</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
                    <div className="text-3xl font-bold mb-1">24/7</div>
                    <div className="text-sm text-white/80">Hỗ trợ</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
                    <div className="text-3xl font-bold mb-1">1000+</div>
                    <div className="text-sm text-white/80">Khách hàng</div>
                  </div>
                  <div className="bg-white/20 rounded-xl p-4 backdrop-blur">
                    <div className="text-3xl font-bold mb-1">100%</div>
                    <div className="text-sm text-white/80">Chính hãng</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeatureBar() {
  const features = [
    {
      icon: Zap,
      title: 'Giao hàng nhanh',
      description: '2-3 ngày toàn quốc',
    },
    {
      icon: Shield,
      title: 'Bảo hành chính hãng',
      description: 'Đổi trả trong 7 ngày',
    },
    {
      icon: Truck,
      title: 'Miễn phí vận chuyển',
      description: 'Đơn hàng từ 500k',
    },
    {
      icon: HeadphonesIcon,
      title: 'Hỗ trợ kỹ thuật',
      description: 'Tư vấn 24/7',
    },
  ];

  return (
    <div className="bg-card border-y border-border">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="bg-primary/10 text-primary p-3 rounded-lg shrink-0">
                <feature.icon className="h-6 w-6" />
              </div>
              <div>
                <div className="font-medium text-foreground text-sm">{feature.title}</div>
                <div className="text-xs text-muted-foreground">{feature.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
