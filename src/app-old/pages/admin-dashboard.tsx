'use client';
import { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  Users,
  Settings,
  TrendingUp,
  DollarSign,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
} from 'lucide-react';

interface DashboardStats {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
}

interface Order {
  id: string;
  customerName: string;
  products: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  date: string;
}

const stats: DashboardStats[] = [
  {
    title: 'Doanh thu tháng',
    value: '45.2M',
    change: '+12.5%',
    icon: DollarSign,
    color: 'from-green-500 to-green-600',
  },
  {
    title: 'Đơn hàng mới',
    value: '328',
    change: '+8.2%',
    icon: ShoppingCart,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Sản phẩm bán ra',
    value: '1,249',
    change: '+23.1%',
    icon: Package,
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Khách hàng mới',
    value: '89',
    change: '+5.4%',
    icon: Users,
    color: 'from-orange-500 to-orange-600',
  },
];

const orders: Order[] = [
  {
    id: 'ORD-001',
    customerName: 'Nguyễn Văn A',
    products: 'ESP32 DevKit V1, DHT22',
    amount: 180000,
    status: 'completed',
    date: '30/03/2026',
  },
  {
    id: 'ORD-002',
    customerName: 'Trần Thị B',
    products: 'Arduino UNO R3',
    amount: 235000,
    status: 'processing',
    date: '30/03/2026',
  },
  {
    id: 'ORD-003',
    customerName: 'Lê Văn C',
    products: 'Relay Module, Breadboard',
    amount: 40000,
    status: 'pending',
    date: '29/03/2026',
  },
  {
    id: 'ORD-004',
    customerName: 'Phạm Thị D',
    products: 'ESP8266, OLED Display',
    amount: 130000,
    status: 'completed',
    date: '29/03/2026',
  },
  {
    id: 'ORD-005',
    customerName: 'Hoàng Văn E',
    products: 'Raspberry Pi Pico',
    amount: 89000,
    status: 'cancelled',
    date: '28/03/2026',
  },
  {
    id: 'ORD-006',
    customerName: 'Đặng Thị F',
    products: 'MPU6050, HC-SR04',
    amount: 70000,
    status: 'processing',
    date: '28/03/2026',
  },
  {
    id: 'ORD-007',
    customerName: 'Vũ Văn G',
    products: 'L298N Motor Driver',
    amount: 42000,
    status: 'completed',
    date: '27/03/2026',
  },
  {
    id: 'ORD-008',
    customerName: 'Bùi Thị H',
    products: 'HC-05 Bluetooth, Jumper Wires',
    amount: 113000,
    status: 'pending',
    date: '27/03/2026',
  },
];

type SidebarItem = {
  id: string;
  label: string;
  icon: React.ElementType;
};

const sidebarItems: SidebarItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'products', label: 'Sản phẩm', icon: Package },
  { id: 'categories', label: 'Danh mục', icon: FolderTree },
  { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart },
  { id: 'customers', label: 'Khách hàng', icon: Users },
  { id: 'settings', label: 'Cài đặt', icon: Settings },
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={`bg-card border-r border-border transition-all duration-300 ${
          sidebarCollapsed ? 'w-20' : 'w-64'
        } flex flex-col`}
      >
        {/* Logo */}
        <div className="h-16 border-b border-border flex items-center justify-between px-4">
          {!sidebarCollapsed && (
            <span className="font-bold text-xl text-primary">Admin Panel</span>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-border">
          <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold">
              A
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin User</p>
                <p className="text-xs text-muted-foreground truncate">admin@example.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Search className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="p-2 hover:bg-muted rounded-lg transition-colors">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.title}
                  className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                      <TrendingUp className="h-4 w-4" />
                      {stat.change}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
              );
            })}
          </div>

          {/* Orders Table */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">Đơn hàng gần đây</h2>
                <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors">
                  <Filter className="h-4 w-4" />
                  Lọc
                </button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm đơn hàng..."
                  className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                      Mã đơn
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                      Khách hàng
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                      Sản phẩm
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                      Số tiền
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                      Trạng thái
                    </th>
                    <th className="text-left px-6 py-3 text-sm font-medium text-foreground">
                      Ngày
                    </th>
                    <th className="text-center px-6 py-3 text-sm font-medium text-foreground">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-primary">
                          {order.id}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-foreground">{order.customerName}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground line-clamp-1">
                          {order.products}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-medium text-foreground">
                          {order.amount.toLocaleString('vi-VN')}₫
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${
                            statusColors[order.status]
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-muted-foreground">{order.date}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </button>
                          <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-6 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Hiển thị 1-8 trong tổng số 328 đơn hàng
              </p>
              <div className="flex items-center gap-2">
                <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50">
                  Trước
                </button>
                <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">
                  1
                </button>
                <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                  2
                </button>
                <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                  3
                </button>
                <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">
                  Sau
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
