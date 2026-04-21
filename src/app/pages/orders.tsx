import { useEffect, useMemo, useState } from 'react';
import {
  Package,
  Search,
  Eye,
  X,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ShieldAlert,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useAdminStore, type Order, type OrderStatus } from '../../store/adminStore';
import { toast } from 'sonner';
import { CancelOrderModal, CANCEL_REASONS_USER } from '../components/cancel-order-modal';
import { ORDER_PAYMENT_STATUS_LABELS, canCompleteOrder } from '../../lib/orderFlow';

interface UIOrder {
  id: string;
  date: string;
  total: number;
  status: OrderStatus;
  items: {
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }[];
  shipping: {
    address: string;
    city: string;
    phone: string;
  };
  timeline: TimelineStep[];
  /** Bản ghi đơn đầy đủ (đồng bộ API / store) */
  sourceOrder: Order;
}

type TimelineStep = {
  title: string;
  description: string;
  /** Hiển thị thời gian thực khi bước đã xảy ra; null nếu chưa */
  time: string | null;
  completed: boolean;
};

const statusConfig: Record<
  OrderStatus,
  { label: string; color: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Chờ xác nhận',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: Clock,
  },
  processing: {
    label: 'Đang xử lý',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: Package,
  },
  shipping: {
    label: 'Đang giao',
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    icon: Truck,
  },
  delivered: {
    label: 'Đã nhận',
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    icon: Package,
  },
  completed: {
    label: 'Thành công',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
};

const normEmail = (e: string) => e.trim().toLowerCase();

const fmt = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const splitAddress = (full: string) => {
  const parts = full
    .split(',')
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length <= 2) {
    return { address: full, city: '' };
  }
  const city = parts.slice(-2).join(', ');
  const address = parts.slice(0, -2).join(', ');
  return { address, city };
};

/** Timeline theo mốc thời gian thực từ server (confirmedAt, shippedAt, …) */
function buildTimelineFromOrder(o: Order): TimelineStep[] {
  if (o.trangThai === 'cancelled') {
    return [
      {
        title: 'Đơn hàng đã được đặt',
        description: 'Đơn hàng đã được tiếp nhận',
        time: fmt(o.ngayDat),
        completed: true,
      },
      {
        title: 'Đơn hàng đã hủy',
        description: 'Đơn hàng đã được hủy',
        time: o.cancelledAt ? fmt(o.cancelledAt) : fmt(o.updatedAt),
        completed: true,
      },
    ];
  }

  const s = o.trangThai;

  const step1: TimelineStep = {
    title: 'Đơn hàng đã được đặt',
    description: 'Đơn hàng đã được tiếp nhận và đang chờ xử lý',
    time: fmt(o.ngayDat),
    completed: true,
  };

  const step2: TimelineStep = {
    title: 'Đã xác nhận đơn hàng',
    description: 'Đơn hàng đã được xác nhận và đang chuẩn bị hàng',
    time: o.confirmedAt ? fmt(o.confirmedAt) : null,
    completed: s !== 'pending',
  };

  const step3: TimelineStep = {
    title: 'Đang giao hàng',
    description: 'Đơn hàng đang được vận chuyển đến địa chỉ của bạn',
    time: o.shippedAt ? fmt(o.shippedAt) : null,
    completed: s === 'shipping' || s === 'delivered' || s === 'completed',
  };

  const step4: TimelineStep = {
    title: 'Giao hàng thành công',
    description: 'Đơn hàng đã được giao thành công',
    time: o.deliveredAt ? fmt(o.deliveredAt) : null,
    completed: s === 'delivered' || s === 'completed',
  };

  const step5: TimelineStep = {
    title: 'HoÃ n táº¥t Ä‘Æ¡n hÃ ng',
    description: 'KhÃ¡ch hÃ ng Ä‘Ã£ xÃ¡c nháº­n hoáº·c há»‡ thá»‘ng tá»± Ä‘á»™ng hoÃ n táº¥t',
    time: o.completedAt ? fmt(o.completedAt) : null,
    completed: s === 'completed',
  };

  return [step1, step2, step3, step4, step5];
}

