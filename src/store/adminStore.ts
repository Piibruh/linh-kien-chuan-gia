import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './productStore';
import { User, UserRole, useAuthStore } from './authStore';
import { mapPrismaOrderToStore } from '../lib/orderMap';
import type { OrderPaymentMethod, OrderPaymentStatus, OrderStatus } from '../lib/orderFlow';

// Normalize product images
const CATEGORY_IMAGES: Record<string, string> = {
  'Vi điều khiển':
    'https://images.unsplash.com/photo-1651231960369-3c31ab2a490c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  'Cảm biến':
    'https://images.unsplash.com/photo-1662528730018-45ff5ffb6c67?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  Module:
    'https://images.unsplash.com/photo-1627694743581-f31765d5c631?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  'Linh kiện cơ bản':
    'https://images.unsplash.com/photo-1759500657339-6e11b99a8882?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
  'Phụ kiện':
    'https://images.unsplash.com/photo-1524234107056-1c1f48f64ab8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&w=400',
};

const normalizeProduct = (p: any): Product & any => {
  const cat = p.category || p.maDanhMuc || 'Phụ kiện';
  const imgs = Array.isArray(p.images) && p.images.length > 0 ? p.images : (p.image ? [p.image] : []);
  const mappedImgs = imgs.map((img: string) =>
    img.startsWith('/') ? CATEGORY_IMAGES[cat] ?? CATEGORY_IMAGES['Phụ kiện'] : img
  );

  return {
    ...p,
    maSanPham: p.maSanPham || p.id || p.slug || '',
    tenSanPham: p.tenSanPham || p.name || '',
    maDanhMuc: cat,
    thuongHieu: p.thuongHieu || p.brand || '',
    giaBan: p.giaBan ?? p.price ?? 0,
    soLuongTon: p.soLuongTon ?? p.stock ?? 0,
    moTaKT: p.moTaKT || p.description || '',

    id: p.id || p.maSanPham || p.slug || '',
    name: p.name || p.tenSanPham || '',
    category: cat,
    brand: p.brand || p.thuongHieu || '',
    price: p.price ?? p.giaBan ?? 0,
    stock: p.stock ?? p.soLuongTon ?? 0,
    sold: p.sold ?? 0,
    rating: p.rating ?? 0,
    reviews: p.reviews ?? 0,
    oldPrice: p.oldPrice ?? undefined,
    specs: p.specs || {},
    images: mappedImgs,
    status: p.status || p.trangThai || 'published',
    visibility: p.visibility || p.hienThi || 'public',
    usageGuide: p.usageGuide || p.huongDan || '',
    seoTitle: p.seoTitle ?? '',
    seoDescription: p.seoDescription ?? '',
    seoKeywords: p.seoKeywords ?? '',
    tags: Array.isArray(p.tags) ? p.tags : (typeof p.tags === 'string' ? p.tags.split(',') : []),
    publishDate: p.publishDate || p.ngayXuatBan || '',
    views: p.views ?? p.luotXem ?? 0,
    editCount: p.editCount ?? p.soLanSua ?? 0,
    lastEditedBy: p.lastEditedBy || p.nguoiSuaCuoi || '',
  };
};

const buildAuthHeaders = () => {
  const token = useAuthStore.getState().token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const safeJsonFetch = async (url: string, options: RequestInit = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...buildAuthHeaders(),
    ...(options.headers as Record<string, string>),
  };
  return fetch(url, { ...options, headers });
};

// ✅ Align user orders page + admin orders with a shared status enum
export type { OrderPaymentMethod, OrderPaymentStatus, OrderStatus } from '../lib/orderFlow';

