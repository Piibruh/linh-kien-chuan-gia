import { useState, useEffect } from 'react';
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
  Eye,
  Edit,
  Trash2,
  LogOut,
  ShieldAlert,
  Sun,
  Moon,
  Plus,
  X,
  Loader2,
  Save,
  Mail,
  Phone,
  MapPin,
  Printer,
  Zap,
  Flame,
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router';
import { useAuthStore, UserRole } from '../../store/authStore';
import { useThemeStore } from '../../store/themeStore';
import { useAdminStore, Order, OrderStatus, StoredUser } from '../../store/adminStore';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  title: string;
  value: string;
  change: string;
  icon: React.ElementType;
  color: string;
}

type SidebarItem = { id: string; label: string; icon: React.ElementType };

// ─── Sidebar items with required permissions ─────────────────────────────────
const sidebarItems: (SidebarItem & { permission?: string })[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'view_dashboard' },
  { id: 'products', label: 'Sản phẩm', icon: Package, permission: 'manage_products' },
  { id: 'discounts', label: 'Giảm giá', icon: Zap, permission: 'manage_discounts' },
  { id: 'categories', label: 'Danh mục', icon: FolderTree, permission: 'manage_categories' },
  { id: 'orders', label: 'Đơn hàng', icon: ShoppingCart, permission: 'manage_orders' },
  { id: 'customers', label: 'Người dùng', icon: Users, permission: 'manage_accounts' },
  { id: 'settings', label: 'Cài đặt', icon: Settings, permission: 'manage_settings' },
];

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipping: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-teal-100 text-teal-800 border-teal-200',
  completed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const statusLabels = {
  pending: 'Chờ xác nhận',
  processing: 'Đang xử lý',
  shipping: 'Đang giao',
  delivered: 'Đã nhận',
  completed: 'Thành công',
  cancelled: 'Đã hủy',
};

const CATEGORY_IMAGES: Record<string, string> = {
  'Vi điều khiển': 'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?w=400',
  'Cảm biến': 'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?w=400',
  'Module': 'https://images.unsplash.com/photo-1627694743581-f31765d5c631?w=400',
  'Linh kiện cơ bản': 'https://images.unsplash.com/photo-1759500657339-6e11b99a8882?w=400',
  'Phụ kiện': 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?w=400',
};

// ─── Initial form states ──────────────────────────────────────────────────────
const INITIAL_PRODUCT_FORM = {
  name: '', brand: '', category: '', price: '', oldPrice: '',
  stock: '', description: '', imageUrl: '',
};

const INITIAL_CATEGORY_FORM = { name: '' };

const INITIAL_USER_FORM = {
  id: '', name: '', email: '', phone: '', address: '', password: '', confirmPassword: '', role: 'user' as UserRole,
};

