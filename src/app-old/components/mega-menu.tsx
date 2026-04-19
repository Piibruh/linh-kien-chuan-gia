'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';

import { slugifyVi } from '../../shared/lib/slug';

interface MegaMenuProps {
  mobile?: boolean;
}

interface MenuCategory {
  title: string;
  items: string[];
}

const menuData: Record<string, MenuCategory[]> = {
  'Vi điều khiển': [
    {
      title: 'Arduino',
      items: ['Arduino UNO', 'Arduino Nano', 'Arduino Mega', 'Arduino Pro Mini'],
    },
    {
      title: 'ESP Series',
      items: ['ESP32', 'ESP8266', 'ESP32-CAM', 'ESP32-S3'],
    },
    {
      title: 'Raspberry Pi',
      items: ['Raspberry Pi Pico', 'Accessories'],
    },
  ],
  'Cảm biến': [
    {
      title: 'Nhiệt độ & Độ ẩm',
      items: ['DHT11', 'DHT22', 'DS18B20'],
    },
    {
      title: 'Ánh sáng',
      items: ['BH1750'],
    },
    {
      title: 'Chuyển động',
      items: ['PIR HC-SR501', 'Ultrasonic HC-SR04'],
    },
  ],
  Module: [
    {
      title: 'Relay & Switch',
      items: ['Relay 5V 1 kênh', 'Relay 5V 2 kênh', 'Relay 5V 4 kênh'],
    },
    {
      title: 'Truyền thông',
      items: ['Bluetooth HC-05', 'NRF24L01'],
    },
    {
      title: 'Hiển thị',
      items: ['LCD 16x2', 'OLED 0.96"'],
    },
  ],
  'Linh kiện cơ bản': [
    {
      title: 'Điện trở',
      items: ['220Ω', '1KΩ', '10KΩ'],
    },
    {
      title: 'Tụ điện',
      items: ['100nF', '100µF', '1000µF'],
    },
    {
      title: 'IC & Chip',
      items: ['NE555', 'LM358', '74HC595'],
    },
  ],
  'Phụ kiện': [
    {
      title: 'Board & Wire',
      items: ['Breadboard 830', 'Breadboard 400', 'Jumper Wire'],
    },
    {
      title: 'Nguồn',
      items: ['Adapter 5V', 'Adapter 12V'],
    },
  ],
};

export function MegaMenu({ mobile = false }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const menuCategories = Object.keys(menuData);

  if (mobile) {
    return (
      <div className="container mx-auto px-4 py-4">
        <nav className="space-y-2" aria-label="Danh mục">
          {menuCategories.map((category) => {
            const categorySlug = slugifyVi(category);
            const open = activeMenu === category;

            return (
              <div key={category} className="border border-border rounded-lg overflow-hidden">
                <button
                  type="button"
                  onClick={() => setActiveMenu(open ? null : category)}
                  className="w-full flex items-center justify-between p-3 bg-card hover:bg-muted transition-colors"
                  aria-expanded={open}
                >
                  <span className="font-medium text-foreground">{category}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-muted-foreground transition-transform ${
                      open ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {open && (
                  <div className="p-3 bg-muted/30 border-t border-border">
                    <div className="mb-3">
                      <Link
                        href={`/category/${categorySlug}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        Xem tất cả {category}
                      </Link>
                    </div>

                    <div className="space-y-3">
                      {menuData[category].map((section) => (
                        <div key={section.title}>
                          <h4 className="font-medium text-sm text-foreground mb-2">
                            {section.title}
                          </h4>
                          <ul className="space-y-1">
                            {section.items.map((item) => (
                              <li key={item}>
                                <Link
                                  href={`/category/${categorySlug}?search=${encodeURIComponent(item)}`}
                                  className="block text-sm text-muted-foreground hover:text-primary hover:pl-2 transition-all"
                                >
                                  {item}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <nav className="flex items-center justify-center gap-1" aria-label="Danh mục">
        {menuCategories.map((category) => {
          const categorySlug = slugifyVi(category);

          return (
            <div
              key={category}
              className="relative"
              onMouseEnter={() => setActiveMenu(category)}
              onMouseLeave={() => setActiveMenu(null)}
            >
              <Link
                href={`/category/${categorySlug}`}
                className="flex items-center gap-1 px-4 py-3 hover:bg-muted transition-colors rounded-lg group"
              >
                <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  {category}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-all group-hover:rotate-180" />
              </Link>

              {activeMenu === category && (
                <div className="absolute left-0 top-full mt-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 min-w-[640px]">
                  <div className="p-6 grid grid-cols-3 gap-6">
                    {menuData[category].map((section) => (
                      <div key={section.title}>
                        <h4 className="font-medium text-sm text-foreground mb-3 pb-2 border-b border-border">
                          {section.title}
                        </h4>
                        <ul className="space-y-2">
                          {section.items.map((item) => (
                            <li key={item}>
                              <Link
                                href={`/category/${categorySlug}?search=${encodeURIComponent(item)}`}
                                className="block text-sm text-muted-foreground hover:text-primary hover:pl-2 transition-all"
                              >
                                {item}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