export interface Order {
  maDonHang: string;
  maNguoiDung: string;
  tenNguoiNhan: string;
  emailNguoiNhan: string;
  chiTiet: Array<{
    maSanPham: string;
    tenSanPham: string;
    soLuong: number;
    donGia: number;
  }>;
  tongTien: number;
  trangThai: OrderStatus;
  diaChiGiao: string;
  /** Chi tiết địa chỉ (đồng bộ API) */
  addressLine?: string;
  city?: string;
  district?: string;
  ward?: string;
  sdtNhan: string;
  ngayDat: string;
  updatedAt: string;
  paymentMethod?: OrderPaymentMethod;
  paymentStatus?: OrderPaymentStatus;
  /** Ghi chú đơn hàng (khách) */
  notes?: string | null;
  /** Lý do hủy đơn hàng */
  cancelReason?: string | null;
  /** Ghi chú thêm khi hủy */
  cancelNote?: string | null;
  /** Thời điểm theo từng bước trạng thái (ISO) */
  confirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  completedAt?: string | null;
  cancelledAt?: string | null;
  codCollectedAt?: string | null;
}

export type StoredUser = User & {
  password?: string;
  createdAt?: string;
};

export interface StoreConfig {
  flashSaleThreshold: number;
  flashSaleDurationHours: number;
  flashSaleItems: Array<{ maSanPham: string; flashSalePrice: number }>;
}

export interface CreateOrderPayload {
  maNguoiDung: string;
  tenNguoiNhan: string;
  emailNguoiNhan: string;
  sdtNhan: string;
  diaChiGiao: string;
  chiTiet: Array<{
    maSanPham: string;
    tenSanPham: string;
    soLuong: number;
    donGia: number;
  }>;
  tongTien?: number;
  city?: string;
  district?: string;
  ward?: string;
  notes?: string;
  paymentMethod?: 'cod' | 'online';
  shippingMethod?: string;
  coupon?: string;
  subtotal?: number;
  discount?: number;
  shippingFee?: number;
}

const nowIso = () => new Date().toISOString();

const INITIAL_CATEGORIES: string[] = ['Vi điều khiển', 'Cảm biến', 'Module', 'Linh kiện cơ bản', 'Phụ kiện'];

// Mock API delay
const delay = (ms: number = 500) => new Promise((resolve) => setTimeout(resolve, ms));

const getDefaultPaymentStatus = (
  paymentMethod: OrderPaymentMethod = 'cod'
): OrderPaymentStatus => (paymentMethod === 'cod' ? 'awaiting_cod' : 'paid');

const normalizeOrder = (order: Order): Order => ({
  ...order,
  paymentMethod: order.paymentMethod ?? 'cod',
  paymentStatus: order.paymentStatus ?? getDefaultPaymentStatus(order.paymentMethod ?? 'cod'),
  notes: order.notes ?? null,
  cancelReason: order.cancelReason ?? null,
  cancelNote: order.cancelNote ?? null,
  confirmedAt: order.confirmedAt ?? null,
  shippedAt: order.shippedAt ?? null,
  deliveredAt: order.deliveredAt ?? null,
  completedAt: order.completedAt ?? null,
  cancelledAt: order.cancelledAt ?? null,
  codCollectedAt: order.codCollectedAt ?? null,
});

const applyLocalStatusUpdate = (order: Order, nextStatus: OrderStatus): Order => {
  const now = nowIso();
  const paymentMethod = order.paymentMethod ?? 'cod';
  const paymentStatus = order.paymentStatus ?? getDefaultPaymentStatus(paymentMethod);

  if (nextStatus === 'processing' && order.trangThai === 'pending') {
    return normalizeOrder({
      ...order,
      trangThai: 'processing',
      updatedAt: now,
      confirmedAt: order.confirmedAt ?? now,
    });
  }

  if (nextStatus === 'shipping' && order.trangThai === 'processing') {
    return normalizeOrder({
      ...order,
      trangThai: 'shipping',
      updatedAt: now,
      confirmedAt: order.confirmedAt ?? now,
      shippedAt: now,
    });
  }

  if (nextStatus === 'delivered' && order.trangThai === 'shipping') {
    return normalizeOrder({
      ...order,
      trangThai: 'delivered',
      updatedAt: now,
      deliveredAt: now,
      shippedAt: order.shippedAt ?? now,
    });
  }

  if (nextStatus === 'completed' && order.trangThai === 'delivered' && paymentStatus === 'paid') {
    return normalizeOrder({
      ...order,
      trangThai: 'completed',
      updatedAt: now,
      completedAt: now,
      deliveredAt: order.deliveredAt ?? now,
    });
  }

  if (nextStatus === 'cancelled' && ['pending', 'processing', 'shipping'].includes(order.trangThai)) {
    return normalizeOrder({
      ...order,
      trangThai: 'cancelled',
      updatedAt: now,
      cancelledAt: now,
    });
  }

  throw new Error('Trạng thái đơn hàng không hợp lệ cho bước tiếp theo');
};

