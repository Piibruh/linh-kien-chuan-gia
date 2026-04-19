import { useState } from 'react';
import { Search, Plus, Loader2 } from 'lucide-react';
import { Metabox } from './Metabox';

interface CategorySelectorProps {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onAddCategory?: (category: string) => Promise<{ success: boolean; message: string }>;
}

export function CategorySelector({
  categories,
  selectedCategory,
  onCategoryChange,
  onAddCategory,
}: CategorySelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddNewSubmit = async () => {
    if (!newCategoryName.trim() || !onAddCategory) return;

    setIsSubmitting(true);
    const res = await onAddCategory(newCategoryName);
    if (res.success) {
      setNewCategoryName('');
      setIsAddingNew(false);
      onCategoryChange(newCategoryName.trim());
    } else {
      alert(res.message);
    }
    setIsSubmitting(false);
  };

  return (
    <Metabox title="Danh mục sản phẩm" defaultOpen={true}>
      <div className="space-y-3">
        {/* Search */}
        {categories.length > 5 && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm danh mục..."
              className="w-full pl-9 pr-3 py-2 text-[13px] border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
            />
          </div>
        )}

        {/* Category List */}
        <div className="max-h-56 overflow-y-auto space-y-1.5 border border-[#c3c4c7] rounded p-3 bg-white">
          {filteredCategories.length === 0 ? (
            <p className="text-[13px] text-gray-500 text-center py-2">
              Không tìm thấy danh mục
            </p>
          ) : (
            filteredCategories.map((category) => (
              <label
                key={category}
                className="flex items-center gap-2 hover:bg-gray-50 rounded cursor-pointer transition-colors"
                style={{ marginBottom: '6px' }}
              >
                <input
                  type="checkbox"
                  value={category}
                  checked={selectedCategory === category}
                  onChange={(e) => onCategoryChange(selectedCategory === category ? '' : e.target.value)}
                  className="w-4 h-4 text-[#2271b1] border-gray-300 rounded focus:ring-[#2271b1]"
                />
                <span className="text-[13px] text-[#1d2327]">{category}</span>
              </label>
            ))
          )}
        </div>

        {/* Add New Category Like WordPress */}
        {!isAddingNew ? (
          <button
            type="button"
            onClick={() => setIsAddingNew(true)}
            className="inline-flex items-center gap-1.5 text-[13px] text-[#2271b1] hover:text-[#135e96] focus:outline-none underline underline-offset-2"
          >
            <Plus className="w-4 h-4" />
            Thêm danh mục mới
          </button>
        ) : (
          <div className="pt-2 space-y-2">
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Tên danh mục mới"
              className="w-full px-3 py-2 text-[13px] border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddNewSubmit();
                }
              }}
            />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleAddNewSubmit}
                disabled={isSubmitting || !newCategoryName.trim()}
                className="px-3 py-1.5 text-[13px] font-medium text-gray-700 bg-white border border-[#8c8f94] rounded hover:bg-[#f6f7f7] transition-colors disabled:opacity-50 flex items-center justify-center"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Thêm danh mục
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAddingNew(false);
                  setNewCategoryName('');
                }}
                className="text-[13px] text-[#b32d2e] hover:text-red-700 underline focus:outline-none"
              >
                Hủy
              </button>
            </div>
          </div>
        )}
      </div>
    </Metabox>
  );
}
