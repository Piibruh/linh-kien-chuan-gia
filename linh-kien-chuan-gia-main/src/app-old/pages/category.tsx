'use client';
import { useState } from 'react';
import { ArrowUpDown, Grid3x3, List } from 'lucide-react';
import { CategoryFilters } from '../components/category-filters';
import { ProductCard } from '../components/product-card';
import { ProductGridSkeleton } from '../components/skeleton';

// All products for category page
const allProducts = [
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
    id: '2',
    name: 'ESP32 DevKit V1',
    price: 95000,
    originalPrice: 120000,
    image: 'https://images.unsplash.com/photo-1634452015397-ad0686a2ae2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 289,
    inStock: true,
    badge: 'Hot',
    specs: ['WiFi + Bluetooth', '240MHz Dual Core', '4MB Flash'],
  },
  {
    id: '3',
    name: 'Arduino Nano V3 CH340',
    price: 55000,
    image: 'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 4,
    reviews: 156,
    inStock: true,
    specs: ['ATmega328', 'Mini USB', 'Compact Size'],
  },
  {
    id: '4',
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
    inStock: false,
    specs: ['RP2040 Chip', 'Dual Core', '264KB RAM'],
  },
  {
    id: '6',
    name: 'DHT22 Temperature & Humidity',
    price: 85000,
    image: 'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 276,
    inStock: true,
    badge: 'Popular',
    specs: ['±0.5°C accuracy', 'Humidity 0-100%', 'Digital output'],
  },
  {
    id: '7',
    name: 'HC-SR04 Ultrasonic Sensor',
    price: 25000,
    image: 'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 4,
    reviews: 412,
    inStock: true,
    specs: ['2cm - 400cm', '15° angle', 'Low power'],
  },
  {
    id: '8',
    name: 'MPU6050 Gyroscope',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 189,
    inStock: true,
    specs: ['6-axis IMU', 'I2C interface', '±16g range'],
  },
  {
    id: '9',
    name: 'BH1750 Light Sensor',
    price: 35000,
    image: 'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 4,
    reviews: 98,
    inStock: true,
    specs: ['I2C interface', '1-65535 lux', 'Low current'],
  },
  {
    id: '10',
    name: 'PIR Motion Sensor HC-SR501',
    price: 28000,
    originalPrice: 35000,
    image: 'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 4,
    reviews: 234,
    inStock: true,
    specs: ['3-7m range', 'Adjustable delay', '3.3V-5V'],
  },
  {
    id: '11',
    name: 'Relay Module 5V 1 Channel',
    price: 18000,
    image: 'https://images.unsplash.com/photo-1627694743581-f31765d5c631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 567,
    inStock: true,
    badge: 'Best Price',
    specs: ['Max 250V AC', '10A current', 'LED indicator'],
  },
  {
    id: '12',
    name: 'L298N Motor Driver',
    price: 42000,
    image: 'https://images.unsplash.com/photo-1627694743581-f31765d5c631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 398,
    inStock: true,
    specs: ['2A per channel', 'Dual H-Bridge', '5V-35V input'],
  },
  {
    id: '13',
    name: 'OLED Display 0.96" I2C',
    price: 65000,
    originalPrice: 85000,
    image: 'https://images.unsplash.com/photo-1627694743581-f31765d5c631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 445,
    inStock: true,
    badge: 'Sale',
    specs: ['128x64 pixels', 'White color', 'I2C interface'],
  },
  {
    id: '14',
    name: 'HC-05 Bluetooth Module',
    price: 78000,
    image: 'https://images.unsplash.com/photo-1627694743581-f31765d5c631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 4,
    reviews: 267,
    inStock: true,
    specs: ['Class 2 BT', 'UART interface', '10m range'],
  },
  {
    id: '15',
    name: 'NRF24L01+ Wireless Module',
    price: 32000,
    image: 'https://images.unsplash.com/photo-1627694743581-f31765d5c631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 4,
    reviews: 178,
    inStock: true,
    specs: ['2.4GHz', '100m range', 'Low power'],
  },
  {
    id: '16',
    name: 'Breadboard 830 Points',
    price: 22000,
    image: 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 689,
    inStock: true,
    specs: ['830 tie points', 'Self-adhesive', 'High quality'],
  },
  {
    id: '17',
    name: 'Jumper Wire Kit 120pcs',
    price: 35000,
    originalPrice: 45000,
    image: 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 4,
    reviews: 456,
    inStock: true,
    badge: 'Kit',
    specs: ['M-M, M-F, F-F', '40pcs each', 'Multiple colors'],
  },
  {
    id: '18',
    name: 'USB Cable Type-A to B',
    price: 15000,
    image: 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 4,
    reviews: 234,
    inStock: true,
    specs: ['50cm length', 'Arduino UNO', 'High quality'],
  },
  {
    id: '19',
    name: 'Power Supply 5V 2A',
    price: 45000,
    image: 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 321,
    inStock: true,
    specs: ['5V / 2A', 'DC 5.5x2.1mm', 'Short circuit'],
  },
  {
    id: '20',
    name: 'Resistor Kit 600pcs',
    price: 48000,
    image: 'https://images.unsplash.com/photo-1759500657339-6e11b99a8882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
    rating: 5,
    reviews: 178,
    inStock: true,
    badge: 'Value Pack',
    specs: ['30 values', '1/4W', 'Organized box'],
  },
];

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'best-selling' | 'newest';
type ViewMode = 'grid' | 'list';

