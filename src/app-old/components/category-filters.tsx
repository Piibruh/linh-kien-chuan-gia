'use client';
import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FilterSection {
  title: string;
  options: { label: string; value: string; count?: number }[];
}

interface CategoryFiltersProps {
  onFilterChange?: (filters: Record<string, string[]>) => void;
}

export function CategoryFilters({ onFilterChange }: CategoryFiltersProps) {
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    price: true,
    category: true,
    brand: true,
    inStock: true,
  });

  const filters: Record<string, FilterSection> = {
    price: {
      title: 'Khoảng giá',
      options: [
        { label: 'Dưới 50.000đ', value: '0-50000', count: 45 },
        { label: '50.000đ - 100.000đ', value: '50000-100000', count: 78 },
        { label: '100.000đ - 200.000đ', value: '100000-200000', count: 56 },
        { label: '200.000đ - 500.000đ', value: '200000-500000', count: 34 },
        { label: 'Trên 500.000đ', value: '500000-999999999', count: 23 },
      ],
    },
    category: {
      title: 'Danh mục',
      options: [
        { label: 'Vi điều khiển', value: 'microcontroller', count: 45 },
        { label: 'Cảm biến', value: 'sensor', count: 127 },
        { label: 'Module', value: 'module', count: 89 },
        { label: 'Linh kiện', value: 'component', count: 234 },
        { label: 'Phụ kiện', value: 'accessory', count: 156 },
      ],
    },
    brand: {
      title: 'Thương hiệu',
      options: [
        { label: 'Arduino', value: 'arduino', count: 45 },
        { label: 'Espressif', value: 'espressif', count: 38 },
        { label: 'Raspberry Pi', value: 'raspberry', count: 28 },
        { label: 'Adafruit', value: 'adafruit', count: 67 },
        { label: 'SparkFun', value: 'sparkfun', count: 52 },
      ],
    },
    inStock: {
      title: 'Tình trạng',
      options: [
        { label: 'Còn hàng', value: 'in-stock', count: 489 },
        { label: 'Hết hàng', value: 'out-of-stock', count: 23 },
      ],
    },
  };

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleFilterChange = (section: string, value: string) => {
    setSelectedFilters((prev) => {
      const sectionFilters = prev[section] || [];
      const newFilters = sectionFilters.includes(value)
        ? sectionFilters.filter((v) => v !== value)
        : [...sectionFilters, value];

      const updated = {
        ...prev,
        [section]: newFilters,
      };

      onFilterChange?.(updated);
      return updated;
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    onFilterChange?.({});
  };

  const hasActiveFilters = Object.values(selectedFilters).some((arr) => arr.length > 0);

  return (
    <div className="bg-card border border-border rounded-xl p-4 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
        <h3 className="font-bold text-lg text-foreground">Bộ lọc</h3>
        {hasActiveFilters && (
          <button
            onClick={clearAllFilters}
            className="text-sm text-primary hover:text-primary/80 transition-colors"
          >
            Xóa tất cả
          </button>
        )}
      </div>

      {/* Filter Sections */}
      <div className="space-y-4">
        {Object.entries(filters).map(([key, section]) => (
          <div key={key} className="border-b border-border last:border-b-0 pb-4 last:pb-0">
            <button
              onClick={() => toggleSection(key)}
              className="w-full flex items-center justify-between mb-3 hover:text-primary transition-colors"
            >
              <span className="font-medium text-foreground">{section.title}</span>
              {expandedSections[key] ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {expandedSections[key] && (
              <div className="space-y-2">
                {section.options.map((option) => (
                  <label
                    key={option.value}
                    className="flex items-center gap-2 cursor-pointer group hover:bg-muted p-2 rounded-lg transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFilters[key]?.includes(option.value) || false}
                      onChange={() => handleFilterChange(key, option.value)}
                      className="w-4 h-4 text-primary border-border rounded focus:ring-2 focus:ring-primary cursor-pointer"
                    />
                    <span className="flex-1 text-sm text-foreground group-hover:text-primary transition-colors">
                      {option.label}
                    </span>
                    {option.count !== undefined && (
                      <span className="text-xs text-muted-foreground">({option.count})</span>
                    )}
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Active Filters Count */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-sm text-muted-foreground">
            Đang áp dụng{' '}
            <span className="font-bold text-primary">
              {Object.values(selectedFilters).reduce((sum, arr) => sum + arr.length, 0)}
            </span>{' '}
            bộ lọc
          </div>
        </div>
      )}
    </div>
  );
}
