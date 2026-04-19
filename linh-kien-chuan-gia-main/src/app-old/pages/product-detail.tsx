'use client';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn, Star, ShoppingCart, Zap, Shield, TrendingUp, Package } from 'lucide-react';
import { ProductCard } from '../components/product-card';

interface ProductSpec {
  label: string;
  value: string;
}

const product = {
  id: '2',
  name: 'ESP32 DevKit V1 - WiFi + Bluetooth',
  price: 95000,
  originalPrice: 120000,
  inStock: true,
  stockCount: 47,
  rating: 5,
  reviews: 289,
  sku: 'ESP32-DK-V1',
  brand: 'Espressif',
  images: [
    'https://images.unsplash.com/photo-1634452015397-ad0686a2ae2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
    'https://images.unsplash.com/photo-1627694743581-f31765d5c631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=800',
  ],
  description: `
    <h3>ESP32 DevKit V1 - Vi điều khiển mạnh mẽ với WiFi và Bluetooth tích hợp</h3>
    <p>ESP32 là dòng chip vi điều khiển mạnh mẽ của Espressif, được thiết kế cho các ứng dụng IoT hiện đại. DevKit V1 là board phát triển phổ biến nhất với đầy đủ chân GPIO và cổng USB-to-UART tích hợp.</p>
    
    <h4>Đặc điểm nổi bật:</h4>
    <ul>
      <li>CPU Dual-core Xtensa 32-bit LX6 với tốc độ lên đến 240MHz</li>
      <li>WiFi 802.11 b/g/n và Bluetooth v4.2 BR/EDR + BLE</li>
      <li>Bộ nhớ: 520KB SRAM + 4MB Flash</li>
      <li>34 GPIO có thể lập trình, hỗ trợ PWM, ADC, DAC, I2C, SPI, UART</li>
      <li>Tiêu thụ điện năng thấp với nhiều chế độ sleep</li>
    </ul>

    <h4>Ứng dụng:</h4>
    <ul>
      <li>Smart Home: Điều khiển thiết bị qua WiFi</li>
      <li>IoT Gateway: Thu thập và truyền dữ liệu cảm biến</li>
      <li>Wearable devices: Đồng hồ thông minh, fitness tracker</li>
      <li>Audio/Video streaming</li>
    </ul>
  `,
  specs: [
    { label: 'CPU', value: 'Xtensa Dual-Core 32-bit LX6' },
    { label: 'Tốc độ', value: '240 MHz' },
    { label: 'SRAM', value: '520 KB' },
    { label: 'Flash', value: '4 MB' },
    { label: 'WiFi', value: '802.11 b/g/n (2.4 GHz)' },
    { label: 'Bluetooth', value: 'v4.2 BR/EDR + BLE' },
    { label: 'GPIO', value: '34 pins' },
    { label: 'ADC', value: '18 channels, 12-bit' },
    { label: 'DAC', value: '2 channels, 8-bit' },
    { label: 'PWM', value: '16 channels' },
    { label: 'Giao tiếp', value: 'SPI, I2C, I2S, UART, CAN' },
    { label: 'Điện áp hoạt động', value: '3.0V - 3.6V' },
    { label: 'Điện áp qua USB', value: '5V' },
    { label: 'Dòng tiêu thụ', value: '80mA (active), <5μA (deep sleep)' },
    { label: 'Nhiệt độ hoạt động', value: '-40°C to +85°C' },
    { label: 'Kích thước', value: '55 x 28 x 12 mm' },
  ],
};

const relatedProducts = [
  {
    id: '1',
    name: 'Arduino UNO R3 Chính hãng',
    price: 235000,
    originalPrice: 280000,
    image: 'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 342,
    inStock: true,
    badge: 'Best Seller',
    specs: ['ATmega328P', 'USB Type-B', '14 Digital I/O'],
  },
  {
    id: '3',
    name: 'ESP8266 NodeMCU V3',
    price: 65000,
    image: 'https://images.unsplash.com/photo-1634452015397-ad0686a2ae2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 4,
    reviews: 198,
    inStock: true,
    specs: ['WiFi 802.11', '80MHz CPU', '4MB Flash'],
  },
  {
    id: '5',
    name: 'Raspberry Pi Pico',
    price: 89000,
    image: 'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 123,
    inStock: true,
    specs: ['RP2040 Chip', 'Dual Core', '264KB RAM'],
  },
  {
    id: '4',
    name: 'Arduino Mega 2560 R3',
    price: 285000,
    image: 'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 167,
    inStock: true,
    specs: ['ATmega2560', '54 Digital I/O', '16 Analog'],
  },
];