export default function CategoryPage() {
  const [sortBy, setSortBy] = useState<SortOption>('default');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState(allProducts);

  const handleFilterChange = (filters: Record<string, string[]>) => {
    // Simulate loading
    setIsLoading(true);
    setTimeout(() => {
      // In a real app, you would filter products based on the filters
      console.log('Filters applied:', filters);
      setIsLoading(false);
    }, 500);
  };

  const handleSortChange = (value: SortOption) => {
    setSortBy(value);
    let sorted = [...products];
    
    switch (value) {
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'best-selling':
        sorted.sort((a, b) => b.reviews - a.reviews);
        break;
      case 'newest':
        sorted.reverse();
        break;
      default:
        sorted = allProducts;
    }
    
    setProducts(sorted);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <a href="/" className="hover:text-primary transition-colors">Trang chủ</a>
          <span>/</span>
          <span className="text-foreground font-medium">Vi điều khiển & Linh kiện</span>
        </div>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Vi điều khiển & Linh kiện</h1>
        <p className="text-muted-foreground">Tìm thấy {products.length} sản phẩm</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-1">
          <CategoryFilters onFilterChange={handleFilterChange} />
        </aside>

        {/* Main Content */}
        <main className="lg:col-span-3">
          {/* Toolbar */}
          <div className="bg-card border border-border rounded-xl p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              {/* Sort */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="px-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                >
                  <option value="default">Mặc định</option>
                  <option value="best-selling">Bán chạy nhất</option>
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp đến cao</option>
                  <option value="price-desc">Giá: Cao đến thấp</option>
                </select>
              </div>

              {/* View Mode */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-colors ${
                    viewMode === 'list'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  <List className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Products Grid or Loading */}
          {isLoading ? (
            <ProductGridSkeleton count={12} />
          ) : (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-2 md:grid-cols-3 gap-4'
                  : 'space-y-4'
              }
            >
              {products.map((product) => (
                <ProductCard key={product.id} {...product} />
              ))}
            </div>
          )}

          {/* Pagination */}
          <div className="mt-8 flex items-center justify-center gap-2">
            <button className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Trước
            </button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
              1
            </button>
            <button className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
              2
            </button>
            <button className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
              3
            </button>
            <button className="px-4 py-2 bg-card border border-border rounded-lg hover:bg-muted transition-colors">
              Sau
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}