// ─── Role Labels ──────────────────────────────────────────────────────────────
const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin:         { label: 'Quản trị viên', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  product_staff: { label: 'NV Quản lý SP', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  order_staff:   { label: 'NV Quản lý Đơn', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  staff:         { label: 'Nhân viên', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  user:          { label: 'Khách hàng', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isLoggedIn, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const {
    products, orders, users, categories,
    updateOrderStatus, deleteOrder,
    addProduct, deleteProduct,
    addCategory, deleteCategory,
    addUser, updateUserRole, updateUserProfile, deleteUser,
    storeConfig, updateStoreConfig
  } = useAdminStore();

  // ── UI state (ALL hooks before any conditional return) ─────────────────────
  const [activeSection, setActiveSection] = useState(() => {
    const tab = searchParams.get('tab');
    return tab || 'dashboard';
  });
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedUser, setSelectedUser] = useState<StoredUser | null>(null);

  const handleViewOrder = (order: Order) => setSelectedOrder(order);
  const handleViewUser = (u: StoredUser) => setSelectedUser(u);

  const handlePrintOrder = () => {
    window.print();
  };

  // Sync with URL (?tab=...)
  useEffect(() => {
    const tab = searchParams.get('tab') || 'dashboard';
    if (tab !== activeSection) {
      setActiveSection(tab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setSection = (sectionId: string) => {
    setActiveSection(sectionId);
    if (sectionId === 'dashboard') {
      navigate('/admin', { replace: true });
    } else {
      navigate(`/admin?tab=${encodeURIComponent(sectionId)}`, { replace: true });
    }
  };

  // ── Add Product modal ──────────────────────────────────────────────────────
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [productForm, setProductForm] = useState(INITIAL_PRODUCT_FORM);
  const [productErrors, setProductErrors] = useState<Partial<typeof INITIAL_PRODUCT_FORM>>({});
  const [productLoading, setProductLoading] = useState(false);

  // ── Add Category modal ─────────────────────────────────────────────────────
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [categoryForm, setCategoryForm] = useState(INITIAL_CATEGORY_FORM);
  const [categoryError, setCategoryError] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);

  // ── Add User modal ─────────────────────────────────────────────────────────
  const [showAddUser, setShowAddUser] = useState(false);
  const [userForm, setUserForm] = useState(INITIAL_USER_FORM);
  const [userErrors, setUserErrors] = useState<Partial<typeof INITIAL_USER_FORM>>({});
  const [userLoading, setUserLoading] = useState(false);
  const [userHistory, setUserHistory] = useState<any[]>([]);

  // ── Settings form state ────────────────────────────────────────────────────
  const [configForm, setConfigForm] = useState({
    ...storeConfig,
    flashSaleItems: storeConfig.flashSaleItems || []
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [selectedFsProduct, setSelectedFsProduct] = useState('');
  const [fsPrice, setFsPrice] = useState('');
  // Product picker modal state
  const [showFsPicker, setShowFsPicker] = useState(false);
  const [fsPickerSearch, setFsPickerSearch] = useState('');
  const [fsPickerCategory, setFsPickerCategory] = useState('all');
  const [fsPriceMap, setFsPriceMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedUser) {
      const token = useAuthStore.getState().token;
      if (token) {
        fetch(`/api/users/${selectedUser.id}/history`, {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => setUserHistory(data.histories || []))
          .catch(() => setUserHistory([]));
      }
    } else {
      setUserHistory([]);
    }
  }, [selectedUser]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.password !== userForm.confirmPassword) {
      return toast.error('Mật khẩu xác nhận không khớp');
    }
    setUserLoading(true);
    try {
      if (userForm.id) {
        // Edit mode
        await updateUserProfile(userForm.id, {
          name: userForm.name,
          phone: userForm.phone,
          address: userForm.address,
        });
        toast.success('Cập nhật tài khoản thành công');
        if (selectedUser && selectedUser.id === userForm.id) {
          setSelectedUser({ ...selectedUser, name: userForm.name, phone: userForm.phone, address: userForm.address });
        }
      } else {
        // Create mode
        await addUser(userForm);
        toast.success('Thêm tài khoản thành công');
      }
      setShowAddUser(false);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu thông tin');
    } finally {
      setUserLoading(false);
    }
  };

  // Close modals on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowAddProduct(false);
        setShowAddCategory(false);
        setShowAddUser(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // ── Auth guard — AFTER all hooks ───────────────────────────────────────────
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Truy cập bị từ chối</h1>
          <p className="text-muted-foreground mb-6">Bạn cần đăng nhập để truy cập trang quản trị</p>
          <a href="/login" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block">
            Đăng nhập
          </a>
        </div>
      </div>
    );
  }

  const staffRoles: UserRole[] = ['admin', 'product_staff', 'order_staff', 'staff'];
  if (!staffRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Không có quyền truy cập</h1>
          <p className="text-muted-foreground mb-6">Tài khoản của bạn không có quyền truy cập trang quản trị</p>
          <a href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block">
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  // ── Permission helpers ─────────────────────────────────────────────────────
  const isAdmin = user.role === 'admin';
  const can = useAuthStore.getState().can;

  // Sidebar items visible to this user
  const visibleSidebarItems = sidebarItems.filter(item =>
    !item.permission || can(item.permission as any)
  );

  // Redirect to first allowed section if current section is not permitted
  useEffect(() => {
    const currentItem = sidebarItems.find(i => i.id === activeSection);
    if (currentItem?.permission && !can(currentItem.permission as any)) {
      const first = visibleSidebarItems[0];
      if (first) setSection(first.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.role, activeSection]);

  // ── Derived data ───────────────────────────────────────────────────────────
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
  const prevMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

  // Revenue & Growth
  const currentMonthOrders = orders.filter(o => {
    const d = new Date(o.ngayDat);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const prevMonthOrders = orders.filter(o => {
    const d = new Date(o.ngayDat);
    return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
  });

  const currentRevenue = currentMonthOrders.reduce((sum, o) => sum + o.tongTien, 0);
  const prevRevenue = prevMonthOrders.reduce((sum, o) => sum + o.tongTien, 0);

  const calculateGrowth = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%';
    const growth = ((current - previous) / previous) * 100;
    return (growth >= 0 ? '+' : '') + growth.toFixed(1) + '%';
  };

  const revenueGrowth = calculateGrowth(currentRevenue, prevRevenue);
  const orderGrowth = calculateGrowth(currentMonthOrders.length, prevMonthOrders.length);

  // User growth
  const currentMonthUsers = users.filter(u => {
    if (!u.createdAt) return false;
    const d = new Date(u.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const prevMonthUsers = users.filter(u => {
    if (!u.createdAt) return false;
    const d = new Date(u.createdAt);
    return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
  });
  const userGrowth = calculateGrowth(currentMonthUsers.length, prevMonthUsers.length);

  // Product growth (newly added)
  const currentMonthProducts = products.filter(p => {
    if (!p.publishDate) return false;
    const d = new Date(p.publishDate);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  });
  const prevMonthProducts = products.filter(p => {
    if (!p.publishDate) return false;
    const d = new Date(p.publishDate);
    return d.getMonth() === prevMonth && d.getFullYear() === prevMonthYear;
  });
  const productGrowth = calculateGrowth(currentMonthProducts.length, prevMonthProducts.length);

  const totalRevenue = orders.reduce((sum, o) => sum + o.tongTien, 0);
  const formattedRevenue = totalRevenue.toLocaleString('vi-VN') + '₫';

  const stats: DashboardStats[] = [
    {
      title: 'Doanh thu tổng',
      value: formattedRevenue,
      change: revenueGrowth,
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
    },
    {
      title: 'Đơn hàng mới (tháng)',
      value: String(currentMonthOrders.length),
      change: orderGrowth,
      icon: ShoppingCart,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Sản phẩm mới (tháng)',
      value: String(currentMonthProducts.length),
      change: productGrowth,
      icon: Package,
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Người dùng mới (tháng)',
      value: String(currentMonthUsers.length),
      change: userGrowth,
      icon: Users,
      color: 'from-orange-500 to-orange-600'
    },
  ];

  const filteredOrders = orders.filter(
    (o) =>
      (o.maDonHang || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.tenNguoiNhan || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.chiTiet.some((p) => p.tenSanPham.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());

    // RBAC: Staff only sees customers ('user' role)
    if (!can('manage_accounts') && u.role !== 'user') return false;

    return matchesSearch;
  });



  // ── Order handlers ─────────────────────────────────────────────────────────
  const handleLogout = () => { logout(); toast.success('Đã đăng xuất thành công'); navigate('/'); };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    const key = `order-${orderId}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
    try {
      await updateOrderStatus(orderId, newStatus);
      toast.success(`Đã cập nhật trạng thái đơn ${orderId} thành "${statusLabels[newStatus]}"`);
    } catch { toast.error('Không thể cập nhật trạng thái'); }
    finally { setLoadingStates((prev) => ({ ...prev, [key]: false })); }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Bạn có chắc muốn xóa đơn hàng ${orderId}?`)) return;
    const key = `delete-order-${orderId}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
    try { await deleteOrder(orderId); toast.success(`Đã xóa đơn hàng ${orderId}`); }
    catch { toast.error('Không thể xóa đơn hàng'); }
    finally { setLoadingStates((prev) => ({ ...prev, [key]: false })); }
  };

  // ── Product handlers ───────────────────────────────────────────────────────
  const handleDeleteProduct = async (maSanPham: string, productName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${productName}"?`)) return;
    const key = `delete-product-${maSanPham}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
    try { await deleteProduct(maSanPham); toast.success(`Đã xóa sản phẩm "${productName}"`); }
    catch { toast.error('Không thể xóa sản phẩm'); }
    finally { setLoadingStates((prev) => ({ ...prev, [key]: false })); }
  };

  const validateProduct = () => {
    const errs: Partial<typeof INITIAL_PRODUCT_FORM> = {};
    if (!productForm.name.trim()) errs.name = 'Vui lòng nhập tên sản phẩm';
    if (!productForm.brand.trim()) errs.brand = 'Vui lòng nhập thương hiệu';
    if (!productForm.category) errs.category = 'Vui lòng chọn danh mục';
    if (!productForm.price || isNaN(Number(productForm.price)) || Number(productForm.price) <= 0)
      errs.price = 'Giá sản phẩm phải > 0';
    if (!productForm.stock || isNaN(Number(productForm.stock)) || Number(productForm.stock) < 0)
      errs.stock = 'Tồn kho phải >= 0';
    setProductErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProduct()) return;
    setProductLoading(true);
    try {
      const slug = productForm.name.trim().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      const imgUrl = productForm.imageUrl.trim() ||
        CATEGORY_IMAGES[productForm.category] ||
        'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?w=400';

      await addProduct({
        name: productForm.name.trim(),
        slug,
        brand: productForm.brand.trim(),
        category: productForm.category,
        price: Number(productForm.price),
        oldPrice: productForm.oldPrice ? Number(productForm.oldPrice) : undefined,
        stock: Number(productForm.stock),
        description: productForm.description.trim() || `${productForm.name.trim()} - chất lượng cao`,
        rating: 0,
        sold: 0,
        specs: {},
        images: [imgUrl],
      });
      toast.success(`Đã thêm sản phẩm "${productForm.name.trim()}" thành công!`);
      setProductForm(INITIAL_PRODUCT_FORM);
      setProductErrors({});
      setShowAddProduct(false);
    } catch { toast.error('Không thể thêm sản phẩm'); }
    finally { setProductLoading(false); }
  };

  // ── Category handlers ──────────────────────────────────────────────────────
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError('');
    if (!categoryForm.name.trim()) { setCategoryError('Vui lòng nhập tên danh mục'); return; }
    setCategoryLoading(true);
    try {
      const result = await addCategory(categoryForm.name.trim());
      if (result.success) {
        toast.success(result.message);
        setCategoryForm(INITIAL_CATEGORY_FORM);
        setShowAddCategory(false);
      } else {
        setCategoryError(result.message);
      }
    } catch { toast.error('Không thể thêm danh mục'); }
    finally { setCategoryLoading(false); }
  };

  const handleDeleteCategory = async (name: string) => {
    const count = products.filter((p) => p.category === name).length;
    if (count > 0) {
      toast.error(`Không thể xóa: Danh mục "${name}" đang có ${count} sản phẩm`);
      return;
    }
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${name}"?`)) return;
    const result = await deleteCategory(name);
    if (result.success) toast.success(result.message);
    else toast.error(result.message);
  };

  // ── User handlers ──────────────────────────────────────────────────────────
  const handleUpdateUserRole = async (userId: string, newRole: UserRole) => {
    const key = `user-${userId}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
    try { await updateUserRole(userId, newRole); toast.success('Đã cập nhật vai trò người dùng'); }
    catch { toast.error('Không thể cập nhật vai trò'); }
    finally { setLoadingStates((prev) => ({ ...prev, [key]: false })); }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Bạn có chắc muốn xóa người dùng "${userName}"?`)) return;
    const key = `delete-user-${userId}`;
    setLoadingStates((prev) => ({ ...prev, [key]: true }));
    try { await deleteUser(userId); toast.success(`Đã xóa người dùng "${userName}"`); }
    catch { toast.error('Không thể xóa người dùng'); }
    finally { setLoadingStates((prev) => ({ ...prev, [key]: false })); }
  };

  const validateUser = () => {
    const errs: Partial<typeof INITIAL_USER_FORM> = {};
    if (!userForm.name.trim()) errs.name = 'Vui lòng nhập họ tên';
    if (!userForm.email.trim()) errs.email = 'Vui lòng nhập email';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userForm.email.trim()))
      errs.email = 'Email không hợp lệ';
    else if (users.some((u) => u.email.toLowerCase() === userForm.email.trim().toLowerCase()))
      errs.email = 'Email đã tồn tại';
    if (!userForm.password) errs.password = 'Vui lòng nhập mật khẩu';
    else if (userForm.password.length < 6) errs.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    if (userForm.password !== userForm.confirmPassword) errs.confirmPassword = 'Mật khẩu xác nhận không khớp';
    setUserErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUser()) return;
    setUserLoading(true);
    try {
      await addUser({
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        phone: userForm.phone.trim(),
        password: userForm.password,
        role: userForm.role,
        address: '',
      });
      toast.success(`Đã thêm người dùng "${userForm.name.trim()}" - có thể đăng nhập ngay!`);
      setUserForm(INITIAL_USER_FORM);
      setUserErrors({});
      setShowAddUser(false);
    } catch { toast.error('Không thể thêm người dùng'); }
    finally { setUserLoading(false); }
  };

  // ── JSX ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Add Product Modal ─────────────────────────────────────────────── */}
      {showAddProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddProduct(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Thêm sản phẩm mới
              </h2>
              <button onClick={() => setShowAddProduct(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddProduct} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tên sản phẩm <span className="text-destructive">*</span></label>
                <input type="text" value={productForm.name}
                  onChange={(e) => { setProductForm((p) => ({ ...p, name: e.target.value })); setProductErrors((er) => ({ ...er, name: '' })); }}
                  placeholder="VD: Arduino UNO R3"
                  className={`w-full px-4 py-2.5 bg-input-background border ${productErrors.name ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`} />
                {productErrors.name && <p className="text-xs text-destructive mt-1">{productErrors.name}</p>}
              </div>
              {/* Brand + Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Thương hiệu <span className="text-destructive">*</span></label>
                  <input type="text" value={productForm.brand}
                    onChange={(e) => { setProductForm((p) => ({ ...p, brand: e.target.value })); setProductErrors((er) => ({ ...er, brand: '' })); }}
                    placeholder="VD: Arduino"
                    className={`w-full px-4 py-2.5 bg-input-background border ${productErrors.brand ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`} />
                  {productErrors.brand && <p className="text-xs text-destructive mt-1">{productErrors.brand}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Danh mục <span className="text-destructive">*</span></label>
                  <select value={productForm.category}
                    onChange={(e) => { setProductForm((p) => ({ ...p, category: e.target.value })); setProductErrors((er) => ({ ...er, category: '' })); }}
                    className={`w-full px-4 py-2.5 bg-input-background border ${productErrors.category ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`}>
                    <option value="">-- Chọn danh mục --</option>
                    {categories.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  {productErrors.category && <p className="text-xs text-destructive mt-1">{productErrors.category}</p>}
                </div>
              </div>
              {/* Price + OldPrice */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Giá bán (₫) <span className="text-destructive">*</span></label>
                  <input type="number" min="0" value={productForm.price}
                    onChange={(e) => { setProductForm((p) => ({ ...p, price: e.target.value })); setProductErrors((er) => ({ ...er, price: '' })); }}
                    placeholder="VD: 235000"
                    className={`w-full px-4 py-2.5 bg-input-background border ${productErrors.price ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`} />
                  {productErrors.price && <p className="text-xs text-destructive mt-1">{productErrors.price}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Giá gốc (₫)</label>
                  <input type="number" min="0" value={productForm.oldPrice}
                    onChange={(e) => setProductForm((p) => ({ ...p, oldPrice: e.target.value }))}
                    placeholder="Nếu có giảm giá"
                    className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
              </div>
              {/* Stock */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tồn kho <span className="text-destructive">*</span></label>
                <input type="number" min="0" value={productForm.stock}
                  onChange={(e) => { setProductForm((p) => ({ ...p, stock: e.target.value })); setProductErrors((er) => ({ ...er, stock: '' })); }}
                  placeholder="VD: 50"
                  className={`w-full px-4 py-2.5 bg-input-background border ${productErrors.stock ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`} />
                {productErrors.stock && <p className="text-xs text-destructive mt-1">{productErrors.stock}</p>}
              </div>
              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">URL Hình ảnh</label>
                <input type="text" value={productForm.imageUrl}
                  onChange={(e) => setProductForm((p) => ({ ...p, imageUrl: e.target.value }))}
                  placeholder="https://... (để trống dùng ảnh mặc định theo danh mục)"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mô tả</label>
                <textarea value={productForm.description}
                  onChange={(e) => setProductForm((p) => ({ ...p, description: e.target.value }))}
                  rows={2} placeholder="Mô tả ngắn về sản phẩm..."
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddProduct(false)}
                  className="flex-1 border border-border px-4 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={productLoading}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {productLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></>
                    : <><Save className="h-4 w-4" /><span>Thêm sản phẩm</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add Category Modal ────────────────────────────────────────────── */}
      {showAddCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddCategory(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <FolderTree className="h-5 w-5 text-primary" /> Thêm danh mục mới
              </h2>
              <button onClick={() => setShowAddCategory(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddCategory} className="p-6 space-y-4">
              {categoryError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive">{categoryError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Tên danh mục <span className="text-destructive">*</span></label>
                <input type="text" value={categoryForm.name} autoFocus
                  onChange={(e) => { setCategoryForm({ name: e.target.value }); setCategoryError(''); }}
                  placeholder="VD: Hiển thị LCD"
                  className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
                <p className="text-xs text-muted-foreground mt-1">Danh mục hiện tại: {categories.join(', ')}</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddCategory(false)}
                  className="flex-1 border border-border px-4 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={categoryLoading}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {categoryLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></>
                    : <><Save className="h-4 w-4" /><span>Thêm danh mục</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Add User Modal ────────────────────────────────────────────────── */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={(e) => e.target === e.currentTarget && setShowAddUser(false)}>
          <div className="bg-card border border-border rounded-xl w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" /> Thêm người dùng mới
              </h2>
              <button onClick={() => setShowAddUser(false)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="p-6 space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Họ và tên <span className="text-destructive">*</span></label>
                <input type="text" value={userForm.hoTen}
                  onChange={(e) => { setUserForm((p) => ({ ...p, hoTen: e.target.value })); setUserErrors((er) => ({ ...er, hoTen: '' })); }}
                  placeholder="Nguyễn Văn A"
                  className={`w-full px-4 py-2.5 bg-input-background border ${userErrors.hoTen ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`} />
                {userErrors.hoTen && <p className="text-xs text-destructive mt-1">{userErrors.hoTen}</p>}
              </div>
              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Email <span className="text-destructive">*</span></label>
                <input type="email" value={userForm.email}
                  onChange={(e) => { setUserForm((p) => ({ ...p, email: e.target.value })); setUserErrors((er) => ({ ...er, email: '' })); }}
                  placeholder="email@example.com"
                  className={`w-full px-4 py-2.5 bg-input-background border ${userErrors.email ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`} />
                {userErrors.email && <p className="text-xs text-destructive mt-1">{userErrors.email}</p>}
              </div>
              {/* Phone + Role */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Số điện thoại</label>
                  <input type="tel" value={userForm.dienThoai}
                    onChange={(e) => setUserForm((p) => ({ ...p, dienThoai: e.target.value }))}
                    placeholder="0912345678"
                    className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1">Vai trò</label>
                  <select value={userForm.role}
                    onChange={(e) => setUserForm((p) => ({ ...p, role: e.target.value as UserRole }))}
                    className="w-full px-4 py-2.5 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="user">👤 Khách hàng</option>
                    <option value="product_staff">📦 NV Quản lý Sản phẩm</option>
                    <option value="order_staff">📝 NV Quản lý Đơn</option>
                    <option value="staff">🧑‍💼 Nhân viên (Chung)</option>
                    <option value="admin">👑 Admin</option>
                  </select>
                </div>
              </div>
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Mật khẩu <span className="text-destructive">*</span></label>
                <input type="password" value={userForm.password}
                  onChange={(e) => { setUserForm((p) => ({ ...p, password: e.target.value })); setUserErrors((er) => ({ ...er, password: '' })); }}
                  placeholder="Ít nhất 6 ký tự"
                  className={`w-full px-4 py-2.5 bg-input-background border ${userErrors.password ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`} />
                {userErrors.password && <p className="text-xs text-destructive mt-1">{userErrors.password}</p>}
              </div>
              {/* Confirm password */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">Xác nhận mật khẩu <span className="text-destructive">*</span></label>
                <input type="password" value={userForm.confirmPassword}
                  onChange={(e) => { setUserForm((p) => ({ ...p, confirmPassword: e.target.value })); setUserErrors((er) => ({ ...er, confirmPassword: '' })); }}
                  placeholder="Nhập lại mật khẩu"
                  className={`w-full px-4 py-2.5 bg-input-background border ${userErrors.confirmPassword ? 'border-destructive' : 'border-input'} rounded-lg focus:outline-none focus:ring-2 focus:ring-ring`} />
                {userErrors.confirmPassword && <p className="text-xs text-destructive mt-1">{userErrors.confirmPassword}</p>}
              </div>
              <p className="text-xs text-muted-foreground bg-muted p-2 rounded">
                💡 Người dùng có thể đăng nhập ngay sau khi được tạo
              </p>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddUser(false)}
                  className="flex-1 border border-border px-4 py-2.5 rounded-lg text-foreground hover:bg-muted transition-colors">
                  Hủy
                </button>
                <button type="submit" disabled={userLoading}
                  className="flex-1 bg-primary text-primary-foreground px-4 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                  {userLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /><span>Đang lưu...</span></>
                    : <><Save className="h-4 w-4" /><span>Thêm người dùng</span></>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Main layout ───────────────────────────────────────────────────── */}
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <aside className={`bg-card border-r border-border transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'} flex flex-col`}>
          <div className="h-16 border-b border-border flex items-center justify-between px-4">
            {!sidebarCollapsed && (
              <div>
                <span className="font-bold text-xl text-primary">Admin Panel</span>
                <div className={`text-xs mt-0.5 font-semibold px-2 py-0.5 rounded-full inline-block ${ROLE_LABELS[user.role]?.color ?? 'text-muted-foreground'}`}>
                  {ROLE_LABELS[user.role]?.label ?? user.role}
                </div>
              </div>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-2 hover:bg-muted rounded-lg transition-colors">
              {sidebarCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {visibleSidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button key={item.id} onClick={() => setSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!sidebarCollapsed && <span className="font-medium">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          <div className="p-4 border-t border-border">
            <div className={`flex items-center gap-3 ${sidebarCollapsed ? 'justify-center' : ''}`}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground font-bold flex-shrink-0">
                {user.name.charAt(0).toUpperCase()}
              </div>
              {!sidebarCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full mt-0.5 inline-block ${ROLE_LABELS[user.role]?.color ?? 'bg-muted text-muted-foreground'}`}>
                    {ROLE_LABELS[user.role]?.label ?? user.role}
                  </span>
                </div>
              )}
            </div>
            {!sidebarCollapsed && (
              <div className="mt-3 flex gap-2">
                <a href="/" className="flex-1 text-center py-1.5 text-xs bg-muted hover:bg-muted/80 rounded-lg transition-colors text-foreground">Trang chủ</a>
                <button onClick={handleLogout}
                  className="flex-1 py-1.5 text-xs bg-destructive/10 hover:bg-destructive/20 text-destructive rounded-lg transition-colors flex items-center justify-center gap-1">
                  <LogOut className="h-3 w-3" /> Thoát
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {/* Header */}
          <header className="h-16 bg-card border-b border-border px-6 flex items-center justify-between sticky top-0 z-10">
            <h1 className="text-2xl font-bold text-foreground">
              {activeSection === 'dashboard' ? 'Dashboard' :
                activeSection === 'products' ? 'Quản lý sản phẩm' :
                  activeSection === 'categories' ? 'Danh mục' :
                    activeSection === 'orders' ? 'Đơn hàng' :
                      activeSection === 'customers' ? 'Người dùng' : 'Cài đặt'}
            </h1>
            <div className="flex items-center gap-4">
              <button onClick={toggleTheme} className="p-2 hover:bg-muted rounded-lg transition-colors"
                title={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'}>
                {theme === 'light' ? <Moon className="h-5 w-5 text-muted-foreground" /> : <Sun className="h-5 w-5 text-muted-foreground" />}
              </button>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Search className="h-5 w-5 text-muted-foreground" />
              </button>
              {can('manage_settings') && (
                <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                  <Settings className="h-5 w-5 text-muted-foreground" />
                </button>
              )}
            </div>
          </header>

          <div className="p-6">
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.title} className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <TrendingUp className="h-4 w-4" />{stat.change}
                        </div>
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
                      <p className="text-sm text-muted-foreground">{stat.title}</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Orders Section */}
            {(activeSection === 'dashboard' || activeSection === 'orders') && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">Đơn hàng gần đây</h2>
                    <button
                      onClick={() => navigate('/admin/orders')}
                      className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm">
                      Xem tất cả
                    </button>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm đơn hàng, người dùng..."
                      className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Mã đơn</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Người dùng</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Sản phẩm</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Số tiền</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Trạng thái</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Ngày</th>
                        <th className="text-center px-6 py-3 text-sm font-medium text-foreground">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredOrders.length === 0 ? (
                        <tr><td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">Không tìm thấy đơn hàng phù hợp</td></tr>
                      ) : (
                        filteredOrders.map((order) => (
                          <tr key={order.maDonHang} className="hover:bg-muted/30 transition-colors">
                            <td className="px-6 py-4"><span className="font-mono text-sm font-medium text-primary">{order.maDonHang}</span></td>
                            <td className="px-6 py-4">
                              <div>
                                <div className="text-sm font-medium text-foreground">{order.tenNguoiNhan}</div>
                                <div className="text-xs text-muted-foreground">{order.emailNguoiNhan}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="text-sm text-muted-foreground line-clamp-1">
                                {order.chiTiet.map((p) => `${p.tenSanPham} (x${p.soLuong})`).join(', ')}
                              </span>
                            </td>
                            <td className="px-6 py-4"><span className="text-sm font-medium text-foreground">{order.tongTien.toLocaleString('vi-VN')}₫</span></td>
                            <td className="px-6 py-4">
                              <select value={order.trangThai}
                                onChange={(e) => handleUpdateOrderStatus(order.maDonHang, e.target.value as OrderStatus)}
                                disabled={loadingStates[`order-${order.maDonHang}`]}
                                className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${statusColors[order.trangThai]}`}>
                                <option value="pending">Chờ xác nhận</option>
                                <option value="processing">Đang xử lý</option>
                                <option value="shipping">Đang giao</option>
                                <option value="delivered">Đã nhận</option>
                                <option value="completed">Thành công</option>
                                <option value="cancelled">Đã hủy</option>
                              </select>
                            </td>
                            <td className="px-6 py-4"><span className="text-sm text-muted-foreground">{new Date(order.ngayDat).toLocaleDateString('vi-VN')}</span></td>
                            <td className="px-6 py-4">
                              <div className="flex items-center justify-center gap-1">
                                <button onClick={() => handleViewOrder(order)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Xem">
                                  <Eye className="h-4 w-4 text-muted-foreground" />
                                </button>
                                {isAdmin && (
                                  <button onClick={() => handleDeleteOrder(order.maDonHang)} disabled={loadingStates[`delete-order-${order.maDonHang}`]}
                                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50" title="Xóa (Admin only)">
                                    {loadingStates[`delete-order-${order.maDonHang}`]
                                      ? <Loader2 className="h-4 w-4 text-destructive animate-spin" />
                                      : <Trash2 className="h-4 w-4 text-destructive" />}
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="p-6 border-t border-border flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Hiển thị {filteredOrders.length} đơn hàng</p>
                  <div className="flex items-center gap-2">
                    <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50">Trước</button>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium">1</button>
                    <button className="px-4 py-2 bg-muted text-foreground rounded-lg hover:bg-muted/80 transition-colors">Sau</button>
                  </div>
                </div>
              </div>
            )}

            {selectedOrder && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
                <div className="bg-card border border-border rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <div>
                      <h2 className="text-xl font-bold text-foreground">Chi tiết đơn hàng {selectedOrder.maDonHang}</h2>
                      <p className="text-sm text-muted-foreground">{statusLabels[selectedOrder.trangThai]} • {new Date(selectedOrder.ngayDat).toLocaleString('vi-VN')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <button onClick={handlePrintOrder} className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors text-sm font-medium">
                        <Plus className="h-4 w-4 rotate-45" /> In hóa đơn
                      </button>
                      <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                  <div className="p-6 space-y-6 printable-area">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Thông tin người dùng</h3>
                        <div className="space-y-1">
                          <p className="text-base font-bold text-foreground">{selectedOrder.tenNguoiNhan}</p>
                          <p className="text-sm flex items-center gap-2 text-muted-foreground"><Mail className="h-3.5 w-3.5" /> {selectedOrder.emailNguoiNhan}</p>
                          <p className="text-sm flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /> {selectedOrder.sdtNhan}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">Địa chỉ giao hàng</h3>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">{selectedOrder.diaChiGiao}</p>
                          {selectedOrder.addressLine && (
                            <p className="text-sm text-muted-foreground">{selectedOrder.addressLine}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {[selectedOrder.ward, selectedOrder.district, selectedOrder.city].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-3 mb-3">Sản phẩm</h3>
                      <div className="space-y-3">
                        {selectedOrder.chiTiet.map((item) => {
                          const pObj = products.find(x => x.maSanPham === item.maSanPham);
                          return (
                            <div key={item.maSanPham} className="flex items-center gap-4 p-3 bg-muted/30 rounded-xl border border-border/50">
                              <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                                <img src={pObj?.images?.length ? pObj.images[0] : (pObj?.image || 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?w=100')} alt={item.tenSanPham} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-foreground truncate">{item.tenSanPham}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">Số lượng: <span className="font-medium text-foreground">{item.soLuong}</span> × {item.donGia.toLocaleString('vi-VN')}₫</div>
                              </div>
                              <div className="text-sm font-bold text-primary">{(item.donGia * item.soLuong).toLocaleString('vi-VN')}₫</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                      <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Ghi chú từ người dùng</h3>
                        <p className="text-sm italic text-muted-foreground whitespace-pre-wrap">{selectedOrder.notes || 'Không có ghi chú'}</p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Tạm tính:</span>
                          <span>{selectedOrder.tongTien.toLocaleString('vi-VN')}₫</span>
                        </div>
                        <div className="flex justify-between text-sm text-muted-foreground">
                          <span>Phí vận chuyển:</span>
                          <span>Miễn phí</span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-border mt-2">
                          <span className="font-bold text-foreground">Tổng cộng:</span>
                          <span className="text-3xl font-black text-primary">{selectedOrder.tongTien.toLocaleString('vi-VN')}₫</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedUser && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6"
                onClick={(e) => e.target === e.currentTarget && setSelectedUser(null)}>
                <div className="bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden">
                  <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-primary-foreground text-xl font-bold">
                        {selectedUser.hoTen.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">{selectedUser.hoTen}</h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${selectedUser.role === 'admin' ? 'bg-red-100 text-red-700' :
                              selectedUser.role === 'staff' ? 'bg-blue-100 text-blue-700' :
                                'bg-gray-100 text-gray-700'
                            }`}>
                            {selectedUser.role}
                          </span>
                          <span className="text-xs text-muted-foreground">ID: {selectedUser.maNguoiDung}</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="p-6 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Email</label>
                        <p className="text-sm font-medium flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> {selectedUser.email}</p>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Số điện thoại</label>
                        <p className="text-sm font-medium flex items-center gap-2"><Phone className="h-4 w-4 text-primary" /> {selectedUser.dienThoai || 'N/A'}</p>
                      </div>
                      <div className="col-span-2 space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Địa chỉ mặc định</label>
                        <p className="text-sm font-medium flex items-center gap-2"><MapPin className="h-4 w-4 text-primary" /> {selectedUser.diaChi || 'Chưa cập nhật địa chỉ'}</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">Lịch sử đơn hàng mới nhất</label>
                      <div className="space-y-2">
                        {orders.filter(o => o.maNguoiDung === selectedUser.maNguoiDung || o.emailNguoiNhan === selectedUser.email).length === 0 ? (
                          <div className="p-4 bg-muted/30 rounded-xl text-center text-sm text-muted-foreground">Chưa có đơn hàng nào</div>
                        ) : (
                          orders.filter(o => o.maNguoiDung === selectedUser.maNguoiDung || o.emailNguoiNhan === selectedUser.email).slice(0, 3).map(o => (
                            <div key={o.maDonHang} className="flex items-center justify-between p-3 bg-muted/30 rounded-xl border border-border/50">
                              <div>
                                <p className="text-xs font-mono font-bold text-primary">{o.maDonHang}</p>
                                <p className="text-[10px] text-muted-foreground">{new Date(o.ngayDat).toLocaleDateString('vi-VN')}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-bold text-foreground">{o.tongTien.toLocaleString('vi-VN')}₫</p>
                                <p className={`text-[9px] font-bold uppercase ${o.trangThai === 'completed' ? 'text-green-600' :
                                    o.trangThai === 'cancelled' ? 'text-red-600' : 'text-blue-600'
                                  }`}>{o.trangThai}</p>
                              </div>
                            </div>
                          ))
                        )}
                        {orders.filter(o => o.maNguoiDung === selectedUser.maNguoiDung || o.emailNguoiNhan === selectedUser.email).length > 3 && (
                          <button onClick={() => { setSelectedUser(null); setSection('orders'); setSearchQuery(selectedUser.email); }}
                            className="w-full text-center py-2 text-xs text-primary hover:underline font-medium">Xem tất cả đơn hàng của người dùng này</button>
                        )}
                      </div>
                    </div>

                    <div className="mt-6">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground block mb-3">Lịch sử chỉnh sửa</label>
                      <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {userHistory.length === 0 ? (
                          <div className="p-3 bg-muted/30 rounded-xl text-center text-xs text-muted-foreground">Không có lịch sử thay đổi</div>
                        ) : (
                          userHistory.map(h => (
                            <div key={h.id} className="p-3 bg-muted/30 rounded-xl border border-border/50">
                              <div className="flex justify-between items-start mb-1 text-xs">
                                <span className="font-bold text-foreground">{h.action === 'created' ? 'Tạo mới' : 'Cập nhật'}</span>
                                <span className="text-muted-foreground">{new Date(h.createdAt).toLocaleString('vi-VN')}</span>
                              </div>
                              <p className="text-[10px] text-muted-foreground mb-1">Thực hiện bởi: {h.changedByName}</p>
                              {h.changes && Object.keys(h.changes).length > 0 && (
                                <div className="text-[10px] text-muted-foreground mt-1 space-y-1">
                                  {Object.entries(h.changes).map(([k, v]: [string, any]) => (
                                    <div key={k} className="flex gap-1">
                                      <span className="font-medium">{k}:</span>
                                      <span className="line-through opacity-70">{v.old || 'Trống'}</span>
                                      <span>→</span>
                                      <span className="text-primary font-medium">{v.new || 'Trống'}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border mt-6">
                      {can('manage_accounts') && (
                        <button onClick={() => {
                          setUserForm({ ...INITIAL_USER_FORM, id: selectedUser.maNguoiDung, hoTen: selectedUser.hoTen, email: selectedUser.email, dienThoai: selectedUser.dienThoai || '', diaChi: selectedUser.diaChi || '', role: selectedUser.role as UserRole });
                          setShowAddUser(true);
                        }}
                          className="flex-1 bg-primary text-primary-foreground py-2.5 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors">Chỉnh sửa tài khoản</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Products Section */}
            {activeSection === 'products' && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">
                    Quản lý sản phẩm <span className="text-sm font-normal text-muted-foreground">({products.length} sản phẩm)</span>
                  </h2>
                  {can('manage_products') && (
                    <button onClick={() => navigate('/admin/products/add')}
                      className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm flex items-center gap-2">
                      <Plus className="h-4 w-4" /> Thêm sản phẩm
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {products.slice(0, 16).map((product) => (
                    <div key={product.maSanPham} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-muted rounded-lg mb-3 overflow-hidden">
                        <img src={product.images?.length ? product.images[0] : (product.image || 'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?w=100')} alt={product.tenSanPham} className="w-full h-full object-contain bg-[#f5f5f5]" />
                      </div>
                      <h3 className="font-medium text-foreground mb-1 line-clamp-2 min-h-[2.5rem]">{product.tenSanPham}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{product.maDanhMuc}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-primary">{product.giaBan.toLocaleString('vi-VN')}₫</span>
                        <div className="flex gap-1">
                          {can('manage_products') && (
                            <button onClick={() => navigate(`/admin/products/edit?maSanPham=${product.maSanPham}`)} className="p-1.5 hover:bg-muted rounded transition-colors" title="Sửa">
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </button>
                          )}
                          {can('manage_products') && (
                            <button onClick={() => handleDeleteProduct(product.maSanPham, product.tenSanPham)} disabled={loadingStates[`delete-product-${product.maSanPham}`]}
                              className="p-1.5 hover:bg-destructive/10 rounded transition-colors disabled:opacity-50" title="Xóa">
                              {loadingStates[`delete-product-${product.maSanPham}`]
                                ? <Loader2 className="h-4 w-4 text-destructive animate-spin" />
                                : <Trash2 className="h-4 w-4 text-destructive" />}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {products.length > 16 && (
                  <div className="flex items-center justify-center mt-6 gap-4">
                    <p className="text-sm text-muted-foreground">Đang hiển thị 16/{products.length} sản phẩm</p>
                    <button
                      onClick={() => navigate('/admin/products')}
                      className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm"
                    >
                      Xem tất cả sản phẩm
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Categories Section */}
            {activeSection === 'categories' && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">
                    Danh mục sản phẩm <span className="text-sm font-normal text-muted-foreground">({categories.length} danh mục)</span>
                  </h2>
                  {can('manage_categories') && (
                    <div className="flex gap-2">
                      <button onClick={() => navigate('/admin/categories')}
                        className="border border-border px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors text-sm">
                        Xem tất cả
                      </button>
                      <button onClick={() => navigate('/admin/categories/add')}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Thêm danh mục
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categories.map((cat) => (
                    <div key={cat} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                            <FolderTree className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-medium text-foreground">{cat}</h3>
                            <p className="text-sm text-muted-foreground">
                              {products.filter((p) => p.category === cat).length} sản phẩm
                            </p>
                          </div>
                        </div>
                        {can('manage_categories') && (
                          <div className="flex gap-1">
                            <button onClick={() => navigate('/admin/categories')} className="p-2 hover:bg-muted rounded-lg transition-colors">
                              <Edit className="h-4 w-4 text-muted-foreground" />
                            </button>
                            <button onClick={() => handleDeleteCategory(cat)} className="p-2 hover:bg-destructive/10 rounded-lg transition-colors">
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Customers Section */}
            {activeSection === 'customers' && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="p-6 border-b border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-foreground">
                      Quản lý người dùng <span className="text-sm font-normal text-muted-foreground">({users.length} tài khoản)</span>
                    </h2>
                    <div className="flex gap-2">
                      {can('manage_accounts') && (
                        <button onClick={() => navigate('/admin/users')}
                          className="border border-border px-4 py-2 rounded-lg font-medium hover:bg-muted transition-colors text-sm">
                          Xem tất cả
                        </button>
                      )}
                      <button onClick={() => { setUserForm({ ...INITIAL_USER_FORM, role: 'user' }); setShowAddUser(true); }}
                        className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors text-sm flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Thêm người dùng
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Tìm kiếm người dùng..."
                      className="w-full pl-10 pr-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Tên</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Email</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Số điện thoại</th>
                        <th className="text-left px-6 py-3 text-sm font-medium text-foreground">Vai trò</th>
                        <th className="text-center px-6 py-3 text-sm font-medium text-foreground">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {filteredUsers.map((userItem) => (
                        <tr key={userItem.maNguoiDung} className="hover:bg-muted/30 transition-colors">
                          <td className="px-6 py-4"><span className="text-sm font-medium text-foreground">{userItem.hoTen}</span></td>
                          <td className="px-6 py-4"><span className="text-sm text-muted-foreground">{userItem.email}</span></td>
                          <td className="px-6 py-4"><span className="text-sm text-muted-foreground">{userItem.dienThoai || 'N/A'}</span></td>
                          <td className="px-6 py-4">
                            {can('manage_accounts') ? (
                              <select value={userItem.role}
                                onChange={(e) => handleUpdateUserRole(userItem.maNguoiDung, e.target.value as UserRole)}
                                disabled={loadingStates[`user-${userItem.maNguoiDung}`] || userItem.maNguoiDung === user.maNguoiDung}
                                className={`text-xs font-medium px-2 py-1 rounded-full border cursor-pointer focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed ${ROLE_LABELS[userItem.role]?.color ?? 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                                <option value="admin">👑 Admin</option>
                                <option value="product_staff">📦 NV Quản lý Sản phẩm</option>
                                <option value="order_staff">📝 NV Quản lý Đơn</option>
                                <option value="staff">🧑‍💼 Nhân viên (Chung)</option>
                                <option value="user">👤 Khách hàng</option>
                              </select>
                            ) : (
                              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${userItem.role === 'admin' ? 'bg-red-100 text-red-800 border-red-200' :
                                  userItem.role === 'staff' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                    'bg-gray-100 text-gray-800 border-gray-200'
                                }`}>
                                {userItem.role === 'admin' ? '👑 Admin' : userItem.role === 'staff' ? '🧑‍💼 Nhân viên' : '👤 Người dùng'}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center gap-1">
                              <button onClick={() => setSelectedUser(userItem)} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Xem & Chỉnh sửa">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              </button>
                              {can('manage_accounts') && userItem.maNguoiDung !== user.maNguoiDung && (
                                <button onClick={() => handleDeleteUser(userItem.maNguoiDung, userItem.hoTen)} disabled={loadingStates[`delete-user-${userItem.maNguoiDung}`]}
                                  className="p-2 hover:bg-destructive/10 rounded-lg transition-colors disabled:opacity-50" title="Xóa">
                                  {loadingStates[`delete-user-${userItem.maNguoiDung}`]
                                    ? <Loader2 className="h-4 w-4 text-destructive animate-spin" />
                                    : <Trash2 className="h-4 w-4 text-destructive" />}
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Discounts Section */}
            {activeSection === 'discounts' && can('manage_discounts') && (
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-foreground">Quản lý giảm giá & Flash Sale</h2>
                </div>

                <div className="space-y-6">
                  <div className="border border-border rounded-lg p-6 bg-muted/30">
                    <h3 className="font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                      <Zap className="h-5 w-5 text-destructive" /> Cấu hình Flash Sale
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Tùy chỉnh thông số để hệ thống tự động hiển thị sản phẩm trên Flash Sale, cho phép admin toàn quyền quản trị nội dung tự động.
                    </p>
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      setConfigLoading(true);
                      await updateStoreConfig({
                        flashSaleThreshold: configForm.flashSaleThreshold,
                        flashSaleDurationHours: configForm.flashSaleDurationHours,
                        flashSaleItems: configForm.flashSaleItems
                      });
                      setConfigLoading(false);
                      toast.success('Cập nhật cấu hình thành công!');
                    }} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Ngưỡng giảm giá Flash Sale (%)</label>
                          <input type="number" min="0" max="100" required value={Math.round(configForm.flashSaleThreshold * 100)} onChange={e => setConfigForm({ ...configForm, flashSaleThreshold: Number(e.target.value) / 100 })}
                            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="VD: 20" />
                          <p className="text-xs text-muted-foreground mt-1">Các sản phẩm có % giảm &gt;= mức này sẽ vào Flash Sale.</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium text-foreground mb-1.5 block">Thời gian mỗi phiên (giờ)</label>
                          <input type="number" min="1" required value={configForm.flashSaleDurationHours} onChange={e => setConfigForm({ ...configForm, flashSaleDurationHours: Number(e.target.value) })}
                            className="w-full px-4 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                            placeholder="VD: 6" />
                        </div>
                      </div>

                      <div className="border-t border-border pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                            <Zap className="h-4 w-4 text-orange-500" />
                            Sản phẩm Flash Sale thủ công
                            {configForm.flashSaleItems.length > 0 && (
                              <span className="bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 text-xs font-bold px-2 py-0.5 rounded-full">
                                {configForm.flashSaleItems.length}
                              </span>
                            )}
                          </h4>
                          <button type="button" onClick={() => { setShowFsPicker(true); setFsPickerSearch(''); setFsPickerCategory('all'); }}
                            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm">
                            <Plus className="h-4 w-4" /> Thêm sản phẩm
                          </button>
                        </div>

                        {/* Selected products grid */}
                        {configForm.flashSaleItems.length === 0 ? (
                          <div className="border-2 border-dashed border-border rounded-xl p-10 text-center">
                            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                              <Zap className="h-8 w-8 text-muted-foreground/50" />
                            </div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">Chưa có sản phẩm Flash Sale thủ công</p>
                            <p className="text-xs text-muted-foreground/70">Nhấn "Thêm sản phẩm" để chọn và đặt giá Flash Sale cho từng sản phẩm</p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {configForm.flashSaleItems.map((item, idx) => {
                              const p = products.find(prod => prod.id === item.maSanPham);
                              if (!p) return null;
                              const savePct = Math.round(((p.price - item.flashSalePrice) / p.price) * 100);
                              return (
                                <div key={idx} className="relative bg-card border border-border rounded-xl p-3 flex gap-3 group hover:border-orange-400/60 hover:shadow-md transition-all">
                                  <div className="absolute top-2 right-2">
                                    <button type="button" onClick={() => {
                                      setConfigForm({ ...configForm, flashSaleItems: configForm.flashSaleItems.filter((_, i) => i !== idx) });
                                    }} className="w-6 h-6 bg-destructive/10 hover:bg-destructive text-destructive hover:text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                      <X className="w-3 h-3" />
                                    </button>
                                  </div>
                                  <img src={(p.images?.length ? p.images[0] : (p.image || ''))} alt={p.name} className="w-14 h-14 rounded-lg object-cover flex-shrink-0 border border-border" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-foreground line-clamp-2 leading-tight mb-1">{p.name}</p>
                                    <p className="text-[10px] text-muted-foreground mb-1.5">{p.category}</p>
                                    <div className="flex items-center gap-1.5">
                                      <span className="text-sm font-bold text-orange-500">{item.flashSalePrice.toLocaleString('vi-VN')}₫</span>
                                      <span className="text-xs text-muted-foreground line-through">{p.price.toLocaleString('vi-VN')}₫</span>
                                      <span className="text-[10px] font-bold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 px-1.5 py-0.5 rounded-full">-{savePct}%</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* ─── Product Picker Modal ─── */}
                      {showFsPicker && (() => {
                        const CATS = ['all', ...Array.from(new Set(products.map(p => p.maDanhMuc)))];
                        const filtered = products.filter(p => {
                          const matchCat = fsPickerCategory === 'all' || p.maDanhMuc === fsPickerCategory;
                          const q = fsPickerSearch.toLowerCase().trim();
                          const matchQ = !q || p.tenSanPham.toLowerCase().includes(q) || p.thuongHieu.toLowerCase().includes(q);
                          return matchCat && matchQ;
                        });
                        const alreadyAdded = new Set(configForm.flashSaleItems.map(i => i.maSanPham));
                        return (
                          <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) setShowFsPicker(false); }}>
                            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                            <div className="relative bg-card border border-border rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                              {/* Modal Header */}
                              <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-gradient-to-r from-orange-500/10 to-red-500/10">
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 bg-orange-500 rounded-lg flex items-center justify-center">
                                    <Zap className="h-5 w-5 text-white" />
                                  </div>
                                  <div>
                                    <h3 className="font-bold text-foreground text-base">Chọn sản phẩm Flash Sale</h3>
                                    <p className="text-xs text-muted-foreground">Chọn sản phẩm và nhập giá ưu đãi</p>
                                  </div>
                                </div>
                                <button type="button" onClick={() => setShowFsPicker(false)}
                                  className="w-8 h-8 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors">
                                  <X className="h-4 w-4" />
                                </button>
                              </div>

                              {/* Search + Category Filters */}
                              <div className="px-6 py-4 border-b border-border space-y-3 bg-muted/20">
                                <div className="relative">
                                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                  <input
                                    type="text"
                                    placeholder="Tìm tên sản phẩm, thương hiệu..."
                                    value={fsPickerSearch}
                                    onChange={e => setFsPickerSearch(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400"
                                    autoFocus
                                  />
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                  {CATS.map(cat => (
                                    <button key={cat} type="button"
                                      onClick={() => setFsPickerCategory(cat)}
                                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${fsPickerCategory === cat
                                          ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                          : 'bg-card text-muted-foreground border-border hover:border-orange-400 hover:text-orange-500'
                                        }`}>
                                      {cat === 'all' ? '🔥 Tất cả' : cat}
                                    </button>
                                  ))}
                                </div>
                              </div>

                              {/* Product Grid */}
                              <div className="flex-1 overflow-y-auto px-6 py-4">
                                {filtered.length === 0 ? (
                                  <div className="text-center py-12 text-muted-foreground">
                                    <Search className="h-10 w-10 mx-auto mb-2 opacity-30" />
                                    <p className="text-sm">Không tìm thấy sản phẩm nào</p>
                                  </div>
                                ) : (
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {filtered.map(p => {
                                      const added = alreadyAdded.has(p.id);
                                      const priceVal = fsPriceMap[p.id] || '';
                                      return (
                                        <div key={p.id} className={`border rounded-xl p-3 flex gap-3 transition-all ${added ? 'border-orange-400 bg-orange-50/50 dark:bg-orange-900/10' : 'border-border bg-card hover:border-orange-300 hover:shadow-sm'
                                          }`}>
                                          <div className="relative flex-shrink-0">
                                            <img src={(p.images?.length ? p.images[0] : (p.image || ''))} alt={p.name} className="w-16 h-16 rounded-lg object-cover border border-border" />
                                            {added && (
                                              <div className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-[10px] font-bold">✓</span>
                                              </div>
                                            )}
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-semibold text-foreground line-clamp-2 leading-snug mb-0.5">{p.name}</p>
                                            <div className="flex items-center gap-1.5 mb-2">
                                              <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded">{p.category}</span>
                                              <span className="text-[10px] text-muted-foreground">{p.brand}</span>
                                            </div>
                                            <p className="text-sm font-bold text-foreground mb-2">{p.price.toLocaleString('vi-VN')}₫</p>
                                            {!added ? (
                                              <div className="flex gap-1.5 items-center">
                                                <input
                                                  type="number"
                                                  placeholder="Giá FS..."
                                                  value={priceVal}
                                                  onChange={e => setFsPriceMap({ ...fsPriceMap, [p.id]: e.target.value })}
                                                  className="flex-1 min-w-0 px-2 py-1.5 text-xs border border-input rounded-lg bg-input-background focus:outline-none focus:ring-2 focus:ring-orange-400/50"
                                                />
                                                <button type="button" onClick={() => {
                                                  const pNum = parseInt(fsPriceMap[p.id] || '', 10);
                                                  if (!fsPriceMap[p.id] || isNaN(pNum)) return toast.error('Nhập giá Flash Sale trước!');
                                                  if (pNum >= p.price) return toast.error('Giá Flash Sale phải nhỏ hơn giá gốc!');
                                                  setConfigForm({ ...configForm, flashSaleItems: [...configForm.flashSaleItems, { maSanPham: p.id, flashSalePrice: pNum }] });
                                                  const m = { ...fsPriceMap }; delete m[p.id]; setFsPriceMap(m);
                                                }} className="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-2.5 py-1.5 rounded-lg transition-colors">
                                                  Thêm
                                                </button>
                                              </div>
                                            ) : (
                                              <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-orange-600 dark:text-orange-400">
                                                  ⚡ {configForm.flashSaleItems.find(i => i.maSanPham === p.id)?.flashSalePrice.toLocaleString('vi-VN')}₫
                                                </span>
                                                <button type="button" onClick={() => {
                                                  setConfigForm({ ...configForm, flashSaleItems: configForm.flashSaleItems.filter(i => i.maSanPham !== p.id) });
                                                }} className="text-[10px] text-destructive hover:underline">Gỡ bỏ</button>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Modal Footer */}
                              <div className="px-6 py-4 border-t border-border bg-muted/20 flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                  Đã chọn <span className="font-bold text-orange-500">{configForm.flashSaleItems.length}</span> sản phẩm
                                </p>
                                <button type="button" onClick={() => setShowFsPicker(false)}
                                  className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors shadow-sm">
                                  Xong
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="flex items-center gap-3 pt-6 border-t border-border">
                        <button type="submit" disabled={configLoading}
                          className="bg-primary text-primary-foreground px-6 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors flex items-center gap-2">
                          {configLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                          <Save className="h-4 w-4" /> Lưu cấu hình
                        </button>
                        <button type="button" onClick={() => {
                          localStorage.removeItem('electro-flash-sale-end');
                          toast.success('Đã làm mới bộ đếm Flash Sale! Vui lòng tải lại trang.');
                          setTimeout(() => window.location.reload(), 1500);
                        }} className="border border-border bg-card text-foreground px-4 py-2 rounded-lg font-bold text-sm hover:bg-muted transition-colors flex items-center gap-2">
                          Làm mới bộ đếm
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Flash Sale Preview */}
                  <div className="border border-border rounded-lg p-6 bg-card">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-lg text-foreground flex items-center gap-2">
                        <Flame className="h-5 w-5 text-orange-500" /> Sản phẩm đang hiển thị Flash Sale
                      </h3>
                      <span className="text-xs text-muted-foreground italic">Dựa trên cấu hình hiện tại</span>
                    </div>
                    
                    <div className="space-y-3">
                      {(() => {
                        const threshold = configForm.flashSaleThreshold;
                        const manualIds = new Set(configForm.flashSaleItems.map(i => i.maSanPham));
                        const activeItems = products.filter(p => {
                          if (manualIds.has(p.id)) return true;
                          if (p.oldPrice && p.oldPrice > p.price) {
                            return (p.oldPrice - p.price) / p.oldPrice >= threshold;
                          }
                          return false;
                        }).slice(0, 10);

                        if (activeItems.length === 0) {
                          return <p className="text-sm text-muted-foreground text-center py-4 italic">Không có sản phẩm nào đủ điều kiện Flash Sale hiện tại.</p>;
                        }

                        return (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {activeItems.map(p => {
                              const isManual = manualIds.has(p.id);
                              const mItem = configForm.flashSaleItems.find(i => i.maSanPham === p.id);
                              const displayPrice = isManual ? mItem!.flashSalePrice : p.price;
                              const oldP = isManual ? p.price : (p.oldPrice || p.price);
                              const pct = Math.round(((oldP - displayPrice) / oldP) * 100);

                              return (
                                <div key={p.id} className="flex items-center gap-3 p-3 bg-muted/20 rounded-xl border border-border/50">
                                  <img src={p.images?.length ? p.images[0] : (p.image || '')} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                                    <div className="flex items-center gap-2">
                                      <span className="text-sm font-bold text-primary">{displayPrice.toLocaleString('vi-VN')}₫</span>
                                      <span className="text-[10px] bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full font-bold">-{pct}%</span>
                                      {isManual && <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold uppercase">Thủ công</span>}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                            {products.filter(p => {
                              if (manualIds.has(p.id)) return true;
                              if (p.oldPrice && p.oldPrice > p.price) {
                                return (p.oldPrice - p.price) / p.oldPrice >= threshold;
                              }
                              return false;
                            }).length > 10 && (
                              <p className="text-xs text-muted-foreground text-center col-span-full pt-2">... và nhiều sản phẩm khác</p>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && can('manage_settings') && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Cài đặt hệ thống (Tính năng admin)</h2>
                <div className="space-y-6">
                  <div className="border border-border rounded-lg p-6 bg-muted/30">
                    <h3 className="font-bold text-lg text-foreground mb-4">Cấu hình cửa hàng</h3>
                    <p className="text-sm text-muted-foreground mb-4">Quản lý các thiết lập chung của hệ thống.</p>
                  </div>

                  {/* Keep the mockup ones as hints of future feature */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { title: 'Thông tin cửa hàng', desc: 'Quản lý thông báo, liên hệ, ảnh nền' },
                      { title: 'Phương thức thanh toán', desc: 'Cấu hình cổng thanh toán VNPAY, Momo' },
                    ].map((item) => (
                      <div key={item.title} className="border border-border rounded-lg p-4 opacity-70">
                        <h3 className="font-medium text-foreground mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                        <button onClick={() => toast.info('Chức năng đang phát triển')} className="text-sm text-primary hover:underline">Khám phá sau</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

    </>
  );
}