export default function ProductDetailPage() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'description' | 'specs'>('description');
  const [isZoomed, setIsZoomed] = useState(false);

  const handlePrevImage = () => {
    setSelectedImage((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setSelectedImage((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    alert(`Đã thêm ${quantity} sản phẩm vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    alert('Chuyển đến trang thanh toán...');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
          <span>/</span>
          <a href="/category/microcontrollers" className="hover:text-primary transition-colors">Vi điều khiển</a>
          <span>/</span>
          <span className="text-foreground font-medium">ESP32 DevKit V1</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* Left Column - Images */}
        <div>
          {/* Main Image */}
          <div className="relative bg-card border border-border rounded-xl overflow-hidden mb-4 group">
            <div 
              className={`relative aspect-square ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              <img
                src={product.images[selectedImage]}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
              />
              {!isZoomed && (
                <div className="absolute top-4 right-4 bg-background/80 backdrop-blur p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="h-5 w-5 text-foreground" />
                </div>
              )}
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={handlePrevImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur hover:bg-background text-foreground p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur hover:bg-background text-foreground p-2 rounded-full transition-all opacity-0 group-hover:opacity-100"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Thumbnail Slider */}
          <div className="grid grid-cols-4 gap-2">
            {product.images.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  selectedImage === index
                    ? 'border-primary'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column - Details */}
        <div>
          {/* Title & Brand */}
          <div className="mb-4">
            <div className="text-sm text-muted-foreground mb-2">
              Thương hiệu: <span className="text-primary font-medium">{product.brand}</span> | SKU: {product.sku}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < product.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'fill-gray-200 text-gray-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.rating} ({product.reviews} đánh giá)
              </span>
            </div>

            {/* Stock Status */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Tình trạng:</span>
              {product.inStock ? (
                <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-600 rounded-full"></span>
                  Còn hàng ({product.stockCount} sản phẩm)
                </span>
              ) : (
                <span className="text-sm text-destructive font-medium">Hết hàng</span>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="bg-muted/30 border border-border rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-4xl font-bold text-destructive">
                {product.price.toLocaleString('vi-VN')}₫
              </span>
              {product.originalPrice && (
                <span className="text-xl text-muted-foreground line-through">
                  {product.originalPrice.toLocaleString('vi-VN')}₫
                </span>
              )}
            </div>
            {product.originalPrice && (
              <div className="inline-block bg-destructive text-destructive-foreground text-sm px-3 py-1 rounded-full font-bold">
                Tiết kiệm {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
              </div>
            )}
          </div>

          {/* Features */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <Shield className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Bảo hành 12 tháng</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <Package className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Giao hàng toàn quốc</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Bán chạy #1</span>
            </div>
            <div className="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
              <Zap className="h-5 w-5 text-primary" />
              <span className="text-sm text-foreground">Giao hàng nhanh</span>
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">Số lượng:</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors"
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 text-center bg-transparent border-x border-border focus:outline-none"
                />
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 bg-muted hover:bg-muted/80 transition-colors"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleAddToCart}
              className="flex items-center justify-center gap-2 bg-accent text-accent-foreground px-6 py-4 rounded-lg font-bold hover:bg-accent/90 transition-all active:scale-95"
            >
              <ShoppingCart className="h-5 w-5" />
              Thêm vào giỏ
            </button>
            <button
              onClick={handleBuyNow}
              className="bg-primary text-primary-foreground px-6 py-4 rounded-lg font-bold hover:bg-primary/90 transition-all active:scale-95"
            >
              Mua ngay
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-card border border-border rounded-xl overflow-hidden mb-12">
        {/* Tab Headers */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('description')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'description'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Mô tả sản phẩm
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'specs'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            Thông số kỹ thuật
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'description' && (
            <div 
              className="prose prose-sm max-w-none text-foreground"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          )}

          {activeTab === 'specs' && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {product.specs.map((spec, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? 'bg-muted/30' : 'bg-transparent'}
                    >
                      <td className="px-4 py-3 font-medium text-foreground border border-border w-1/3">
                        {spec.label}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground border border-border font-mono text-sm">
                        {spec.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Related Products */}
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-6">Sản phẩm liên quan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {relatedProducts.map((product) => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
}
