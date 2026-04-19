import { useState } from 'react';
import { ChevronDown, Cpu, Activity, Layers, Wrench, Cable, ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

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
      items: ['Raspberry Pi 4', 'Raspberry Pi Zero', 'Raspberry Pi Pico', 'Accessories'],
    },
  ],
  'Cảm biến': [
    {
      title: 'Nhiệt độ & Độ ẩm',
      items: ['DHT11', 'DHT22', 'DS18B20', 'BME280'],
    },
    {
      title: 'Ánh sáng',
      items: ['LDR', 'BH1750', 'TEMT6000', 'Photo Resistor'],
    },
    {
      title: 'Chuyển động',
      items: ['PIR HC-SR501', 'Ultrasonic HC-SR04', 'MPU6050', 'ADXL345'],
    },
  ],
  'Module': [
    {
      title: 'Relay & Switch',
      items: ['Relay 5V 1 kênh', 'Relay 5V 2 kênh', 'Relay 5V 4 kênh', 'Relay 12V'],
    },
    {
      title: 'Truyền thông',
      items: ['WiFi ESP-01', 'Bluetooth HC-05', 'NRF24L01', 'LoRa SX1278'],
    },
    {
      title: 'Hiển thị',
      items: ['LCD 16x2', 'OLED 0.96"', 'TFT 1.8"', 'LED Matrix'],
    },
  ],
  'Linh kiện': [
    {
      title: 'Điện trở',
      items: ['1/4W Carbon', '1/2W Carbon', 'SMD 0805', 'Potentiometer'],
    },
    {
      title: 'Tụ điện',
      items: ['Ceramic', 'Electrolytic', 'Tantalum', 'SMD Capacitor'],
    },
    {
      title: 'IC & Chip',
      items: ['LM7805', 'NE555', 'L298N', 'ATmega328P'],
    },
  ],
  'Phụ kiện': [
    {
      title: 'Board & Wire',
      items: ['Breadboard 830', 'Breadboard Mini', 'Jumper Wire M-M', 'Jumper Wire M-F'],
    },
    {
      title: 'Nguồn & Công cụ',
      items: ['Adapter 5V', 'USB Cable', 'Multimeter', 'Soldering Kit'],
    },
  ],
};

const CATEGORY_SLUG_MAP: Record<string, string> = {
  'Vi điều khiển': 'vi-dieu-khien',
  'Cảm biến': 'cam-bien',
  'Module': 'module',
  'Linh kiện': 'linh-kien-co-ban',
  'Phụ kiện': 'phu-kien',
};

const CATEGORY_ICONS: Record<string, any> = {
  'Vi điều khiển': Cpu,
  'Cảm biến': Activity,
  'Module': Layers,
  'Linh kiện': Wrench,
  'Phụ kiện': Cable,
};

export function MegaMenu({ mobile = false }: MegaMenuProps) {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const menuCategories = Object.keys(menuData);

  if (mobile) {
    return (
      <div className="container mx-auto px-4 py-4">
        <nav className="space-y-2">
          {menuCategories.map((category) => (
            <div key={category} className="border border-border rounded-lg overflow-hidden">
              <button
                onClick={() => setActiveMenu(activeMenu === category ? null : category)}
                className="w-full flex items-center justify-between p-4 bg-card hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = CATEGORY_ICONS[category];
                    return Icon ? <Icon className="h-5 w-5 text-primary" /> : null;
                  })()}
                  <span className="font-bold text-foreground">{category}</span>
                </div>
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-all duration-300 ${
                    activeMenu === category ? 'rotate-180 text-primary' : ''
                  }`}
                />
              </button>
              {activeMenu === category && (
                <div className="p-3 bg-muted/30 border-t border-border">
                  <div className="space-y-3">
                    {menuData[category].map((section) => (
                      <div key={section.title}>
                        <h4 className="font-medium text-sm text-foreground mb-2">{section.title}</h4>
                        <ul className="space-y-1">
                          {section.items.map((item) => (
                            <li key={item}>
                              <Link
                                to={`/category/${CATEGORY_SLUG_MAP[category] ?? 'all'}?search=${encodeURIComponent(item)}`}
                                className="flex items-center gap-2 py-1.5 text-sm text-muted-foreground hover:text-primary transition-all group/item"
                              >
                                <ArrowRight className="h-3 w-3 opacity-0 group-hover/item:opacity-100 -ml-4 group-hover/item:ml-0 transition-all" />
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
          ))}
        </nav>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <nav className="flex items-center justify-center gap-1">
        {menuCategories.map((category) => (
          <div
            key={category}
            className="relative"
            onMouseEnter={() => setActiveMenu(category)}
            onMouseLeave={() => setActiveMenu(null)}
          >
            <button className="flex items-center gap-2 px-4 py-3 hover:bg-muted/50 transition-all rounded-lg group">
              {(() => {
                const Icon = CATEGORY_ICONS[category];
                return Icon ? <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" /> : null;
              })()}
              <span className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                {category}
              </span>
              <ChevronDown className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-all group-hover:rotate-180" />
            </button>

            {/* Mega Menu Dropdown */}
            {activeMenu === category && (
              <div className="absolute left-0 top-full mt-0 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-50 min-w-[600px]">
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
                              to={`/category/${CATEGORY_SLUG_MAP[category] ?? 'all'}?search=${encodeURIComponent(item)}`}
                              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-all group/link"
                            >
                              <div className="w-1 h-1 rounded-full bg-border group-hover/link:bg-primary transition-colors" />
                              {item}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                <div className="border-t border-border px-6 py-4 bg-muted/20 flex items-center justify-between">
                  <Link
                    to={`/category/${CATEGORY_SLUG_MAP[category] ?? 'all'}`}
                    className="text-sm text-primary hover:text-primary-foreground hover:bg-primary px-4 py-2 rounded-lg font-bold transition-all border border-primary/20"
                  >
                    Tất cả sản phẩm {category}
                  </Link>
                  <p className="text-xs text-muted-foreground italic">Cập nhật hàng ngày</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}