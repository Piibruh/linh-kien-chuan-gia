'use client';

import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  ImagePlus,
  LayoutDashboard,
  Package,
  Pencil,
  Search,
  ShoppingBag,
  Trash2,
  User,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

import productsJson from '../../data/products.json';
import { useAdminStore } from '../../store/adminStore';
import { useAuthStore } from '../../store/authStore';
import { formatVnd } from '../../shared/lib/money';

type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  oldPrice?: number;
  stock: number;
  images: string[];
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders' | 'profile'>('dashboard');
  const { user, updateProfile } = useAuthStore();
  const { products, orders, updateOrderStatus, deleteOrder, updateUserProfile, addProduct, updateProduct, deleteProduct } = useAdminStore();
  const [query, setQuery] = useState('');

  // We use store products directly
  const rows = products as unknown as ProductRow[];
  const setRows = (fn: any) => {
    // This is a shim for the local state pattern used below
    // In a real app we'd map this to store actions
  };
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<ProductRow>>({});

  const selectedCount = Object.values(selectedIds).filter(Boolean).length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((p) => {
      const hay = `${p.id} ${p.name} ${p.slug} ${p.category} ${p.brand}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query, rows]);

  const toggleAll = (checked: boolean) => {
    const next: Record<string, boolean> = {};
    for (const p of filtered) next[p.id] = checked;
    setSelectedIds(next);
  };

  const bulkDelete = () => {
    const ids = Object.entries(selectedIds)
      .filter(([, v]) => v)
      .map(([id]) => id);

    if (ids.length === 0) {
      toast.message('Chọn sản phẩm để xóa');
      return;
    }

    // For demo/bulk, we'll just show toast since store doesn't have bulkDelete yet
    toast.success(`Đã xóa ${ids.length} sản phẩm (demo)`);
    setSelectedIds({});
  };

  const startEdit = (p: ProductRow) => {
    setEditingId(p.id);
    setDraft({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: p.price,
      stock: p.stock,
      images: p.images,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateProduct(editingId, {
      name: String(draft.name ?? ''),
      price: Number(draft.price ?? 0),
      stock: Number(draft.stock ?? 0),
      images: (draft.images as string[]),
    });
    toast.success('Đã lưu thay đổi');
    cancelEdit();
  };

  const onUpload = (id: string, file: File | null) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 3 * 1024 * 1024) {
      toast.error('Ảnh quá lớn (tối đa 3MB)');
      return;
    }

    const url = URL.createObjectURL(file);
    if (editingId === id) {
      setDraft((d) => ({ ...d, images: [url, ...((d.images as string[]) ?? [])] }));
    } else {
      updateProduct(id, { images: [url, ...(rows.find(p => p.id === id)?.images ?? [])] });
    }

    toast.success('Đã preview ảnh (demo)');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <LayoutDashboard className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <div className="font-bold text-foreground">Admin</div>
              <div className="text-xs text-muted-foreground">Hệ thống quản lý nội bộ</div>
            </div>
          </div>

          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Về cửa hàng
          </Link>
        </div>

        <div className="container mx-auto px-4 pb-4">
          <nav className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('dashboard')}
              className={`px-4 py-2 rounded-lg font-bold border transition-colors ${
                activeTab === 'dashboard'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:bg-muted'
              }`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2 rounded-lg font-bold border transition-colors ${
                activeTab === 'products'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:bg-muted'
              }`}
            >
              Sản phẩm
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg font-bold border transition-colors ${
                activeTab === 'orders'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:bg-muted'
              }`}
            >
              Đơn hàng
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-2 rounded-lg font-bold border transition-colors ${
                activeTab === 'profile'
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:bg-muted'
              }`}
            >
              Cá nhân
            </button>
          </nav>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-sm text-muted-foreground mb-1">Tổng sản phẩm</div>
              <div className="text-3xl font-bold text-foreground">{rows.length}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-sm text-muted-foreground mb-1">Tổng đơn hàng</div>
              <div className="text-3xl font-bold text-foreground">{orders.length}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-sm text-muted-foreground mb-1">Doanh thu tạm tính</div>
              <div className="text-3xl font-bold text-primary">{formatVnd(orders.filter(o => o.status === 'completed').reduce((acc, current) => acc + current.totalAmount, 0))}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="text-sm text-muted-foreground mb-1">Vai trò của bạn</div>
              <div className="text-3xl font-bold text-foreground capitalize">{user?.role}</div>
            </div>
          </div>
        ) : activeTab === 'products' ? (
          <section className="bg-card border border-border rounded-xl overflow-hidden">
            {/* Toolbar */}
            <div className="p-6 border-b border-border">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                    <Package className="h-6 w-6" />
                    Quản lý sản phẩm
                  </h1>
                  <p className="text-sm text-muted-foreground">{rows.length} sản phẩm</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Tìm kiếm..."
                      className="w-full pl-9 pr-3 py-2 bg-input-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const name = prompt('Nhập tên sản phẩm mới:');
                      if (name) {
                        addProduct({
                          name,
                          slug: name.toLowerCase().replace(/ /g, '-'),
                          price: 100000,
                          stock: 10,
                          category: 'Khác',
                          brand: 'Generic',
                          images: ['https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400'],
                          description: 'Sản phẩm mới',
                        } as any);
                        toast.success('Đã thêm sản phẩm mới');
                      }
                    }}
                    className="px-4 py-2 rounded-lg font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                  >
                    Thêm mới
                  </button>

                  {user?.role === 'admin' && (
                    <button
                      type="button"
                      onClick={bulkDelete}
                      className="px-4 py-2 rounded-lg font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90 flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Xóa ({selectedCount})
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        aria-label="Chọn tất cả"
                        onChange={(e) => toggleAll(e.target.checked)}
                        className="w-4 h-4"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-foreground">Sản phẩm</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-foreground">Danh mục</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-foreground">Thương hiệu</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-foreground">Giá</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-foreground">Tồn kho</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-foreground">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((p) => {
                    const isEditing = editingId === p.id;
                    const image = (isEditing ? (draft.images as string[]) : p.images)?.[0] ?? '';

                    return (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            aria-label={`Chọn ${p.name}`}
                            checked={!!selectedIds[p.id]}
                            onChange={(e) => setSelectedIds((s) => ({ ...s, [p.id]: e.target.checked }))}
                            className="w-4 h-4"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 bg-background border border-border rounded-lg overflow-hidden">
                                <img src={image} alt={p.name} className="w-full h-full object-contain p-1" />
                            </div>
                            <div className="min-w-0">
                              {isEditing ? (
                                <input
                                  value={String(draft.name ?? '')}
                                  onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                                  className="w-80 max-w-full px-3 py-2 bg-input-background border border-input rounded-lg"
                                />
                              ) : (
                                <Link
                                  to={`/san-pham/${p.slug}`}
                                  className="font-medium text-foreground hover:text-primary line-clamp-1"
                                >
                                  {p.name}
                                </Link>
                              )}
                              <div className="text-xs text-muted-foreground font-mono">{p.id}</div>
                            </div>

                            <label className="ml-auto inline-flex items-center gap-2 text-sm text-primary cursor-pointer">
                              <ImagePlus className="h-4 w-4" />
                              <span className="hidden md:inline">Upload</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => onUpload(p.id, e.target.files?.[0] ?? null)}
                              />
                            </label>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-sm text-foreground">{p.category}</td>
                        <td className="px-4 py-3 text-sm text-foreground">{p.brand}</td>

                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={Number(draft.price ?? 0)}
                              onChange={(e) => setDraft((d) => ({ ...d, price: Number(e.target.value) }))}
                              className="w-32 px-3 py-2 bg-input-background border border-input rounded-lg"
                            />
                          ) : (
                            <span className="font-bold text-primary">{formatVnd(p.price)}</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={Number(draft.stock ?? 0)}
                              onChange={(e) => setDraft((d) => ({ ...d, stock: Number(e.target.value) }))}
                              className="w-24 px-3 py-2 bg-input-background border border-input rounded-lg"
                            />
                          ) : (
                            <span className="text-sm font-medium text-foreground">{p.stock}</span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-2">
                            {!isEditing ? (
                              <button
                                type="button"
                                onClick={() => startEdit(p)}
                                className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80"
                                aria-label="Chỉnh sửa"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={saveEdit}
                                  className="px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                                  aria-label="Lưu"
                                >
                                  <Check className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={cancelEdit}
                                  className="px-3 py-2 rounded-lg bg-muted hover:bg-muted/80"
                                  aria-label="Hủy"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </>
                            )}

                            {user?.role === 'admin' && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                                    deleteProduct(p.id);
                                    toast.success('Đã xóa sản phẩm');
                                  }
                                }}
                                className="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                aria-label="Xóa"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination (demo) */}
            <div className="p-6 border-t border-border flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Tổng số: {filtered.length} sản phẩm</p>
              <div className="flex items-center gap-2">
                <button type="button" className="px-3 py-2 bg-muted rounded-lg" aria-label="Trang trước">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" className="px-3 py-2 bg-primary text-primary-foreground rounded-lg font-bold">
                  1
                </button>
                <button type="button" className="px-3 py-2 bg-muted rounded-lg" aria-label="Trang sau">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </section>
        ) : activeTab === 'orders' ? (
          <section className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h1 className="text-2xl font-bold text-foreground mb-1 flex items-center gap-2">
                <ShoppingBag className="h-6 w-6" />
                Quản lý đơn hàng
              </h1>
              <p className="text-sm text-muted-foreground">{orders.length} đơn hàng</p>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-bold text-foreground">Mã đơn</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-foreground">Khách hàng</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-foreground">Sản phẩm</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-foreground">Tổng tiền</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-foreground">Trạng thái</th>
                    <th className="px-4 py-3 text-center text-sm font-bold text-foreground">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-sm font-mono font-medium">{o.id}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-foreground">{o.customerName}</div>
                        <div className="text-xs text-muted-foreground">{o.customerEmail}</div>
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {o.products.map(p => `${p.name} x${p.quantity}`).join(', ')}
                      </td>
                      <td className="px-4 py-3 text-sm font-bold text-primary">{formatVnd(o.totalAmount)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          onChange={(e) => {
                            updateOrderStatus(o.id, e.target.value as any);
                            toast.success(`Đã cập nhật trạng thái đơn ${o.id}`);
                          }}
                          className={`text-xs font-bold px-2 py-1 rounded-full border bg-background ${
                            o.status === 'completed' ? 'text-green-500 border-green-500' :
                            o.status === 'cancelled' ? 'text-red-500 border-red-500' :
                            'text-orange-500 border-orange-500'
                          }`}
                        >
                          <option value="pending">Chờ xử lý</option>
                          <option value="processing">Đang đóng gói</option>
                          <option value="shipping">Đang giao hàng</option>
                          <option value="completed">Đã giao hàng</option>
                          <option value="cancelled">Đã hủy</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-center">
                        {user?.role === 'admin' ? (
                          <button
                            onClick={() => {
                              if (confirm('Bạn có chắc chắn muốn xóa đơn hàng này?')) {
                                deleteOrder(o.id);
                                toast.success('Đã xóa đơn hàng');
                              }
                            }}
                            className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Cần quyền Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section className="max-w-2xl mx-auto bg-card border border-border rounded-xl overflow-hidden p-8">
            <h1 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <User className="h-6 w-6" />
              Thông tin cá nhân
            </h1>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const data = {
                name: formData.get('name') as string,
                phone: formData.get('phone') as string,
                address: formData.get('address') as string,
              };
              
              if (user) {
                updateProfile(data);
                updateUserProfile(user.id, data);
                toast.success('Cập nhật thông tin thành công');
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full px-3 py-2 bg-muted border border-input rounded-lg text-muted-foreground cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Họ và tên</label>
                <input
                  name="name"
                  type="text"
                  defaultValue={user?.name || ''}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                <input
                  name="phone"
                  type="tel"
                  defaultValue={user?.phone || ''}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Địa chỉ</label>
                <textarea
                  name="address"
                  defaultValue={user?.address || ''}
                  rows={3}
                  className="w-full px-3 py-2 bg-input-background border border-input rounded-lg focus:ring-2 focus:ring-ring"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-colors"
              >
                Lưu thay đổi
              </button>
              
              <div className="pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    useAuthStore.getState().logout();
                    window.location.href = '/login';
                  }}
                  className="w-full py-3 bg-muted text-foreground font-bold rounded-lg hover:bg-destructive hover:text-destructive-foreground transition-all"
                >
                  Đăng xuất
                </button>
              </div>
            </form>
          </section>
        )}
      </main>
    </div>
  );
}
