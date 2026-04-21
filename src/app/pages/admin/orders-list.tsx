import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import {
  ArrowLeft,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  ShoppingCart,
  Eye,
  Trash2,
  Download,
  Package,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  X,
  Calendar,
  DollarSign,
  Mail,
  Phone,
  Printer,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAdminStore, Order, OrderStatus } from '../../../store/adminStore';
import { useAuthStore } from '../../../store/authStore';
import {
  ORDER_PAYMENT_STATUS_LABELS,
  ORDER_STATUS_LABELS,
  canOrderBeCancelled,
  getAdminOrderActions,
  getOrderActionLabel,
  type OrderAction,
} from '../../../lib/orderFlow';
import { CancelOrderModal } from '../../components/cancel-order-modal';

type SortField = 'id' | 'customerName' | 'total' | 'status' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function OrdersList() {
  const navigate = useNavigate();
  const { orders, products, updateOrderStatus, markOrderCodCollected, deleteOrder, cancelOrderByCustomer } = useAdminStore();
  const isAdmin = useAuthStore((s) => s.user?.role === 'admin');

  // UI State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set());
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Filter and sort orders
  const filteredOrders = useMemo(() => {
    let filtered = orders.filter((o) => {
      // Search filter
      const matchesSearch =
        o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.customerEmail.toLowerCase().includes(searchQuery.toLowerCase());

      // Status filter
      const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

      return matchesSearch && matchesStatus;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'id') comparison = a.id.localeCompare(b.id);
      if (sortField === 'customerName') comparison = a.customerName.localeCompare(b.customerName);
      if (sortField === 'total') comparison = a.totalAmount - b.totalAmount;
      if (sortField === 'status') comparison = a.status.localeCompare(b.status);
      if (sortField === 'createdAt')
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [orders, searchQuery, statusFilter, sortField, sortOrder]);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // Bulk selection
  const isAllSelected =
    paginatedOrders.length > 0 && paginatedOrders.every((o) => selectedOrders.has(o.id));

  const handleSelectAll = () => {
    if (isAllSelected) {
      const newSet = new Set(selectedOrders);
      paginatedOrders.forEach((o) => newSet.delete(o.id));
      setSelectedOrders(newSet);
    } else {
      const newSet = new Set(selectedOrders);
      paginatedOrders.forEach((o) => newSet.add(o.id));
      setSelectedOrders(newSet);
    }
  };

  const handleSelectOrder = (id: string) => {
    const newSet = new Set(selectedOrders);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedOrders(newSet);
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

  const handleDeleteOrder = async (id: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đơn hàng "${id}"?`)) return;

    setDeletingOrderId(id);
    try {
      await deleteOrder(id);
      toast.success(`Đã xóa đơn hàng "${id}"`);

      // Remove from selection if selected
      const newSet = new Set(selectedOrders);
      newSet.delete(id);
      setSelectedOrders(newSet);
    } catch {
      toast.error('Không thể xóa đơn hàng');
    } finally {
      setDeletingOrderId(null);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedOrders.size === 0) {
      toast.error('Vui lòng chọn ít nhất một đơn hàng');
      return;
    }

    const count = selectedOrders.size;
    if (!confirm(`Bạn có chắc muốn xóa ${count} đơn hàng đã chọn?`)) return;

    setBulkDeleteLoading(true);
    try {
      const promises = Array.from(selectedOrders).map((id) => deleteOrder(id));
      await Promise.all(promises);
      toast.success(`Đã xóa ${count} đơn hàng thành công`);
      setSelectedOrders(new Set());
    } catch {
      toast.error('Có lỗi xảy ra khi xóa đơn hàng');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const handleViewOrder = (order: Order) => setSelectedOrder(order);

  const handlePrintOrder = () => {
    window.print();
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    setUpdatingOrderId(orderId);
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success('Đã cập nhật trạng thái đơn hàng');
    } catch {
      toast.error('Không thể cập nhật trạng thái');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleOrderAction = async (order: Order, action: OrderAction) => {
    setUpdatingOrderId(order.id);
    try {
      if (action === 'confirm') await updateOrderStatus(order.id, 'processing');
      if (action === 'handover') await updateOrderStatus(order.id, 'shipping');
      if (action === 'mark_delivered') await updateOrderStatus(order.id, 'delivered');
      if (action === 'complete') await updateOrderStatus(order.id, 'completed');
      if (action === 'collect_cod') await markOrderCodCollected(order.id);
      toast.success(getOrderActionLabel(action));
    } catch (e: any) {
      toast.error(e?.message ?? 'Không thể cập nhật đơn hàng');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Mã đơn', 'Người dùng', 'Email', 'Tổng tiền', 'Trạng thái', 'Ngày tạo'],
      ...filteredOrders.map((order) => [
        order.id,
        order.customerName,
        order.customerEmail,
        order.totalAmount.toString(),
        order.status,
        new Date(order.createdAt).toLocaleDateString('vi-VN'),
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `orders_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    toast.success('Đã xuất file CSV thành công');
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    if (status === 'processing') return 'bg-blue-100 text-blue-800 border-blue-200';
    if (status === 'shipping') return 'bg-purple-100 text-purple-800 border-purple-200';
    if (status === 'delivered') return 'bg-teal-100 text-teal-800 border-teal-200';
    if (status === 'completed') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'cancelled') return 'bg-red-100 text-red-800 border-red-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusLabel = (status: OrderStatus) => {
    if (status === 'pending') return 'Chờ xác nhận';
    if (status === 'processing') return 'Đang xử lý';
    if (status === 'shipping') return 'Đang giao';
    if (status === 'delivered') return 'Đã nhận';
    if (status === 'completed') return 'Thành công';
    if (status === 'cancelled') return 'Đã hủy';
    return status;
  };

  const getStatusIcon = (status: OrderStatus) => {
    if (status === 'pending') return <Clock className="w-3 h-3" />;
    if (status === 'processing') return <Package className="w-3 h-3" />;
    if (status === 'shipping') return <Truck className="w-3 h-3" />;
    if (status === 'delivered') return <Package className="w-3 h-3" />;
    if (status === 'completed') return <CheckCircle className="w-3 h-3" />;
    if (status === 'cancelled') return <XCircle className="w-3 h-3" />;
    return null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statusStats = useMemo(() => {
    const stats = {
      pending: orders.filter((o) => o.status === 'pending').length,
      processing: orders.filter((o) => o.status === 'processing').length,
      completed: orders.filter((o) => o.status === 'completed').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
      totalRevenue: orders
        .filter((o) => o.status === 'completed')
        .reduce((sum, o) => sum + o.totalAmount, 0),
    };
    return stats;
  }, [orders]);

  return (
    <div className="min-h-screen bg-[#f6f7f7]">
      {/* Header */}
      <div className="bg-white border-b border-[#c3c4c7] sticky top-0 z-10">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin?tab=orders')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-semibold text-[#1d2327]">Quản lý đơn hàng</h1>
                <p className="text-sm text-gray-600 mt-0.5">
                  {filteredOrders.length} đơn hàng
                  {selectedOrders.size > 0 && ` (${selectedOrders.size} đã chọn)`}
                </p>
              </div>
            </div>
            <button
              onClick={handleExportCSV}
              disabled={filteredOrders.length === 0}
              className="px-5 py-2 text-sm font-semibold text-white bg-[#2271b1] rounded hover:bg-[#135e96] transition-colors shadow-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-4 h-4" />
              Xuất CSV
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Tổng đơn</p>
                <p className="text-2xl font-bold text-[#1d2327]">{orders.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Chờ xác nhận</p>
                <p className="text-2xl font-bold text-[#1d2327]">{statusStats.pending}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Đang xử lý</p>
                <p className="text-2xl font-bold text-[#1d2327]">{statusStats.processing}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Hoàn thành</p>
                <p className="text-2xl font-bold text-[#1d2327]">{statusStats.completed}</p>
              </div>
            </div>
          </div>
          <div className="bg-white border border-[#c3c4c7] rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 rounded-lg">
                <DollarSign className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Doanh thu</p>
                <p className="text-xl font-bold text-[#1d2327]">
                  {statusStats.totalRevenue.toLocaleString('vi-VN')}₫
                </p>
              </div>
            </div>
          </div>
        </div>

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
                  placeholder="Tìm kiếm đơn hàng..."
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
            {isAdmin && selectedOrders.size > 0 && (
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
                    Xóa ({selectedOrders.size})
                  </>
                )}
              </button>
            )}
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="p-4 bg-gray-50 border-t border-[#c3c4c7] grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Trạng thái</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                >
                  <option value="all">Tất cả</option>
                  <option value="pending">Chờ xác nhận</option>
                  <option value="processing">Đang xử lý</option>
                  <option value="shipping">Đang giao</option>
                  <option value="delivered">Đã nhận</option>
                  <option value="completed">Thành công</option>
                  <option value="cancelled">Đã hủy</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-2">Hiển thị</label>
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-[#8c8f94] rounded focus:outline-none focus:border-[#2271b1] focus:ring-1 focus:ring-[#2271b1] text-sm"
                >
                  <option value={20}>20 đơn hàng/trang</option>
                  <option value={50}>50 đơn hàng/trang</option>
                  <option value={100}>100 đơn hàng/trang</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-[#c3c4c7] rounded-lg shadow-sm overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="p-12 text-center">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 mb-1">Không tìm thấy đơn hàng</p>
              <p className="text-sm text-gray-500">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</p>
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
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('id')}
                      >
                        <div className="flex items-center gap-1">
                          Mã đơn
                          {sortField === 'id' && (
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
                        onClick={() => handleSort('customerName')}
                      >
                        <div className="flex items-center gap-1">
                          Người dùng
                          {sortField === 'customerName' && (
                            sortOrder === 'asc' ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )
                          )}
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Sản phẩm
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('total')}
                      >
                        <div className="flex items-center gap-1">
                          Tổng tiền
                          {sortField === 'total' && (
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
                        onClick={() => handleSort('status')}
                      >
                        <div className="flex items-center gap-1">
                          Trạng thái
                          {sortField === 'status' && (
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
                        onClick={() => handleSort('createdAt')}
                      >
                        <div className="flex items-center gap-1">
                          Ngày tạo
                          {sortField === 'createdAt' && (
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
                    {paginatedOrders.map((order) => (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          selectedOrders.has(order.id) ? 'bg-blue-50' : ''
                        }`}
                      >
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={selectedOrders.has(order.id)}
                            onChange={() => handleSelectOrder(order.id)}
                            className="w-4 h-4 rounded border-gray-300"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-mono text-sm font-medium text-[#2271b1]">
                            {order.id}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-[#1d2327] text-sm">
                            {order.customerName}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{order.customerEmail}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-gray-700">
                            {order.products.length} sản phẩm
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-[#2271b1]">
                            {order.totalAmount.toLocaleString('vi-VN')}₫
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <select
                              value={order.status}
                              onChange={(e) => {
                                const newStatus = e.target.value as OrderStatus;
                                if (newStatus === 'cancelled') {
                                  setOrderToCancel(order);
                                } else {
                                  handleUpdateStatus(order.id, newStatus);
                                }
                              }}
                              disabled={updatingOrderId === order.id}
                              className={`text-xs font-medium px-2 py-1 rounded border cursor-pointer focus:outline-none disabled:opacity-50 ${getStatusBadgeColor(
                                order.status
                              )}`}
                            >
                              <option value="pending">Chờ xác nhận</option>
                              <option value="processing">Đang xử lý</option>
                              <option value="shipping">Đang giao</option>
                              <option value="delivered">Đã nhận</option>
                              <option value="completed">Thành công</option>
                              <option value="cancelled">Đã hủy</option>
                            </select>
                            {updatingOrderId === order.id && (
                              <Loader2 className="w-3 h-3 animate-spin text-gray-400" />
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Calendar className="w-3 h-3 text-gray-400" />
                            {formatDate(order.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleViewOrder(order)}
                              className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-4 h-4 text-gray-600" />
                            </button>
                            {isAdmin && (
                              <button
                                onClick={() => handleDeleteOrder(order.id)}
                                disabled={deletingOrderId === order.id}
                                className="p-1.5 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Xóa"
                              >
                                {deletingOrderId === order.id ? (
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
              {selectedOrder && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8"
                  onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}>
                  <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in duration-200">
                    <div className="flex items-center justify-between p-8 border-b border-gray-100 bg-gray-50/50">
                      <div>
                        <h2 className="text-2xl font-black text-gray-900 tracking-tight">Chi tiết đơn hàng {selectedOrder.id}</h2>
                        <p className="text-sm text-gray-500 mt-1 font-medium">{getStatusLabel(selectedOrder.status)} • {formatDate(selectedOrder.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {selectedOrder.status === 'pending' && (
                          <>
                            <button onClick={async () => {
                              await handleUpdateStatus(selectedOrder.id, 'processing');
                              setSelectedOrder({ ...selectedOrder, status: 'processing' });
                            }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all text-sm font-bold shadow-sm">
                              Duyệt đơn
                            </button>
                            <button onClick={() => setOrderToCancel(selectedOrder)} className="flex items-center gap-2 px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl transition-all text-sm font-bold shadow-sm">
                              Từ chối
                            </button>
                            <div className="w-px h-6 bg-gray-200 mx-1"></div>
                          </>
                        )}
                        <button onClick={handlePrintOrder} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl transition-all text-sm font-bold shadow-sm">
                          <Printer className="h-4 w-4" /> In hóa đơn
                        </button>
                        <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-200 rounded-xl transition-colors bg-white border border-gray-200 shadow-sm">
                          <X className="h-5 w-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar printable-area">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Thông tin người dùng</h3>
                          <div className="space-y-2">
                            <p className="text-lg font-bold text-gray-900">{selectedOrder.customerName}</p>
                            <div className="space-y-1.5">
                              <p className="text-sm flex items-center gap-2.5 text-gray-600 font-medium"><Mail className="h-4 w-4 text-gray-400" /> {selectedOrder.customerEmail}</p>
                              <p className="text-sm flex items-center gap-2.5 text-gray-600 font-medium"><Phone className="h-4 w-4 text-gray-400" /> {selectedOrder.phoneNumber}</p>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-4">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Vận chuyển đến</h3>
                          <div className="space-y-2">
                            <p className="text-sm font-bold text-gray-900 leading-relaxed">{selectedOrder.shippingAddress}</p>
                            {(selectedOrder.addressLine || selectedOrder.ward) && (
                              <p className="text-xs text-gray-500 font-medium leading-relaxed italic">
                                {[selectedOrder.addressLine, selectedOrder.ward, selectedOrder.district, selectedOrder.city].filter(Boolean).join(', ')}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Danh sách sản phẩm</h3>
                        <div className="space-y-3">
                          {selectedOrder.products.map((product) => {
                            const pObj = products.find(x => x.id === product.id);
                            return (
                              <div key={product.id} className="flex items-center gap-5 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-blue-200 transition-colors">
                                <div className="w-20 h-20 bg-white rounded-xl overflow-hidden flex-shrink-0 shadow-sm border border-gray-100">
                                  <img src={(pObj?.images?.length ? pObj.images[0] : (pObj?.image || '')) || 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?w=100'} alt={product.name} className="w-full h-full object-cover" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-base font-bold text-gray-900 truncate">{product.name}</div>
                                  <div className="text-sm text-gray-500 mt-1 font-medium flex items-center gap-2">
                                    Số lượng: <span className="text-gray-900 font-bold px-2 py-0.5 bg-white rounded-lg border border-gray-100 shadow-sm">{product.quantity}</span> 
                                    <span className="text-gray-300">•</span>
                                    {product.price.toLocaleString('vi-VN')}₫
                                  </div>
                                </div>
                                <div className="text-lg font-black text-[#2271b1]">{(product.price * product.quantity).toLocaleString('vi-VN')}₫</div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4 border-t border-gray-100">
                        <div className="p-5 bg-gray-50 rounded-2xl border border-gray-100">
                          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-3">Ghi chú</h3>
                          <p className="text-sm text-gray-600 italic font-medium leading-relaxed">{selectedOrder.notes || 'Không có ghi chú từ người dùng'}</p>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                            <span>Thành tiền</span>
                            <span className="text-gray-900">{selectedOrder.totalAmount.toLocaleString('vi-VN')}₫</span>
                          </div>
                          <div className="flex justify-between items-center text-sm font-bold text-gray-500">
                            <span>Vận chuyển</span>
                            <span className="text-green-600 uppercase tracking-tighter">Miễn phí</span>
                          </div>
                          <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-4">
                            <span className="text-base font-black text-gray-900">TỔNG CỘNG</span>
                            <span className="text-3xl font-black text-[#2271b1] tabular-nums tracking-tight">{selectedOrder.totalAmount.toLocaleString('vi-VN')}₫</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {totalPages > 1 && (
                <div className="px-4 py-3 border-t border-[#c3c4c7] flex items-center justify-between bg-gray-50">
                  <div className="text-sm text-gray-600">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{' '}
                    {Math.min(currentPage * itemsPerPage, filteredOrders.length)} trong tổng số{' '}
                    {filteredOrders.length} đơn hàng
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

      {orderToCancel && (
        <CancelOrderModal
          orderId={orderToCancel.id}
          isAdmin={true}
          onConfirm={async (reason, note) => {
            try {
              await cancelOrderByCustomer(orderToCancel.id, reason, note);
              toast.success('Đã từ chối đơn hàng với lý do thành công');
              setOrderToCancel(null);
              if (selectedOrder && selectedOrder.id === orderToCancel.id) {
                setSelectedOrder({ ...selectedOrder, status: 'cancelled' });
              }
            } catch (e: any) {
              throw new Error(e.message || 'Không thể hủy đơn');
            }
          }}
          onClose={() => setOrderToCancel(null)}
        />
      )}
    </div>
  );
}
