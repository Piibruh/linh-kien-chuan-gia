import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore } from '../../../store/adminStore';
import { FormSection } from '../../components/admin/FormSection';

export default function AddCategory() {
  const navigate = useNavigate();
  const { categories, products, addCategory, deleteCategory } = useAdminStore();

  const [categoryName, setCategoryName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [parentCategory, setParentCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-generate slug from category name
  useEffect(() => {
    if (categoryName) {
      const generatedSlug = categoryName
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [categoryName]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!categoryName.trim()) {
      newErrors.categoryName = 'Tên danh mục không được để trống';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await addCategory(categoryName.trim());
      if (result.success) {
        toast.success(result.message);
        // Clear form
        setCategoryName('');
        setSlug('');
        setDescription('');
        setParentCategory('');
        setErrors({});
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (name: string) => {
    if (window.confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) {
      try {
        const result = await deleteCategory(name);
        if (result.success) {
          toast.success(result.message);
        } else {
          toast.error(result.message);
        }
      } catch (error) {
        toast.error('Có lỗi khi xóa danh mục');
      }
    }
  };

  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#f6f7f7] admin-light">
      {/* Header */}
      <div className="bg-white border-b border-[#c3c4c7] sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin?tab=categories')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-semibold text-[#1d2327]">Quản lý danh mục</h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
          {/* Left Column - Add Category Form */}
          <div>
            <FormSection title="Thêm danh mục mới">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Category Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Tên danh mục <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="VD: Vi điều khiển"
                    className={`w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-1 ${
                      errors.categoryName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-[#8c8f94] focus:ring-[#2271b1] focus:border-[#2271b1]'
                    }`}
                  />
                  {errors.categoryName && (
                    <p className="mt-1 text-xs text-red-600">{errors.categoryName}</p>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Slug (URL thân thiện)
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="vi-dieu-khien"
                    className="w-full px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Tự động tạo từ tên danh mục
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Mô tả
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Mô tả ngắn về danh mục..."
                    rows={4}
                    className="w-full px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1] resize-none"
                  />
                </div>

                {/* Parent Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Danh mục cha
                  </label>
                  <select
                    value={parentCategory}
                    onChange={(e) => setParentCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
                  >
                    <option value="">Không có (danh mục gốc)</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    Để trống nếu đây là danh mục chính
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 text-sm font-semibold text-white bg-[#2271b1] rounded hover:bg-[#135e96] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                      Đang thêm...
                    </>
                  ) : (
                    'Thêm danh mục'
                  )}
                </button>
              </form>
            </FormSection>
          </div>

          {/* Right Column - Categories List */}
          <div>
            <FormSection 
              title="Danh sách danh mục"
              action={
                <button
                  onClick={() => navigate('/admin/categories')}
                  className="text-sm text-[#2271b1] hover:text-[#135e96] font-medium"
                >
                  Xem tất cả →
                </button>
              }
            >
              {/* Search */}
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Tìm kiếm danh mục..."
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#8c8f94] rounded focus:outline-none focus:ring-1 focus:ring-[#2271b1] focus:border-[#2271b1]"
                  />
                </div>
              </div>

              {/* Categories Table */}
              {filteredCategories.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-[#c3c4c7] rounded bg-[#f6f7f7]">
                  <p className="text-sm text-gray-600">
                    {searchTerm ? 'Không tìm thấy danh mục' : 'Chưa có danh mục nào'}
                  </p>
                </div>
              ) : (
                <div className="border border-[#c3c4c7] rounded overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-[#f6f7f7] border-b border-[#c3c4c7]">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Tên danh mục
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase">
                          Số lượng SP
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-semibold text-gray-700 uppercase">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#c3c4c7] bg-white">
                      {filteredCategories.map((category) => {
                        const productCount = products.filter((p) => p.category === category).length;
                        return (
                          <tr key={category} className="hover:bg-[#f6f7f7] transition-colors">
                            <td className="px-4 py-3">
                              <div className="text-sm font-medium text-gray-900">{category}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-600">{productCount} sản phẩm</div>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <button
                                onClick={() => handleDeleteCategory(category)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Xóa
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 text-xs text-gray-600">
                Tổng số: {filteredCategories.length} danh mục
              </div>
            </FormSection>
          </div>
        </div>
      </div>
    </div>
  );
}
