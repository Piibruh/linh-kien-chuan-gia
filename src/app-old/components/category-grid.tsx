'use client';

import Link from 'next/link';
import { Cpu, Gauge, Box, Wrench, Cog } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ElementType;
  hint: string;
  color: string;
  link: string;
}

const categories: Category[] = [
  {
    id: 'micro',
    name: 'Vi điều khiển',
    icon: Cpu,
    hint: 'Arduino, ESP, STM32...',
    color: 'from-blue-500 to-blue-600',
    link: '/category/vi-dieu-khien',
  },
  {
    id: 'sensor',
    name: 'Cảm biến',
    icon: Gauge,
    hint: 'DHT, HC-SR04, MQ...',
    color: 'from-green-500 to-green-600',
    link: '/category/cam-bien',
  },
  {
    id: 'module',
    name: 'Module',
    icon: Box,
    hint: 'Relay, OLED, NRF...',
    color: 'from-purple-500 to-purple-600',
    link: '/category/module',
  },
  {
    id: 'basic',
    name: 'Linh kiện cơ bản',
    icon: Cog,
    hint: 'Điện trở, tụ, IC...',
    color: 'from-orange-500 to-orange-600',
    link: '/category/linh-kien-co-ban',
  },
  {
    id: 'accessory',
    name: 'Phụ kiện',
    icon: Wrench,
    hint: 'Breadboard, dây, nguồn...',
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <Link
                key={category.id}
                href={category.link}
                className="group bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:scale-[1.03] hover:-translate-y-1"
              >
                <div
                  className={`bg-gradient-to-br ${category.color} w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-bold text-center text-foreground mb-1 group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground text-center">{category.hint}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
