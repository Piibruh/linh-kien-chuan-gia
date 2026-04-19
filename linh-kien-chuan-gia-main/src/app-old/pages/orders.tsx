'use client';
import { useEffect, useState } from 'react';
import { Package, Search, Eye, X, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'pending' | 'processing' | 'shipping' | 'completed' | 'cancelled';
  items: {
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
  timeline?: {
    status: string;
    description: string;
    date: string;
    completed: boolean;
  }[];
}

const orders: Order[] = [
  {
    id: 'ORD-2026-001',
    date: '30/03/2026 14:30',
    total: 275000,
    status: 'shipping',
    items: [
      {
        name: 'ESP32 DevKit V1',
        quantity: 2,
        price: 95000,
        image: 'https://images.unsplash.com/photo-1634452015397-ad0686a2ae2d?w=100',
      },
      {
        name: 'DHT22 Sensor',
        quantity: 1,
        price: 85000,
        image: 'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?w=100',
      },
    ],
    shipping: {
      address: '123 Đường ABC, Phường 1',
      city: 'Quận 1, TP. Hồ Chí Minh',
      phone: '0912345678',
    },
    timeline: [
      {
        status: 'Đơn hàng đã được đặt',
        description: 'Đơn hàng đã được tiếp nhận và đang chờ xử lý',
        date: '30/03/2026 14:30',
        completed: true,
      },
      {
        status: 'Đã xác nhận đơn hàng',
        description: 'Đơn hàng đã được xác nhận và đang chuẩn bị hàng',
        date: '30/03/2026 15:00',
        completed: true,
      },
      {
        status: 'Đang giao hàng',
        description: 'Đơn hàng đang được vận chuyển đến địa chỉ của bạn',
        date: '30/03/2026 18:00',
        completed: true,
      },
      {
        status: 'Giao hàng thành công',
        description: 'Đơn hàng đã được giao thành công',
        date: 'Dự kiến 31/03/2026',
        completed: false,
      },
    ],
  },
  {
    id: 'ORD-2026-002',
    date: '28/03/2026 10:15',
    total: 235000,
    status: 'completed',
    items: [
      {
        name: 'Arduino UNO R3',
        quantity: 1,
        price: 235000,
        image: 'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?w=100',
      },
    ],
    shipping: {
      address: '123 Đường ABC, Phường 1',
      city: 'Quận 1, TP. Hồ Chí Minh',
      phone: '0912345678',
    },
  },
  {
    id: 'ORD-2026-003',
    date: '25/03/2026 16:45',
    total: 89000,
    status: 'completed',
    items: [
      {
        name: 'Raspberry Pi Pico',
        quantity: 1,
        price: 89000,
        image: 'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?w=100',
      },
    ],
    shipping: {
      address: '123 Đường ABC, Phường 1',
      city: 'Quận 1, TP. Hồ Chí Minh',
      phone: '0912345678',
    },
  },
  {
    id: 'ORD-2026-004',
    date: '20/03/2026 09:20',
    total: 180000,
    status: 'cancelled',
    items: [
      {
        name: 'ESP8266 NodeMCU',
        quantity: 2,
        price: 65000,
        image: 'https://images.unsplash.com/photo-1634452015397-ad0686a2ae2d?w=100',
      },
      {
        name: 'Breadboard 830',
        quantity: 2,
        price: 22000,
        image: 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?w=100',
      },
    ],
    shipping: {
      address: '123 Đường ABC, Phường 1',
      city: 'Quận 1, TP. Hồ Chí Minh',
      phone: '0912345678',
    },
  },
];

const statusConfig = {
  pending: {
    label: 'Chờ xử lý',
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
  completed: {
    label: 'Hoàn tất',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Đã hủy',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle,
  },
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (!selectedOrder) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedOrder(null);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedOrder]);

  const filteredOrders = orders.filter((order) => {
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
              Tất cả ({orders.length})
            </button>
            {Object.entries(statusConfig).map(([status, config]) => {
              const count = orders.filter((o) => o.status === status).length;
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
              const statusInfo = statusConfig[order.status];
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
                        <p className="text-sm text-muted-foreground">
                          Đặt hàng: {order.date}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground mb-1">Tổng tiền:</p>
                          <p className="text-xl font-bold text-primary">
                            {order.total.toLocaleString('vi-VN')}₫
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedOrder(order)}
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
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              x{item.quantity}
                            </p>
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
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`Chi tiết đơn hàng ${selectedOrder.id}`}
            className="bg-card border border-border rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-1">Chi tiết đơn hàng</h2>
                <p className="font-mono text-primary font-medium">{selectedOrder.id}</p>
              </div>
              <button
                type="button"
                aria-label="Đóng"
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
                    statusConfig[selectedOrder.status].color
                  }`}
                >
                  {(() => {
                    const StatusIcon = statusConfig[selectedOrder.status].icon;
                    return <StatusIcon className="h-4 w-4" />;
                  })()}
                  {statusConfig[selectedOrder.status].label}
                </span>
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
                          <p className="font-medium text-foreground mb-1">{step.status}</p>
                          <p className="text-sm text-muted-foreground mb-1">
                            {step.description}
                          </p>
                          <p className="text-xs text-muted-foreground">{step.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              <div>
                <h3 className="font-bold text-foreground mb-3">Sản phẩm</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 bg-muted rounded-lg"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-medium text-foreground mb-1">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Số lượng: x{item.quantity}
                        </p>
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
                  <p className="text-foreground mb-1">{selectedOrder.shipping.city}</p>
                  <p className="text-sm text-muted-foreground">
                    SĐT: {selectedOrder.shipping.phone}
                  </p>
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
