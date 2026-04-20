import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from './productStore';
import { User, UserRole, useAuthStore } from './authStore';
import productsData from '../data/products.json';
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

const normalizeProduct = (p: any): Product => ({
  ...p,
  oldPrice: p.oldPrice ?? undefined,
  specs: p.specs || {},
  images: (p.images as string[]).map((img: string) =>
    img.startsWith('/') ? CATEGORY_IMAGES[p.category] ?? CATEGORY_IMAGES['Phụ kiện'] : img
  ),
});

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
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: string;
  /** Chi tiết địa chỉ (đồng bộ API) */
  addressLine?: string;
  city?: string;
  district?: string;
  ward?: string;
  phoneNumber: string;
  createdAt: string;
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
  flashSaleItems: Array<{ productId: string; flashSalePrice: number }>;
}

export interface CreateOrderPayload {
  customerId: string;
  customerName: string;
  customerEmail: string;
  phoneNumber: string;
  shippingAddress: string;
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  totalAmount?: number;
  /** Structured address for API */
  addressLine?: string;
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

// Initial mock data
const INITIAL_PRODUCTS: Product[] = (productsData as any[]).map(normalizeProduct);

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'u3',
    customerName: 'Nguyễn Văn A',
    customerEmail: 'nguyenvana@email.com',
    products: [
      { id: 'SP001', name: 'Arduino UNO R3', quantity: 1, price: 235000 },
      { id: 'SP015', name: 'DHT22', quantity: 2, price: 78000 },
    ],
    totalAmount: 391000,
    status: 'completed',
    shippingAddress: '123 Đường ABC, Quận 1, TP.HCM',
    phoneNumber: '0912345678',
    createdAt: '2026-03-30T10:30:00Z',
    updatedAt: '2026-03-30T14:20:00Z',
  },
  {
    id: 'ORD-002',
    customerId: 'u3',
    customerName: 'Trần Thị B',
    customerEmail: 'tranthib@email.com',
    products: [{ id: 'SP001', name: 'Arduino UNO R3', quantity: 1, price: 235000 }],
    totalAmount: 235000,
    status: 'processing',
    shippingAddress: '456 Đường XYZ, Quận 3, TP.HCM',
    phoneNumber: '0987654321',
    createdAt: '2026-03-30T09:15:00Z',
    updatedAt: '2026-03-30T09:15:00Z',
  },
  {
    id: 'ORD-003',
    customerId: 'u3',
    customerName: 'Lê Văn C',
    customerEmail: 'levanc@email.com',
    products: [
      { id: 'SP025', name: 'Relay Module 5V', quantity: 1, price: 25000 },
      { id: 'SP051', name: 'Breadboard 830 điểm', quantity: 1, price: 15000 },
    ],
    totalAmount: 40000,
    status: 'pending',
    shippingAddress: '789 Đường DEF, Quận 5, TP.HCM',
    phoneNumber: '0969000001',
    createdAt: '2026-03-29T16:45:00Z',
    updatedAt: '2026-03-29T16:45:00Z',
  },
  {
    id: 'ORD-004',
    customerId: 'u3',
    customerName: 'Phạm Thị D',
    customerEmail: 'phamthid@email.com',
    products: [
      { id: 'SP004', name: 'ESP8266 NodeMCU', quantity: 1, price: 85000 },
      { id: 'SP030', name: 'OLED Display 0.96', quantity: 1, price: 45000 },
    ],
    totalAmount: 130000,
    status: 'completed',
    shippingAddress: '321 Đường GHI, Quận 7, TP.HCM',
    phoneNumber: '0923456789',
    createdAt: '2026-03-29T11:20:00Z',
    updatedAt: '2026-03-29T15:30:00Z',
  },
  {
    id: 'ORD-005',
    customerId: 'u3',
    customerName: 'Hoàng Văn E',
    customerEmail: 'hoangvane@email.com',
    products: [{ id: 'SP006', name: 'Raspberry Pi Pico', quantity: 1, price: 89000 }],
    totalAmount: 89000,
    status: 'cancelled',
    shippingAddress: '654 Đường JKL, Quận 10, TP.HCM',
    phoneNumber: '0934567890',
    createdAt: '2026-03-28T14:30:00Z',
    updatedAt: '2026-03-28T16:00:00Z',
  },
  {
    id: 'ORD-006',
    customerId: 'u3',
    customerName: 'Đặng Thị F',
    customerEmail: 'dangthif@email.com',
    products: [
      { id: 'SP017', name: 'MPU6050', quantity: 1, price: 35000 },
      { id: 'SP011', name: 'HC-SR04', quantity: 1, price: 35000 },
    ],
    totalAmount: 70000,
    status: 'processing',
    shippingAddress: '987 Đường MNO, Quận Bình Thạnh, TP.HCM',
    phoneNumber: '0945678901',
    createdAt: '2026-03-28T10:10:00Z',
    updatedAt: '2026-03-28T10:10:00Z',
  },
  {
    id: 'ORD-007',
    customerId: 'u3',
    customerName: 'Vũ Văn G',
    customerEmail: 'vuvang@email.com',
    products: [{ id: 'SP027', name: 'L298N Motor Driver', quantity: 1, price: 42000 }],
    totalAmount: 42000,
    status: 'completed',
    shippingAddress: '147 Đường PQR, Quận Tân Bình, TP.HCM',
    phoneNumber: '0956789012',
    createdAt: '2026-03-27T13:25:00Z',
    updatedAt: '2026-03-27T17:45:00Z',
  },
  {
    id: 'ORD-008',
    customerId: 'u3',
    customerName: 'Bùi Thị H',
    customerEmail: 'buithih@email.com',
    products: [
      { id: 'SP029', name: 'HC-05 Bluetooth', quantity: 1, price: 98000 },
      { id: 'SP052', name: 'Jumper Wires 40p', quantity: 1, price: 15000 },
    ],
    totalAmount: 113000,
    status: 'pending',
    shippingAddress: '258 Đường STU, Quận Phú Nhuận, TP.HCM',
    phoneNumber: '0967890123',
    createdAt: '2026-03-27T09:40:00Z',
    updatedAt: '2026-03-27T09:40:00Z',
  },
];