export default function OrdersPage() {
  const { user, isLoggedIn } = useAuthStore();
  const allOrders = useAdminStore((s) => s.orders);
  const products = useAdminStore((s) => s.products);
  const cancelOrderByCustomer = useAdminStore((s) => s.cancelOrderByCustomer);
  const patchOrderCustomerInfo = useAdminStore((s) => s.patchOrderCustomerInfo);
  const updateOrderStatus = useAdminStore((s) => s.updateOrderStatus);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<UIOrder | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editFullName, setEditFullName] = useState('');
  const [editAddressLine, setEditAddressLine] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editDistrict, setEditDistrict] = useState('');
  const [editWard, setEditWard] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // Guard (also protected at router level)
  if (!isLoggedIn || !user) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <ShieldAlert className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-foreground mb-2">Chưa đăng nhập</h2>
        <p className="text-muted-foreground mb-6">Vui lòng đăng nhập để xem đơn hàng</p>
        <a
          href="/login"
          className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        >
          Đăng nhập
        </a>
      </div>
    );
  }

  const myOrders: UIOrder[] = useMemo(() => {
    const mine = allOrders.filter(
      (o) =>
        o.maNguoiDung === user.maNguoiDung ||
        (o.maNguoiDung === 'guest' && normEmail(o.emailNguoiNhan) === normEmail(user.email))
    );

    return mine.map((o) => {
      const items = (o.chiTiet || []).map((line) => {
        const p = products.find((x) => x.maSanPham === line.maSanPham);
        return {
          id: line.maSanPham,
          name: line.tenSanPham,
          quantity: line.soLuong,
          price: line.donGia,
          image: p?.images?.[0] || 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?w=100',
        };
      });

      const addr = splitAddress(o.diaChiGiao || '');
      const lineAddr =
        o.addressLine && o.city
          ? [o.addressLine, o.ward, o.district, o.city].filter(Boolean).join(', ')
          : o.diaChiGiao || '';

      return {
        id: o.maDonHang,
        date: fmt(o.ngayDat),
        total: o.tongTien,
        status: o.trangThai,
        items,
        shipping: {
          address: addr.address || lineAddr,
          city: addr.city || (o.city ? o.city : ''),
          phone: o.sdtNhan,
        },
        timeline: buildTimelineFromOrder(o),
        sourceOrder: o,
      };
    });
  }, [allOrders, products, user.maNguoiDung, user.email]);

  const openDetail = (order: UIOrder) => {
    setSelectedOrder(order);
    const o = order.sourceOrder;
    setEditNotes(o.notes ?? '');
    setEditPhone(o.sdtNhan ?? '');
    setEditFullName(o.tenNguoiNhan ?? '');
    setEditAddressLine(o.addressLine ?? '');
    setEditCity(o.city ?? '');
    setEditDistrict(o.district ?? '');
    setEditWard(o.ward ?? '');
  };

  useEffect(() => {
    if (!selectedOrder) return;
    const next = myOrders.find((m) => m.id === selectedOrder.id);
    if (!next || next.sourceOrder.updatedAt === selectedOrder.sourceOrder.updatedAt) return;
    const o = next.sourceOrder;
    setEditNotes(o.notes ?? '');
    setEditPhone(o.sdtNhan ?? '');
    setEditFullName(o.tenNguoiNhan ?? '');
    setEditAddressLine(o.addressLine ?? '');
    setEditCity(o.city ?? '');
    setEditDistrict(o.district ?? '');
    setEditWard(o.ward ?? '');
    setSelectedOrder(next);
  }, [myOrders, selectedOrder?.id, selectedOrder?.sourceOrder.updatedAt]);

  const filteredOrders = myOrders.filter((order) => {
    const matchesSearch = order.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || order.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Đơn hàng của tôi</h1>
          <p className="text-muted-foreground">Theo dõi và quản lý đơn hàng của bạn</p>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo mã đơn hàng..."
                className="w-full pl-10 pr-4 py-3 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground hover:bg-muted/80'
              }`}
            >
              Tất cả ({myOrders.length})
            </button>
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = myOrders.filter((o) => o.status === status).length;
              return (
                <button
                  key={status}
                  onClick={() => setSelectedFilter(status)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedFilter === status
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-muted/80'
                  }`}
                >
                  {config.label} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-12 text-center">
            <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-foreground mb-2">Không tìm thấy đơn hàng</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? 'Không có đơn hàng nào khớp với từ khóa tìm kiếm'
                : 'Bạn chưa có đơn hàng nào'}
            </p>
            <a
              href="/"
              className="inline-block bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              Khám phá sản phẩm
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => {
              const statusInfo = statusConfig[order.status] || {
                label: 'Đang xử lý (Chờ cập nhật)',
                color: 'bg-gray-100 text-gray-800 border-gray-200',
                icon: Package,
              };
              const StatusIcon = statusInfo.icon;

              return (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Order Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-mono font-bold text-primary text-lg">{order.id}</h3>
                          <span
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusInfo.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">Đặt hàng: {order.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Tổng tiền:</p>
                          <p className="text-xl font-bold text-primary">
                            {order.total.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => openDetail(order)}
                          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="p-6">
                    <div className="flex items-center gap-4 overflow-x-auto">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex items-center gap-3 min-w-[200px]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-lg bg-muted"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                            <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-foreground/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Chi tiết đơn hàng</h2>
                <p className="font-mono text-primary font-medium">{selectedOrder.id}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div>
                <h3 className="font-bold text-foreground mb-3">Trạng thái đơn hàng</h3>
                <span
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border ${
                    (statusConfig[selectedOrder.status] || { color: 'bg-gray-100 text-gray-800 border-gray-200' }).color
                  }`}
                >
                  {(() => {
                    const StatusIcon = (statusConfig[selectedOrder.status] || { icon: Package }).icon;
                    return <StatusIcon className="h-4 w-4" />;
                  })()}
                  {(statusConfig[selectedOrder.status] || { label: 'Đang xử lý (Chờ cập nhật)' }).label}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-lg border border-border p-4 bg-muted/20">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Thanh toÃ¡n</div>
                  <div className="font-semibold text-foreground">
                    {selectedOrder.sourceOrder.paymentMethod === 'online'
                      ? 'Chuyá»ƒn khoáº£n / QR'
                      : 'Thanh toÃ¡n khi nháº­n hÃ ng'}
                  </div>
                </div>
                <div className="rounded-lg border border-border p-4 bg-muted/20">
                  <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">
                    Tráº¡ng thÃ¡i thanh toÃ¡n
                  </div>
                  <div className="font-semibold text-foreground">
                    {ORDER_PAYMENT_STATUS_LABELS[selectedOrder.sourceOrder.paymentStatus ?? 'awaiting_cod']}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              {selectedOrder.timeline && (
                <div>
                  <h3 className="font-bold text-foreground mb-4">Theo dõi đơn hàng</h3>
                  <div className="space-y-4">
                    {selectedOrder.timeline.map((step, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center ${
                              step.completed
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted text-muted-foreground'
                            }`}
                          >
                            {step.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <Clock className="h-5 w-5" />
                            )}
                          </div>
                          {index < selectedOrder.timeline!.length - 1 && (
                            <div
                              className={`w-0.5 h-16 ${
                                step.completed ? 'bg-primary' : 'bg-border'
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <p className="font-medium text-foreground mb-1">{step.title}</p>
                          <p className="text-sm text-muted-foreground mb-1">{step.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {step.time ? `Thời gian: ${step.time}` : 'Chưa có thời điểm'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ghi chú / hủy đơn (chỉ khi chờ xử lý) */}
              {selectedOrder.sourceOrder.trangThai === 'pending' && (
                <div className="space-y-3 border border-border rounded-lg p-4 bg-muted/30">
                  <h3 className="font-bold text-foreground">Chỉnh sửa đơn (chưa xác nhận)</h3>
                  <p className="text-muted-foreground text-sm">
                    Chỉ áp dụng khi đơn còn <strong>chờ xử lý</strong>. Sau khi shop xác nhận, vui lòng liên hệ
                    hotline để đổi địa chỉ.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Họ tên</label>
                      <input
                        value={editFullName}
                        onChange={(e) => setEditFullName(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Số điện thoại</label>
                      <input
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">Địa chỉ (số nhà, đường)</label>
                      <input
                        value={editAddressLine}
                        onChange={(e) => setEditAddressLine(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Tỉnh/Thành phố</label>
                      <input
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground">Quận/Huyện</label>
                      <input
                        value={editDistrict}
                        onChange={(e) => setEditDistrict(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">Phường/Xã</label>
                      <input
                        value={editWard}
                        onChange={(e) => setEditWard(e.target.value)}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background text-sm"
                      />
                    </div>
                  </div>
                  <textarea
                    value={editNotes}
                    onChange={(e) => setEditNotes(e.target.value)}
                    rows={3}
                    placeholder="Ghi chú cho shop (đóng gói, giờ giao...)"
                    className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
                  />
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={savingNotes}
                      onClick={async () => {
                        setSavingNotes(true);
                        try {
                          await patchOrderCustomerInfo(selectedOrder.id, {
                            notes: editNotes,
                            phone: editPhone,
                            fullName: editFullName,
                            address: editAddressLine,
                            city: editCity,
                            district: editDistrict,
                            ward: editWard,
                          });
                          toast.success('Đã cập nhật đơn hàng');
                        } catch (e: unknown) {
                          toast.error(e instanceof Error ? e.message : 'Không thể lưu');
                        } finally {
                          setSavingNotes(false);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium disabled:opacity-60"
                    >
                      {savingNotes ? 'Đang lưu…' : 'Lưu thay đổi'}
                    </button>
                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={() => setShowCancelModal(true)}
                      className="px-4 py-2 rounded-lg border border-destructive text-destructive text-sm font-medium hover:bg-destructive/10 disabled:opacity-60"
                    >
                      {cancelling ? 'Đang xử lý…' : 'Hủy đơn hàng'}
                    </button>
                  </div>
                </div>
              )}

              {selectedOrder.sourceOrder.trangThai !== 'pending' && (
                <div>
                  <h3 className="font-bold text-foreground mb-2">Ghi chú</h3>
                  <p className="text-sm text-muted-foreground rounded-lg border border-border p-3 bg-muted/20">
                    {selectedOrder.sourceOrder.notes?.trim() || 'Không có ghi chú'}
                  </p>
                </div>
              )}

              {/* Hiển thị lý do hủy */}
              {selectedOrder.sourceOrder.trangThai === 'cancelled' && selectedOrder.sourceOrder.cancelReason && (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-2">
                  <h3 className="font-bold text-destructive flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Lý do hủy đơn
                  </h3>
                  <p className="text-sm font-medium text-foreground">
                    {CANCEL_REASONS_USER.find(r => r.value === selectedOrder.sourceOrder.cancelReason)?.label
                      ?? selectedOrder.sourceOrder.cancelReason}
                  </p>
                  {selectedOrder.sourceOrder.cancelNote && (
                    <p className="text-sm text-muted-foreground bg-background rounded-lg p-3 border border-border">
                      &ldquo;{selectedOrder.sourceOrder.cancelNote}&rdquo;
                    </p>
                  )}
                </div>
              )}

              {/* Products */}
              <div>
                <h3 className="font-bold text-foreground mb-3">Sản phẩm</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                        loading="lazy"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-1">{item.name}</p>
                        <p className="text-sm text-muted-foreground">Số lượng: x{item.quantity}</p>
                      </div>
                      <p className="font-bold text-primary">
                        {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              <div>
                <h3 className="font-bold text-foreground mb-3">Địa chỉ giao hàng</h3>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-foreground mb-1">{selectedOrder.shipping.address}</p>
                  {selectedOrder.shipping.city && (
                    <p className="text-foreground mb-1">{selectedOrder.shipping.city}</p>
                  )}
                  <p className="text-sm text-muted-foreground">SĐT: {selectedOrder.shipping.phone}</p>
                </div>
              </div>

              {/* Total */}
              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground">Tổng cộng:</span>
                  <span className="text-2xl font-bold text-primary">
                    {selectedOrder.total.toLocaleString('vi-VN')}₫
                  </span>
                </div>
              </div>

              {/* Confirm Delivery Button */}
              {selectedOrder.sourceOrder.trangThai === 'delivered' && (
                <div className="border-t border-border pt-4 mt-6 flex justify-end">
                  <button
                    disabled={!canCompleteOrder(selectedOrder.sourceOrder)}
                    onClick={async () => {
                      try {
                        await updateOrderStatus(selectedOrder.id, 'completed');
                        toast.success('Đã hoàn tất đơn hàng');
                        setSelectedOrder((prev) => prev ? { ...prev, status: 'completed', sourceOrder: { ...prev.sourceOrder, trangThai: 'completed', completedAt: new Date().toISOString() } } : null);
                      } catch (e: any) {
                        toast.error(e?.message ?? 'Có lỗi xảy ra khi hoàn tất đơn');
                      }
                    }}
                    className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors shadow flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <CheckCircle className="h-5 w-5" />
                    {canCompleteOrder(selectedOrder.sourceOrder)
                      ? 'Hoàn thành đơn hàng'
                      : 'Chờ shop xác nhận COD'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel Order Modal */}
      {showCancelModal && selectedOrder && (
        <CancelOrderModal
          orderId={selectedOrder.id}
          isAdmin={false}
          onConfirm={async (reason, note) => {
            setCancelling(true);
            try {
              await cancelOrderByCustomer(selectedOrder.id, reason, note);
              toast.success('Đã hủy đơn hàng thành công');
              setShowCancelModal(false);
              setSelectedOrder(null);
            } catch (e: unknown) {
              throw e;
            } finally {
              setCancelling(false);
            }
          }}
          onClose={() => setShowCancelModal(false)}
        />
      )}
    </div>
  );
}
