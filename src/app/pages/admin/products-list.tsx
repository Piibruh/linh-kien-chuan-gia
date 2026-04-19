import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  ChevronUp,
  Loader2,
  Check,
  X,
  Package,
  AlertCircle,
  Download,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import { Product } from '../../../store/productStore';

type SortField = 'name' | 'price' | 'stock' | 'category';
type SortOrder = 'asc' | 'desc';

export default function ProductsList() {
  const navigate = useNavigate();
  const { products, deleteProduct, categories } = useAdminStore();
  const role = useAuthStore((s) => s.user?.role);
  const isAdmin = role === 'admin';

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      // Search filter
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.id.toLowerCase().includes(searchQuery.toLowerCase());

      // Category filter
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

      // Stock filter
      let matchesStock = true;
      if (stockFilter === 'in-stock') matchesStock = p.stock > 10;
      if (stockFilter === 'low-stock') matchesStock = p.stock > 0 && p.stock <= 10;
      if (stockFilter === 'out-of-stock') matchesStock = p.stock === 0;

      return matchesSearch && matchesCategory && matchesStock;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'name') comparison = a.name.localeCompare(b.name);
      if (sortField === 'price') comparison = a.price - b.price;
      if (sortField === 'stock') comparison = a.stock - b.stock;
      if (sortField === 'category') comparison = a.category.localeCompare(b.category);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, stockFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, stockFilter]);

  // Bulk selection
  const isAllSelected =
    paginatedProducts.length > 0 &&
    paginatedProducts.every((p) => selectedProducts.has(p.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all on current page
      const newSet = new Set(selectedProducts);
      paginatedProducts.forEach((p) => newSet.delete(p.id));
      setSelectedProducts(newSet);
    } else {
      // Select all on current page
      const newSet = new Set(selectedProducts);
      paginatedProducts.forEach((p) => newSet.add(p.id));
      setSelectedProducts(newSet);
    }
  };

  const handleSelectProduct = (id: string) => {
    const newSet = new Set(selectedProducts);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedProducts(newSet);
  };

  // Actions
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${name}"?`)) return;
    
    setDeletingProductId(id);
    try {
      await deleteProduct(id);
      toast.success(`Đã xóa sản phẩm "${name}"`);
      
      // Remove from selection if selected
      const newSet = new Set(selectedProducts);
      newSet.delete(id);
      setSelectedProducts(newSet);
    } catch {
      toast.error('Không thể xóa sản phẩm');
    } finally {
      setDeletingProductId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedProducts.size === 0) {
      toast.error('Vui lòng chọn ít nhất một sản phẩm');
      return;
    }

    const count = selectedProducts.size;
    if (!confirm(`Bạn có chắc muốn xóa ${count} sản phẩm đã chọn?`)) return;

    setBulkDeleteLoading(true);
    try {
      const promises = Array.from(selectedProducts).map((id) => deleteProduct(id));
      await Promise.all(promises);
      toast.success(`Đã xóa ${count} sản phẩm thành công`);
      setSelectedProducts(new Set());
    } catch {
      toast.error('Có lỗi xảy ra khi xóa sản phẩm');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['ID', 'Tên sản phẩm', 'Thương hiệu', 'Danh mục', 'Giá', 'Giá gốc', 'Tồn kho'],
      ...filteredProducts.map((product) => [
        product.id,
        product.name,
        product.brand,
        product.category,
        product.price.toString(),
        product.oldPrice?.toString() || '',
        product.stock.toString(),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `products_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Đã xuất file CSV thành công');
  };

  const getStockBadgeColor = (stock: number) => {
    if (stock === 0) return 'bg-red-100 text-red-800 border-red-200';
    if (stock <= 10) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStockLabel = (stock: number) => {
    if (stock === 0) return 'Hết hàng';
    if (stock <= 10) return `Còn ${stock}`;
    return `Còn ${stock}`;
  };

  return (
    <div className="min-h-screen bg-[#f6f7f7]">
      {/* Header */}
      <div className="bg-white border-b border-[#c3c4c7] sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin?tab=products')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#1d2327]">Quản lý sản phẩm</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {filteredProducts.length} sản phẩm
                  {selectedProducts.size > 0 && ` (${selectedProducts.size} đã chọn)`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportCSV}
                disabled={filteredProducts.length === 0}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-[#8c8f94] rounded hover:bg-[#f6f7f7] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Xuất CSV
              </button>
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin/products/add')}
                  className="px-5 py-2 text-sm font-semibold text-white bg-[#2271b1] rounded hover:bg-[#135e96] transition-colors shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Thêm sản phẩm
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Filters and Search */}
        <div className="bg-white border border-[#c3c4c7] rounded-lg shadow-sm mb-6">
          <div className="p-4 border-b border-[#c3c4c7] flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 border border-[#8c8f94] rounded focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                />
              </div>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-[#8c8f94] rounded hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm"
              >
                <Filter className="w-4 h-4" />
                Bộ lọc
                {showFilters ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            {/* Bulk Actions */}
            {isAdmin && selectedProducts.size > 0 && (
              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleteLoading}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex items-center gap-2 text-sm disabled:opacity-50"
              >
                {bulkDeleteLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xóa...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Xóa ({selectedProducts.size})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border-t border-[#c3c4c7] grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Danh mục</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                >
                  <option value="all">Tất cả danh mục</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Tình trạng kho</label>
                <select
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                >
                  <option value="all">Tất cả</option>
                  <option value="in-stock">Còn hàng</option>
                  <option value="low-stock">Sắp hết</option>
                  <option value="out-of-stock">Hết hàng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Hiển thị</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                >
                  <option value={20}>20 sản phẩm/trang</option>
                  <option value={50}>50 sản phẩm/trang</option>
                  <option value={100}>100 sản phẩm/trang</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Products Table */}
        <div className="bg-white border border-[#c3c4c7] rounded-lg shadow-sm overflow-hidden">
          {filteredProducts.length === 0 ? (
            <div className="p-12 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">Không tìm thấy sản phẩm</p>
              <p className="text-sm text-gray-500">Thử thay đổi bộ lọc hoặc thêm sản phẩm mới</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-[#c3c4c7]">
                    <tr>
                      <th className="px-4 py-3 text-left w-12">
                        <input
                          type="checkbox"
                          checked={isAllSelected}
                          onChange={handleSelectAll}
                          className="w-4 h-4 rounded border-gray-300"
                        />
                      </th>
                      <th className="px-4 py-3 text-left w-16"></th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center gap-1">
                          Sản phẩm
                          {sortField === 'name' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('category')}
                      >
                        <div className="flex items-center gap-1">
                          Danh mục
                          {sortField === 'category' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('price')}
                      >
                        <div className="flex items-center gap-1">
                          Giá
                          {sortField === 'price' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('stock')}
                      >
                        <div className="flex items-center gap-1">
                          Kho
                          {sortField === 'stock' && (
                            sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-700 uppercase">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c3c4c7]">
                    {paginatedProducts.map((product) => (
                      <tr
                        key={product.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedProducts.has(product.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedProducts.has(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="w-10 h-10 rounded object-cover border border-gray-200"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#1d2327] text-sm">{product.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {product.brand} • ID: {product.id}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-sm text-gray-700">{product.category}</span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-[#2271b1]">
                            {product.price.toLocaleString('vi-VN')}₫
                          </div>
                          {product.oldPrice && (
                            <div className="text-xs text-gray-500 line-through">
                              {product.oldPrice.toLocaleString('vi-VN')}₫
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${getStockBadgeColor(
                              product.stock
                            )}`}
                          >
                            {product.stock === 0 && <AlertCircle className="w-3 h-3" />}
                            {getStockLabel(product.stock)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => navigate(`/product/${product.id}`)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Xem"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => navigate(`/admin/products/edit?id=${product.id}`)}
                                className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                                title="Sửa"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                            )}
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteProduct(product.id, product.name)}
                                disabled={deletingProductId === product.id}
                                className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Xóa"
                              >
                                {deletingProductId === product.id ? (
                                  <Loader2 className="w-4 h-4 text-red-600 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4 text-red-600" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-[#c3c4c7] flex items-center justify-between bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, filteredProducts.length)} trong tổng số{' '}
                    {filteredProducts.length} sản phẩm
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 border border-[#8c8f94] rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Trước
                    </button>
                    
                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3 py-1 border rounded text-sm transition-colors ${
                              currentPage === pageNum
                                ? 'bg-[#2271b1] text-white border-[#2271b1]'
                                : 'border-[#8c8f94] hover:bg-white'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 border border-[#8c8f94] rounded hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      Sau
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}