const INITIAL_USERS: StoredUser[] = [
  {
    id: 'u1',
    name: 'Admin System',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    phone: '0912345678',
    address: '123 Đường ABC, Quận 1, TP.HCM',
    createdAt: '2026-03-01T08:00:00Z',
  },
  {
    id: 'u2',
    name: 'Nhân viên Bán hàng',
    email: 'staff@test.com',
    password: 'staff123',
    role: 'staff',
    phone: '0987654321',
    address: '456 Đường XYZ, Quận 3, TP.HCM',
    createdAt: '2026-03-10T08:00:00Z',
  },
  {
    id: 'u_p1',
    name: 'Quản lý Sản phẩm',
    email: 'product@test.com',
    password: 'password123',
    role: 'product_staff',
    phone: '0911222333',
    address: 'Hà Nội',
    createdAt: '2026-04-20T10:00:00Z',
  },
  {
    id: 'u_o1',
    name: 'Quản lý Đơn hàng',
    email: 'order@test.com',
    password: 'password123',
    role: 'order_staff',
    phone: '0944555666',
    address: 'TP.HCM',
    createdAt: '2026-04-20T11:00:00Z',
  },
  {
    id: 'u3',
    name: 'Nguyễn Văn A',
    email: 'user@test.com',
    password: 'user123',
    role: 'user',
    phone: '0969000001',
    address: '789 Đường DEF, Quận 5, TP.HCM',
    createdAt: '2026-03-15T08:00:00Z',
  },
  {
    id: 'u4',
    name: 'Trần Thị B',
    email: 'tranthib@email.com',
    password: 'user123',
    role: 'user',
    phone: '0923456789',
    address: '321 Đường GHI, Quận 7, TP.HCM',
    createdAt: '2026-03-18T08:00:00Z',
  },
  {
    id: 'u5',
    name: 'Lê Văn C',
    email: 'levanc@email.com',
    password: 'user123',
    role: 'user',
    phone: '0934567890',
    address: '654 Đường JKL, Quận 10, TP.HCM',
    createdAt: '2026-03-20T08:00:00Z',
  },
];

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

  if (nextStatus === 'processing' && order.status === 'pending') {
    return normalizeOrder({
      ...order,
      status: 'processing',
      updatedAt: now,
      confirmedAt: order.confirmedAt ?? now,
    });
  }

  if (nextStatus === 'shipping' && order.status === 'processing') {
    return normalizeOrder({
      ...order,
      status: 'shipping',
      updatedAt: now,
      confirmedAt: order.confirmedAt ?? now,
      shippedAt: now,
    });
  }

  if (nextStatus === 'delivered' && order.status === 'shipping') {
    return normalizeOrder({
      ...order,
      status: 'delivered',
      updatedAt: now,
      deliveredAt: now,
      shippedAt: order.shippedAt ?? now,
    });
  }

  if (nextStatus === 'completed' && order.status === 'delivered' && paymentStatus === 'paid') {
    return normalizeOrder({
      ...order,
      status: 'completed',
      updatedAt: now,
      completedAt: now,
      deliveredAt: order.deliveredAt ?? now,
    });
  }

  if (nextStatus === 'cancelled' && ['pending', 'processing', 'shipping'].includes(order.status)) {
    return normalizeOrder({
      ...order,
      status: 'cancelled',
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
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  setProductsFromServer: (products: Product[]) => void;

  // Orders
  orders: Order[];
  createOrder: (payload: CreateOrderPayload) => Promise<Order>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  markOrderCodCollected: (id: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  setOrdersFromServer: (orders: Order[]) => void;
  bootstrapFromApi: () => Promise<void>;
  cancelOrderByCustomer: (id: string, reason: string, note?: string) => Promise<void>;
  patchOrderCustomerInfo: (
    id: string,
    payload: Partial<{
      notes: string;
      phone: string;
      fullName: string;
      address: string;
      city: string;
      district: string;
      ward: string;
    }>
  ) => Promise<void>;

  // Categories
  categories: string[];
  addCategory: (name: string) => Promise<{ success: boolean; message: string }>;
  deleteCategory: (name: string) => Promise<{ success: boolean; message: string }>;

  // Users
  users: StoredUser[];
  updateUserRole: (id: string, role: UserRole) => Promise<void>;
  updateUserProfile: (id: string, data: Partial<Pick<StoredUser, 'name' | 'phone' | 'address'>>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
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
      products: INITIAL_PRODUCTS,
      orders: INITIAL_ORDERS.map(normalizeOrder),
      users: INITIAL_USERS,
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
          id: `SP${String(get().products.length + 1).padStart(3, '0')}`,
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
            products: state.products.map((p) => (p.id === id ? product : p)),
          }));
          return;
        }

        await delay();
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updates } : p)),
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
            products: state.products.filter((p) => p.id !== id),
          }));
          return;
        }

        await delay();
        set((state) => ({
          products: state.products.filter((p) => p.id !== id),
        }));
      },

      setProductsFromServer: (products) => {
        set({ products });
      },

      // Order operations
      createOrder: async (payload) => {
        const trimmedName = payload.customerName.trim();
        const trimmedEmail = payload.customerEmail.trim();
        const trimmedPhone = payload.phoneNumber.trim();
        const trimmedAddress = (payload.addressLine ?? payload.shippingAddress).trim();

        if (!payload.customerId || !trimmedName || !trimmedEmail || !trimmedPhone || !trimmedAddress) {
          throw new Error('Thiếu thông tin khách hàng hoặc địa chỉ giao hàng');
        }
        if (!Array.isArray(payload.products) || payload.products.length === 0) {
          throw new Error('Giỏ hàng trống');
        }

        const productsById = new Map(get().products.map((p) => [p.id, p] as const));
        const token = useAuthStore.getState().token;

        const computedTotal = payload.products.reduce((sum, p) => sum + p.price * p.quantity, 0);
        const totalAmount = payload.totalAmount ?? computedTotal;

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
            id: orderId,
            customerId: payload.customerId,
            customerName: trimmedName,
            customerEmail: trimmedEmail,
            phoneNumber: trimmedPhone,
            shippingAddress: fullAddress || trimmedAddress,
            addressLine: trimmedAddress,
            city: (payload.city ?? '').trim(),
            district: (payload.district ?? '').trim(),
            ward: (payload.ward ?? '').trim(),
            notes: payload.notes?.trim() || null,
            products: payload.products.map((line) => ({
              id: line.id,
              name: line.name,
              quantity: line.quantity,
              price: line.price,
            })),
            totalAmount: Math.round(totalAmount),
            status: 'pending',
            createdAt: now,
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
            phone: trimmedPhone,
            email: trimmedEmail,
            address: trimmedAddress,
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
            customerId: payload.customerId,
            items: payload.products.map((line) => {
              const p = productsById.get(line.id);
              return {
                productId: line.id,
                slug: p?.slug ?? line.id,
                name: line.name,
                image: p?.images?.[0] ?? '',
                price: line.price,
                quantity: line.quantity,
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
              orders: state.orders.map((o) => (o.id === id ? mapped : o)),
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
            if (o.id !== id) return o;
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
              orders: state.orders.map((o) => (o.id === id ? mapped : o)),
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
            if (o.id !== id) return o;
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
            const { items } = await pr.json();
            set({ products: (items as any[]).map(normalizeProduct) });
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
                        typeof o.createdAt === 'string'
                          ? o.createdAt
                          : new Date(o.createdAt).toISOString(),
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
              o.id === id
                ? normalizeOrder({
                    ...o,
                    status: 'cancelled' as OrderStatus,
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
            orders: state.orders.map((o) => (o.id === id ? mapped : o)),
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
              o.id === id
                ? normalizeOrder({
                    ...o,
                    customerName: payload.fullName ?? o.customerName,
                    phoneNumber: payload.phone ?? o.phoneNumber,
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
            orders: state.orders.map((o) => (o.id === id ? mapped : o)),
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
            orders: state.orders.filter((o) => o.id !== id),
          }));
          return;
        }

        await delay();
        set((state) => ({
          orders: state.orders.filter((o) => o.id !== id),
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
            users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
          }));
          return;
        }

        await delay();
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, role } : u)),
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
            users: state.users.map((u) => (u.id === id ? { ...u, ...updated } : u)),
          }));
          return;
        }

        await delay(250);
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
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
            users: state.users.filter((u) => u.id !== id),
          }));
          return;
        }

        await delay();
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
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
          id: `u${get().users.length + 1}`,
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
      name: 'electro-admin',
      merge: (persistedState: any, currentState: any) => {
        if (!persistedState) return currentState;
        // Preserve persisted arrays (products, orders, users, categories)
        // so that deletes are not overwritten by initial data
        return {
          ...currentState,
          ...persistedState,
          // Only use persisted arrays if they exist; never re-seed from INITIAL data
          products: persistedState.products ?? currentState.products,
          orders: (persistedState.orders ?? currentState.orders).map(normalizeOrder),
          users: persistedState.users ?? currentState.users,
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
    (storeConfig.flashSaleItems || []).map(i => [i.productId, i.flashSalePrice])
  );
  
  const threshold = storeConfig.flashSaleThreshold ?? 0.2;

  return currentProducts.map(p => {
    // Priority 1: Manual Admin Setting
    if (manualPrices.has(p.id)) {
      const fsPrice = manualPrices.get(p.id)!;
      if (fsPrice < p.price) {
        return {
          ...p,
          oldPrice: p.price,
          price: fsPrice
        };
      }
    }

    // Priority 2: Auto-threshold (if product already has a significant discount)
    if (p.oldPrice && p.oldPrice > p.price) {
      const pct = (p.oldPrice - p.price) / p.oldPrice;
      if (pct >= threshold) {
        return p; 
      }
    }

    return p;
  });
}
