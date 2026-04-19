import { Cpu, Wifi, Gauge, Box, Wrench, Cog } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  count: number;
  color: string;
  link: string;
}

const categories: Category[] = [
  {
    id: '1',
    name: 'Vi điều khiển',
    icon: Cpu,
    count: 12,
    color: 'from-blue-500 to-blue-600',
    link: '/category/vi-dieu-khien',
  },
  {
    id: '2',
    name: 'ESP32 / WiFi',
    icon: Wifi,
    count: 8,
    color: 'from-cyan-500 to-cyan-600',
    link: '/category/vi-dieu-khien',
  },
  {
    id: '3',
    name: 'Cảm biến',
    icon: Gauge,
    count: 15,
    color: 'from-green-500 to-green-600',
    link: '/category/cam-bien',
  },
  {
    id: '4',
    name: 'Module',
    icon: Box,
    count: 12,
    color: 'from-purple-500 to-purple-600',
    link: '/category/module',
  },
  {
    id: '5',
    name: 'Linh kiện cơ bản',
    icon: Cog,
    count: 10,
    color: 'from-orange-500 to-orange-600',
    link: '/category/linh-kien-co-ban',
  },
  {
    id: '6',
    name: 'Phụ kiện',
    icon: Wrench,
    count: 13,
    color: 'from-pink-500 to-pink-600',
    link: '/category/phu-kien',
  },
];

export function CategoryGrid() {
  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2">Danh mục nổi bật</h2>
          <p className="text-muted-foreground">Khám phá các sản phẩm theo danh mục</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <a
                key={category.id}
                href={category.link}
                className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:scale-105 hover:-translate-y-1 cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${category.color} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-center text-foreground mb-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground text-center">
                  {category.count} sản phẩm
                </p>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}