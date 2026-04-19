import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  FolderTree,
  Package,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore } from '../../../store/adminStore';

type SortField = 'name' | 'productCount';
type SortOrder = 'asc' | 'desc';

export default function CategoriesList() {
  const navigate = useNavigate();
  const { categories, products, deleteCategory } = useAdminStore();

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [deletingCategory, setDeletingCategory] = useState<string | null>(null);

  // Transform categories with product count
  const categoriesWithCount = useMemo(() => {
    return categories.map((cat) => ({
      name: cat,
      productCount: products.filter((p) => p.category === cat).length,
    }));
  }, [categories, products]);

  // Filter and sort categories
  const filteredCategories = useMemo(() => {
    let filtered = categoriesWithCount.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      if (sortField === 'productCount') comparison = a.productCount - b.productCount;
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [categoriesWithCount, searchQuery, sortField, sortOrder]);

  // Actions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteCategory = async (name: string, productCount: number) => {
    if (productCount > 0) {
      toast.error(
        `Không thể xóa danh mục "${name}" vì còn ${productCount} sản phẩm thuộc danh mục này`
      );
      return;
    }

    if (!confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) return;

    setDeletingCategory(name);
    try {
      const result = await deleteCategory(name);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error('Không thể xóa danh mục');
    } finally {
      setDeletingCategory(null);
    }
  };

  const CATEGORY_IMAGES: Record<string, string> = {
    'Vi điều khiển': 'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?w=400',
    'Cảm biến': 'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?w=400',
    'Module': 'https://images.unsplash.com/photo-1627694743581-f31765d5c631?w=400',
    'Linh kiện cơ bản': 'https://images.unsplash.com/photo-1759500657339-6e11b99a8882?w=400',
    'Phụ kiện': 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?w=400',
  };

  return (
    <div className="min-h-screen bg-[#f6f7f7]">
      {/* Header */}
      <div className="bg-white border-b border-[#c3c4c7] sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin?tab=categories')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#1d2327]">Quản lý danh mục</h1>
                <p className="text-sm text-gray-600 mt-0.5">{filteredCategories.length} danh mục</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/categories/add')}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#2271b1] rounded hover:bg-[#135e96] transition-colors shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Thêm danh mục
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Search */}
        <div className="bg-white border border-[#c3c4c7] rounded-lg shadow-sm mb-6">
          <div className="p-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm danh mục..."
                className="w-full pl-10 pr-4 py-2 border border-[#8c8f94] rounded focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
              />
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="bg-white border border-[#c3c4c7] rounded-lg shadow-sm overflow-hidden">
          {filteredCategories.length === 0 ? (
            <div className="p-12 text-center">
              <FolderTree className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">Không tìm thấy danh mục</p>
              <p className="text-sm text-gray-500">Thử thay đổi từ khóa tìm kiếm hoặc thêm danh mục mới</p>
            </div>
          ) : (
            <>
              {/* Table View */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#c3c4c7]">
                    <tr>
                      <th className="px-4 py-3 text-left w-16"></th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Tên danh mục
                          {sortField === 'name' && (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('productCount')}
                      >
                        <div className="flex items-center gap-1">
                          Số sản phẩm
                          {sortField === 'productCount' && (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c3c4c7]">
                    {filteredCategories.map((category) => (
                      <tr key={category.name} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex items-center justify-center">
                            {CATEGORY_IMAGES[category.name] ? (
                              <img
                                src={CATEGORY_IMAGES[category.name]}
                                alt={category.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <FolderTree className="w-6 h-6 text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#1d2327] text-sm">{category.name}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-700">{category.productCount} sản phẩm</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                const slug = category.name
                                  .toLowerCase()
                                  .normalize('NFD')
                                  .replace(/[\u0300-\u036f]/g, '')
                                  .replace(/đ/g, 'd')
                                  .replace(/[^a-z0-9]+/g, '-')
                                  .replace(/^-+|-+$/g, '');
                                navigate(`/category/${slug}`);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Xem danh mục"
                            >
                              <Package className="w-4 h-4 text-gray-600" />
                            </button>
                            <button
                              onClick={() => handleDeleteCategory(category.name, category.productCount)}
                              disabled={deletingCategory === category.name}
                              className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                              title={category.productCount > 0 ? 'Không thể xóa (còn sản phẩm)' : 'Xóa'}
                            >
                              {deletingCategory === category.name ? (
                                <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                              ) : category.productCount > 0 ? (
                                <AlertCircle className="w-4 h-4 text-gray-400" />
                              ) : (
                                <Trash2 className="w-4 h-4 text-red-600" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FolderTree className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng danh mục</p>
                <p className="text-2xl font-bold text-[#1d2327]">{categories.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <Package className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng sản phẩm</p>
                <p className="text-2xl font-bold text-[#1d2327]">{products.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Trung bình sản phẩm/danh mục</p>
                <p className="text-2xl font-bold text-[#1d2327]">
                  {categories.length > 0 ? Math.round(products.length / categories.length) : 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
