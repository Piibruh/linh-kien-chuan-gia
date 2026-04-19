import { useState } from 'react';
import { Search, X, Filter, Calendar } from 'lucide-react';

interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

interface AdvancedFilterProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  filters?: {
    label: string;
    key: string;
    options: FilterOption[];
    type?: 'select' | 'multiselect' | 'date-range';
  }[];
  onFilterChange?: (filters: Record<string, any>) => void;
  activeFilters?: Record<string, any>;
  placeholder?: string;
}

export function AdvancedFilter({
  searchQuery,
  onSearchChange,
  filters = [],
  onFilterChange,
  activeFilters = {},
  placeholder = 'Tìm kiếm...',
}: AdvancedFilterProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [localFilters, setLocalFilters] = useState<Record<string, any>>(activeFilters);

  const handleFilterUpdate = (key: string, value: any) => {
    const updated = { ...localFilters, [key]: value };
    setLocalFilters(updated);
    onFilterChange?.(updated);
  };

  const clearFilter = (key: string) => {
    const updated = { ...localFilters };
    delete updated[key];
    setLocalFilters(updated);
    onFilterChange?.(updated);
  };

  const clearAllFilters = () => {
    setLocalFilters({});
    onFilterChange?.({});
    onSearchChange('');
  };

  const activeFilterCount = Object.keys(localFilters).filter(
    (key) => localFilters[key] && (Array.isArray(localFilters[key]) ? localFilters[key].length > 0 : true)
  ).length + (searchQuery ? 1 : 0);

  return (
    <div className="bg-white border border-[#c3c4c7] rounded-lg overflow-hidden">
      {/* Search and Filter Toggle */}
      <div className="p-4 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#8c8f94]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2.5 border border-[#8c8f94] rounded-md focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8c8f94] hover:text-[#2271b1]"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {filters.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-md border transition-colors ${
              showFilters || activeFilterCount > 0
                ? 'bg-[#2271b1] text-white border-[#2271b1]'
                : 'bg-white text-[#2c3338] border-[#8c8f94] hover:bg-[#f6f7f7]'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="text-sm font-medium">Bộ lọc</span>
            {activeFilterCount > 0 && (
              <span className="bg-white text-[#2271b1] px-2 py-0.5 rounded-full text-xs font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && filters.length > 0 && (
        <div className="border-t border-[#c3c4c7] bg-[#f6f7f7] p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-[#1d2327] mb-2">
                  {filter.label}
                </label>
                {filter.type === 'date-range' ? (
                  <div className="flex gap-2">
                    <input
                      type="date"
                      value={localFilters[`${filter.key}_start`] || ''}
                      onChange={(e) => handleFilterUpdate(`${filter.key}_start`, e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#8c8f94] rounded-md focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                    />
                    <span className="text-[#8c8f94] self-center">-</span>
                    <input
                      type="date"
                      value={localFilters[`${filter.key}_end`] || ''}
                      onChange={(e) => handleFilterUpdate(`${filter.key}_end`, e.target.value)}
                      className="flex-1 px-3 py-2 border border-[#8c8f94] rounded-md focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                    />
                  </div>
                ) : filter.type === 'multiselect' ? (
                  <div className="space-y-2 max-h-48 overflow-y-auto bg-white border border-[#8c8f94] rounded-md p-3">
                    {filter.options.map((option) => (
                      <label
                        key={option.value}
                        className="flex items-center gap-2 cursor-pointer hover:bg-[#f6f7f7] p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={(localFilters[filter.key] || []).includes(option.value)}
                          onChange={(e) => {
                            const current = localFilters[filter.key] || [];
                            const updated = e.target.checked
                              ? [...current, option.value]
                              : current.filter((v: string) => v !== option.value);
                            handleFilterUpdate(filter.key, updated);
                          }}
                          className="w-4 h-4 text-[#2271b1] border-[#8c8f94] rounded focus:ring-[#2271b1]"
                        />
                        <span className="flex-1 text-sm text-[#2c3338]">{option.label}</span>
                        {option.count !== undefined && (
                          <span className="text-xs text-[#8c8f94] bg-[#f6f7f7] px-2 py-0.5 rounded">
                            {option.count}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                ) : (
                  <select
                    value={localFilters[filter.key] || 'all'}
                    onChange={(e) =>
                      handleFilterUpdate(filter.key, e.target.value === 'all' ? '' : e.target.value)
                    }
                    className="w-full px-3 py-2 border border-[#8c8f94] rounded-md focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm bg-white"
                  >
                    <option value="all">Tất cả</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                        {option.count !== undefined && ` (${option.count})`}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
          </div>

          {/* Filter Actions */}
          {activeFilterCount > 0 && (
            <div className="mt-4 pt-4 border-t border-[#c3c4c7] flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {Object.entries(localFilters).map(([key, value]) => {
                  if (!value || (Array.isArray(value) && value.length === 0)) return null;
                  const filter = filters.find((f) => f.key === key || key.startsWith(f.key));
                  if (!filter) return null;

                  const displayValue = Array.isArray(value)
                    ? `${value.length} mục`
                    : filter.options.find((o) => o.value === value)?.label || value;

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center gap-1 bg-[#2271b1]/10 text-[#2271b1] text-xs px-2 py-1 rounded border border-[#2271b1]/20"
                    >
                      <span className="font-medium">{filter.label}:</span>
                      <span>{displayValue}</span>
                      <button
                        onClick={() => clearFilter(key)}
                        className="hover:text-[#2271b1]/80 ml-1"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  );
                })}
              </div>

              <button
                onClick={clearAllFilters}
                className="text-sm text-[#b32d2e] hover:text-[#b32d2e]/80 font-medium flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                Xóa tất cả
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