const applyLocalPaymentCollection = (order: Order): Order => {
  const now = nowIso();
  return normalizeOrder({
    ...order,
    updatedAt: now,
    paymentMethod: 'cod',
    paymentStatus: 'paid',
    codCollectedAt: now,
  });
};

interface AdminStore {
  // Products
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (maDonHang: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (maDonHang: string) => Promise<void>;
  setProductsFromServer: (products: Product[]) => void;

  // Orders
  orders: Order[];
  createOrder: (payload: CreateOrderPayload) => Promise<Order>;
  updateOrderStatus: (maDonHang: string, status: OrderStatus) => Promise<void>;
  markOrderCodCollected: (maDonHang: string) => Promise<void>;
  deleteOrder: (maDonHang: string) => Promise<void>;
  setOrdersFromServer: (orders: Order[]) => void;
  bootstrapFromApi: () => Promise<void>;
  cancelOrderByCustomer: (maDonHang: string, reason: string, note?: string) => Promise<void>;
  patchOrderCustomerInfo: (
    maDonHang: string,
    payload: Partial<{
      notes: string;
      dienThoai: string;
      fullName: string;
      diaChi: string;
      city: string;
      district: string;
      ward: string;
    }>
  ) => Promise<void>;

  // Categories
  categories: string[];
  addCategory: (hoTen: string) => Promise<{ success: boolean; message: string }>;
  deleteCategory: (hoTen: string) => Promise<{ success: boolean; message: string }>;

  // Users
  users: StoredUser[];
  updateUserRole: (maNguoiDung: string, role: UserRole) => Promise<void>;
  updateUserProfile: (maNguoiDung: string, data: Partial<Pick<StoredUser, 'hoTen' | 'dienThoai' | 'diaChi'>>) => Promise<void>;
  deleteUser: (maNguoiDung: string) => Promise<void>;
  addUser: (user: Omit<StoredUser, 'id' | 'createdAt'>) => Promise<void>;
  updateUserPassword: (
    email: string,
    newPassword: string
  ) => Promise<{ success: boolean; message: string }>;
  storeConfig: StoreConfig;
  updateStoreConfig: (updates: Partial<StoreConfig>) => Promise<void>;
}

export const useAdminStore = create<AdminStore>()(
  persist(
    (set, get) => ({
      // Initial state
      products: [],
      orders: [],
      users: [],
      categories: INITIAL_CATEGORIES,
      storeConfig: {
        flashSaleThreshold: 0.2,
        flashSaleDurationHours: 6,
        flashSaleItems: [],
      },

      // Product operations
      addProduct: async (productData) => {
        const token = useAuthStore.getState().token;
        if (token) {
          const res = await safeJsonFetch('/api/products', {
            method: 'POST',
            body: JSON.stringify(productData),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể thêm sản phẩm');
          }
          const product = normalizeProduct(data.product);
          set((state) => ({ products: [...state.products, product] }));
          return;
        }

        await delay();
        const newProduct: Product = {
          ...productData,
          maDonHang: `SP${String(get().products.length + 1).padStart(3, '0')}`,
        };
        set((state) => ({
          products: [...state.products, newProduct],
        }));
      },

      updateProduct: async (id, updates) => {
        const token = useAuthStore.getState().token;
        if (token) {
          const res = await safeJsonFetch(`/api/products/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify(updates),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể cập nhật sản phẩm');
          }
          const product = normalizeProduct(data.product);
          set((state) => ({
            products: state.products.map((p) => (p.maSanPham === id ? product : p)),
          }));
          return;
        }

        await delay();
        set((state) => ({
          products: state.products.map((p) => (p.maSanPham === id ? { ...p, ...updates } : p)),
        }));
      },

      deleteProduct: async (id) => {
        const token = useAuthStore.getState().token;
        if (token) {
          const res = await safeJsonFetch(`/api/products/${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
          if (!res.ok) {
            throw new Error('Không thể xóa sản phẩm');
          }
          set((state) => ({
            products: state.products.filter((p) => p.maSanPham !== id),
          }));
          return;
        }

        await delay();
        set((state) => ({
          products: state.products.filter((p) => p.maSanPham !== id),
        }));
      },

      setProductsFromServer: (products) => {
        set({ products });
      },

      // Order operations
      createOrder: async (payload) => {
        const trimmedName = payload.tenNguoiNhan.trim();
        const trimmedEmail = payload.emailNguoiNhan.trim();
        const trimmedPhone = payload.sdtNhan.trim();
        const trimmedAddress = (payload.addressLine ?? payload.diaChiGiao).trim();

        if (!payload.maNguoiDung || !trimmedName || !trimmedEmail || !trimmedPhone || !trimmedAddress) {
          throw new Error('Thiếu thông tin khách hàng hoặc địa chỉ giao hàng');
        }
        if (!Array.isArray(payload.chiTiet) || payload.chiTiet.length === 0) {
          throw new Error('Giỏ hàng trống');
        }

        const productsById = new Map(get().products.map((p) => [p.maSanPham, p] as const));
        const token = useAuthStore.getState().token;

        const computedTotal = payload.chiTiet.reduce((sum, p) => sum + p.donGia * p.soLuong, 0);
        const totalAmount = payload.tongTien ?? computedTotal;

        // ── Offline / demo mode fallback (no Express backend) ─────────────────
        const createLocalOrder = (): Order => {
          const orderId = `ORD-${Date.now().toString(36).toUpperCase()}`;
          const now = nowIso();
          const fullAddress = [
            trimmedAddress,
            (payload.ward ?? '').trim(),
            (payload.district ?? '').trim(),
            (payload.city ?? '').trim(),
          ]
            .filter(Boolean)
            .join(', ');
          const newOrder: Order = {
            maDonHang: orderId,
            maNguoiDung: payload.maNguoiDung,
            tenNguoiNhan: trimmedName,
            emailNguoiNhan: trimmedEmail,
            sdtNhan: trimmedPhone,
            diaChiGiao: fullAddress || trimmedAddress,
            notes: payload.notes?.trim() || null,
            chiTiet: payload.chiTiet.map((line) => ({
              maSanPham: line.maSanPham,
              tenSanPham: line.tenSanPham,
              soLuong: line.soLuong,
              donGia: line.donGia,
            })),
            tongTien: Math.round(totalAmount),
            trangThai: 'pending',
            ngayDat: now,
            updatedAt: now,
            paymentMethod: payload.paymentMethod ?? 'cod',
            paymentStatus: getDefaultPaymentStatus(payload.paymentMethod ?? 'cod'),
          };
          const normalized = normalizeOrder(newOrder);
          set((state) => ({ orders: [normalized, ...state.orders] }));
          return normalized;
        };

        // Try to reach the API, fall back to local if unavailable
        try {
          const body = {
            fullName: trimmedName,
            dienThoai: trimmedPhone,
            email: trimmedEmail,
            diaChi: trimmedAddress,
            city: (payload.city ?? '').trim(),
            district: (payload.district ?? '').trim(),
            ward: (payload.ward ?? '').trim(),
            notes: payload.notes?.trim() || undefined,
            paymentMethod: payload.paymentMethod ?? 'cod',
            shippingMethod: payload.shippingMethod ?? 'standard',
            coupon: payload.coupon?.trim() ? payload.coupon.trim() : '',
            subtotal: Math.round(payload.subtotal ?? computedTotal),
            discount: Math.round(payload.discount ?? 0),
            shippingFee: Math.round(payload.shippingFee ?? 0),
            total: Math.round(totalAmount),
            customerId: payload.maNguoiDung,
            items: payload.chiTiet.map((line) => {
              const p = productsById.get(line.maSanPham);
              return {
                maSanPham: line.maSanPham,
                slug: p?.slug ?? line.maSanPham,
                hoTen: line.tenSanPham,
                image: p?.images?.[0] ?? '',
                price: line.donGia,
                quantity: line.soLuong,
              };
            }),
          };

          const res = await fetch('/api/orders', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            body: JSON.stringify(body),
          });

          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            // API returned a real business error — surface it
            throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể tạo đơn hàng');
          }

          const raw = data.order;
          const mapped = normalizeOrder(
            mapPrismaOrderToStore({
              ...raw,
              createdAt:
                typeof raw.createdAt === 'string' ? raw.createdAt : new Date(raw.createdAt).toISOString(),
              updatedAt:
                typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date(raw.updatedAt).toISOString(),
            })
          );

          set((state) => ({ orders: [normalizeOrder(mapped), ...state.orders] }));

          try {
            const pr = await fetch('/api/products');
            if (pr.ok) {
              const { items } = await pr.json();
              set({ products: (items as any[]).map(normalizeProduct) });
            }
          } catch {
            /* ignore */
          }

          return normalizeOrder(mapped);
        } catch (err: any) {
          // Network error or API unavailable → use local demo mode
          if (err?.message && !err.message.includes('Không thể tạo')) {
            return createLocalOrder();
          }
          throw err;
        }
      },

      updateOrderStatus: async (id, status) => {
        const token = useAuthStore.getState().token;
        if (token) {
          try {
            const res = await fetch(`/api/orders/${encodeURIComponent(id)}/status`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ status }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể cập nhật trạng thái');
            }
            const raw = data.order;
            const mapped = normalizeOrder(
              mapPrismaOrderToStore({
                ...raw,
                createdAt:
                  typeof raw.createdAt === 'string'
                    ? raw.createdAt
                    : new Date(raw.createdAt).toISOString(),
                updatedAt:
                  typeof raw.updatedAt === 'string'
                    ? raw.updatedAt
                    : new Date(raw.updatedAt).toISOString(),
              })
            );
            set((state) => ({
              orders: state.orders.map((o) => (o.maDonHang === id ? mapped : o)),
            }));
            return;
          } catch (err: any) {
            if (err instanceof Error && err.message.includes('Không thể')) {
              throw err;
            }
          }
        }
        await delay();
        let updatedOrder: Order | null = null;
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.maDonHang !== id) return o;
            updatedOrder = applyLocalStatusUpdate(normalizeOrder(o), status);
            return updatedOrder;
          }),
        }));
        if (!updatedOrder) {
          throw new Error('Không tìm thấy đơn hàng');
        }
      },

      markOrderCodCollected: async (id) => {
        const token = useAuthStore.getState().token;
        if (token) {
          try {
            const res = await fetch(`/api/orders/${encodeURIComponent(id)}/payment`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ collected: true }),
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể xác nhận COD');
            }
            const raw = data.order;
            const mapped = normalizeOrder(
              mapPrismaOrderToStore({
                ...raw,
                createdAt:
                  typeof raw.createdAt === 'string'
                    ? raw.createdAt
                    : new Date(raw.createdAt).toISOString(),
                updatedAt:
                  typeof raw.updatedAt === 'string'
                    ? raw.updatedAt
                    : new Date(raw.updatedAt).toISOString(),
              })
            );
            set((state) => ({
              orders: state.orders.map((o) => (o.maDonHang === id ? mapped : o)),
            }));
            return;
          } catch (err: any) {
            if (err instanceof Error && err.message.includes('Không thể')) {
              throw err;
            }
          }
        }

        await delay();
        let updatedOrder: Order | null = null;
        set((state) => ({
          orders: state.orders.map((o) => {
            if (o.maDonHang !== id) return o;
            updatedOrder = applyLocalPaymentCollection(normalizeOrder(o));
            return updatedOrder;
          }),
        }));
        if (!updatedOrder) {
          throw new Error('Không tìm thấy đơn hàng');
        }
      },

      setOrdersFromServer: (orders) => {
        set({ orders: orders.map(normalizeOrder) });
      },

      bootstrapFromApi: async () => {
        try {
          const pr = await safeJsonFetch('/api/products');
          if (pr.ok) {
            const data = await pr.json();
            const productsList = data.products || data.items || [];
            set({ products: (productsList as any[]).map(normalizeProduct) });
          }
          const token = useAuthStore.getState().token;
          if (token) {
            const [or, us] = await Promise.all([
              safeJsonFetch('/api/orders'),
              safeJsonFetch('/api/users'),
            ]);
            if (or.ok) {
              const { orders } = await or.json();
              set({
                orders: (orders as any[]).map((o) =>
                  normalizeOrder(
                    mapPrismaOrderToStore({
                      ...o,
                      createdAt:
                        typeof o.ngayDat === 'string'
                          ? o.ngayDat
                          : new Date(o.ngayDat).toISOString(),
                      updatedAt:
                        typeof o.updatedAt === 'string'
                          ? o.updatedAt
                          : new Date(o.updatedAt).toISOString(),
                    })
                  )
                ),
              });
            }
            if (us.ok) {
              const { users } = await us.json();
              set({ users });
            }
          }
        } catch {
          /* offline */
        }
      },

      cancelOrderByCustomer: async (id, reason, note) => {
        const token = useAuthStore.getState().token;
        if (!token) throw new Error('Chưa đăng nhập');

        // Offline / demo mode — cancel locally
        const localCancel = () => {
          const now = nowIso();
          set((state) => ({
            orders: state.orders.map((o) =>
              o.maDonHang === id
                ? normalizeOrder({
                    ...o,
                    trangThai: 'cancelled' as OrderStatus,
                    cancelReason: reason,
                    cancelNote: note ?? null,
                    updatedAt: now,
                    cancelledAt: now,
                  })
                : o
            ),
          }));
        };

        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(id)}/cancel`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reason, note }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (res.status === 401) {
              // Token invalid — still allow local cancel in demo mode
              localCancel();
              return;
            }
            throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể hủy đơn');
          }
          const raw = data.order;
          const mapped = normalizeOrder(
            mapPrismaOrderToStore({
              ...raw,
              createdAt:
                typeof raw.createdAt === 'string' ? raw.createdAt : new Date(raw.createdAt).toISOString(),
              updatedAt:
                typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date(raw.updatedAt).toISOString(),
            })
          );
          set((state) => ({
            orders: state.orders.map((o) => (o.maDonHang === id ? mapped : o)),
          }));
          try {
            const pr = await fetch('/api/products');
            if (pr.ok) {
              const { items } = await pr.json();
              set({ products: (items as any[]).map(normalizeProduct) });
            }
          } catch {
            /* ignore */
          }
        } catch (err: any) {
          // Network / API unavailable → local cancel
          if (err?.message && !err.message.includes('Không thể hủy')) {
            localCancel();
            return;
          }
          throw err;
        }
      },

      patchOrderCustomerInfo: async (id, payload) => {
        const token = useAuthStore.getState().token;
        if (!token) throw new Error('Chưa đăng nhập');

        // Offline / demo mode — patch locally
        const localPatch = () => {
          set((state) => ({
            orders: state.orders.map((o) =>
              o.maDonHang === id
                ? normalizeOrder({
                    ...o,
                    customerName: payload.fullName ?? o.tenNguoiNhan,
                    phoneNumber: payload.phone ?? o.sdtNhan,
                    addressLine: payload.address ?? o.addressLine,
                    city: payload.city ?? o.city,
                    district: payload.district ?? o.district,
                    ward: payload.ward ?? o.ward,
                    shippingAddress: [
                      payload.address ?? o.addressLine,
                      payload.ward ?? o.ward,
                      payload.district ?? o.district,
                      payload.city ?? o.city,
                    ]
                      .filter(Boolean)
                      .join(', '),
                    notes: payload.notes ?? o.notes,
                    updatedAt: nowIso(),
                  })
                : o
            ),
          }));
        };

        try {
          const res = await fetch(`/api/orders/${encodeURIComponent(id)}/customer`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            if (res.status === 401) {
              // Token expired/invalid → fall back to local update
              localPatch();
              return;
            }
            throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể cập nhật đơn');
          }
          const raw = data.order;
          const mapped = normalizeOrder(
            mapPrismaOrderToStore({
              ...raw,
              createdAt:
                typeof raw.createdAt === 'string' ? raw.createdAt : new Date(raw.createdAt).toISOString(),
              updatedAt:
                typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date(raw.updatedAt).toISOString(),
            })
          );
          set((state) => ({
            orders: state.orders.map((o) => (o.maDonHang === id ? mapped : o)),
          }));
        } catch (err: any) {
          // Network error → local patch
          if (err?.message && !err.message.includes('Không thể cập nhật')) {
            localPatch();
            return;
          }
          throw err;
        }
      },

      deleteOrder: async (id) => {
        const token = useAuthStore.getState().token;
        if (token) {
          const res = await safeJsonFetch(`/api/orders/${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
          if (!res.ok) {
            throw new Error('Không thể xóa đơn hàng');
          }
          set((state) => ({
            orders: state.orders.filter((o) => o.maDonHang !== id),
          }));
          return;
        }

        await delay();
        set((state) => ({
          orders: state.orders.filter((o) => o.maDonHang !== id),
        }));
      },

      // Category operations
      addCategory: async (name) => {
        await delay(300);
        const trimmed = name.trim();
        if (!trimmed) return { success: false, message: 'Tên danh mục không được để trống' };
        const exists = get().categories.some((c) => c.toLowerCase() === trimmed.toLowerCase());
        if (exists) return { success: false, message: 'Danh mục này đã tồn tại' };
        set((state) => ({ categories: [...state.categories, trimmed] }));
        return { success: true, message: 'Thêm danh mục thành công' };
      },

      deleteCategory: async (name) => {
        await delay(300);
        const count = get().products.filter((p) => p.category === name).length;
        if (count > 0) {
          return {
            success: false,
            message: `Không thể xóa: Danh mục "${name}" đang có ${count} sản phẩm`,
          };
        }
        set((state) => ({
          categories: state.categories.filter((c) => c !== name),
        }));
        return { success: true, message: `Đã xóa danh mục "${name}"` };
      },

      // User operations
      updateUserRole: async (id, role) => {
        const token = useAuthStore.getState().token;
        if (token) {
          const res = await safeJsonFetch(`/api/users/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể cập nhật vai trò');
          }
          set((state) => ({
            users: state.users.map((u) => (u.maNguoiDung === id ? { ...u, role } : u)),
          }));
          return;
        }

        await delay();
        set((state) => ({
          users: state.users.map((u) => (u.maNguoiDung === id ? { ...u, role } : u)),
        }));
      },

      updateUserProfile: async (id, data) => {
        const token = useAuthStore.getState().token;
        if (token) {
          const res = await safeJsonFetch(`/api/users/${encodeURIComponent(id)}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
          });
          const response = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(typeof response?.error === 'string' ? response.error : 'Không thể cập nhật người dùng');
          }
          const updated = response.user;
          set((state) => ({
            users: state.users.map((u) => (u.maNguoiDung === id ? { ...u, ...updated } : u)),
          }));
          return;
        }

        await delay(250);
        set((state) => ({
          users: state.users.map((u) => (u.maNguoiDung === id ? { ...u, ...data } : u)),
        }));
      },

      deleteUser: async (id) => {
        const token = useAuthStore.getState().token;
        if (token) {
          const res = await safeJsonFetch(`/api/users/${encodeURIComponent(id)}`, {
            method: 'DELETE',
          });
          if (!res.ok) {
            throw new Error('Không thể xóa người dùng');
          }
          set((state) => ({
            users: state.users.filter((u) => u.maNguoiDung !== id),
          }));
          return;
        }

        await delay();
        set((state) => ({
          users: state.users.filter((u) => u.maNguoiDung !== id),
        }));
      },

      addUser: async (userData) => {
        const token = useAuthStore.getState().token;
        if (token) {
          const res = await safeJsonFetch('/api/users', {
            method: 'POST',
            body: JSON.stringify(userData),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            throw new Error(typeof data?.error === 'string' ? data.error : 'Không thể thêm người dùng');
          }
          const newUser = data.user as StoredUser;
          set((state) => ({ users: [...state.users, newUser] }));
          return;
        }

        await delay();
        const newUser: StoredUser = {
          ...userData,
          maDonHang: `u${get().users.length + 1}`,
          createdAt: nowIso(),
        };
        set((state) => ({
          users: [...state.users, newUser],
        }));
      },

      updateUserPassword: async (email, newPassword) => {
        await delay(300);
        const normalizedEmail = email.trim().toLowerCase();
        const found = get().users.find((u) => u.email.toLowerCase() === normalizedEmail);
        if (!found) {
          return { success: false, message: 'Email không tồn tại trong hệ thống' };
        }
        set((state) => ({
          users: state.users.map((u) =>
            u.email.toLowerCase() === normalizedEmail ? { ...u, password: newPassword.trim() } : u
          ),
        }));
        return { success: true, message: 'Đổi mật khẩu thành công' };
      },

      updateStoreConfig: async (updates) => {
        set((state) => ({
          storeConfig: { ...state.storeConfig, ...updates }
        }));
      },
    }),
    {
      hoTen: 'electro-admin',
      merge: (persistedState: any, currentState: any) => {
        if (!persistedState) return currentState;
        // Preserve persisted arrays (products, orders, users, categories)
        // so that deletes are not overwritten by initial data
        return {
          ...currentState,
          ...persistedState,
          // Only use persisted arrays if they exist; never re-seed from INITIAL data
          products: persistedState.products ? persistedState.products.map(normalizeProduct) : currentState.products,
          orders: (persistedState.orders ?? currentState.orders).map(normalizeOrder),
          users: persistedState.users ? persistedState.users.map(normalizeUser) : currentState.users,
          categories: persistedState.categories ?? currentState.categories,
          storeConfig: persistedState.storeConfig ?? currentState.storeConfig,
        };
      },
    }
  )
);

/**
 * Hook to get products with effective prices applied (e.g. Flash Sale).
 * Use this in the storefront to automatically show flash sale prices across the app.
 */
export function useEffectiveProducts() {
  const { products, storeConfig } = useAdminStore();
  const currentProducts = products;

  const flashSaleEndStr = localStorage.getItem('electro-flash-sale-end');
  const flashSaleEnd = flashSaleEndStr ? parseInt(flashSaleEndStr, 10) : 0;
  const isFsActive = !isNaN(flashSaleEnd) && flashSaleEnd > Date.now();

  // If Flash Sale is not active, return original products
  if (!isFsActive) return currentProducts;

  const manualPrices = new Map<string, number>(
    (storeConfig.flashSaleItems || []).map(i => [i.maSanPham || i.productId, i.flashSalePrice])
  );
  
  const threshold = storeConfig.flashSaleThreshold ?? 0.2;

  return currentProducts.map(p => {
    // Priority 1: Manual Admin Setting
    if (manualPrices.has(p.maSanPham)) {
      const fsPrice = manualPrices.get(p.maSanPham)!;
      if (fsPrice < p.giaBan) {
        return {
          ...p,
          oldPrice: p.giaBan,
          giaBan: fsPrice
        };
      }
    }

    // Priority 2: Auto-threshold (if product already has a significant discount)
    if (p.oldPrice && p.oldPrice > p.giaBan) {
      const pct = (p.oldPrice - p.giaBan) / p.oldPrice;
      if (pct >= threshold) {
        return p; 
      }
    }

    return p;
  });
}
