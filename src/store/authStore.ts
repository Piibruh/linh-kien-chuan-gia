import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  maNguoiDung: string;
  hoTen: string;
  email: string;
  role: 'admin' | 'user' | 'product_staff' | 'order_staff' | 'staff';
  dienThoai?: string;
  diaChi?: string;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  can: (permission: string) => boolean;
}

const ROLES_PERMISSIONS: Record<string, string[]> = {
  admin: ['all'],
  product_staff: ['view_dashboard', 'manage_products', 'view_orders'],
  order_staff: ['view_dashboard', 'manage_orders', 'view_products'],
  staff: ['view_dashboard', 'manage_products', 'manage_orders', 'manage_categories', 'view_products', 'view_orders'],
  user: ['view_profile', 'place_orders'],
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      token: null,

      login: async (email, password) => {
        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
          });

          const data = await res.json().catch(() => ({}));

          if (res.ok && data.user) {
            // FIX: Normalize role to lowercase to handle DB returning "USER"/"ADMIN"
            const normalizedUser = { ...data.user, role: String(data.user.role ?? 'user').toLowerCase() };
            set({ user: normalizedUser, isLoggedIn: true, token: data.token });
            return { success: true, message: `Chào mừng ${normalizedUser.hoTen}!` };
          }
          if (typeof data?.error === 'string') {
            return { success: false, message: data.error };
          }
          if (!res.ok) {
            if ([404, 502, 503, 504].includes(res.status)) {
              throw new Error('API unavailable, fallback to offline mode');
            }
            return { success: false, message: 'Lỗi đăng nhập từ máy chủ' };
          }
        } catch {
          /* ────────────────── OFFLINE FALLBACK ────────────────── */
          const DEFAULT_USERS: Array<User & { password: string }> = [
            {
              maNguoiDung: 'u1',
              hoTen: 'Admin System',
              email: 'admin@test.com',
              password: 'password123',
              role: 'admin',
              dienThoai: '0912345678',
              diaChi: '123 Đường ABC, Quận 1, TP.HCM',
            },
            {
              maNguoiDung: 'u2',
              hoTen: 'NV Quản lý Sản phẩm',
              email: 'product@test.com',
              password: 'product123',
              role: 'product_staff',
              dienThoai: '0987654321',
              diaChi: '456 Đường XYZ, Quận 3, TP.HCM',
            },
            {
              maNguoiDung: 'u4',
              hoTen: 'NV Quản lý Đơn hàng',
              email: 'order@test.com',
              password: 'order123',
              role: 'order_staff',
              dienThoai: '0976543210',
              diaChi: '789 Đường ABC, Quận 5, TP.HCM',
            },
            {
              maNguoiDung: 'u3',
              hoTen: 'Nguyễn Văn A',
              email: 'user@test.com',
              password: 'user123',
              role: 'user',
              dienThoai: '0969000001',
              diaChi: '789 Đường DEF, Quận 5, TP.HCM',
            },
          ];

          const user = DEFAULT_USERS.find((u) => u.email === email && u.password === password);
          if (user) {
            const { password: _, ...userWithoutPassword } = user;
            const token =
              typeof crypto !== 'undefined' && (crypto as any).randomUUID
                ? (crypto as any).randomUUID()
                : `token_${Math.random().toString(36).slice(2)}_${Date.now()}`;
            set({ user: userWithoutPassword, isLoggedIn: true, token });
            return { success: true, message: `Chào mừng ${user.hoTen}!` };
          }
          return { success: false, message: 'Email hoặc mật khẩu không đúng' };
        }
        return { success: false, message: 'Lỗi không xác định' };
      },

      logout: () => set({ user: null, isLoggedIn: false, token: null }),

      updateProfile: (updates) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        })),

      can: (permission) => {
        const { user } = get();
        if (!user) return false;
        const perms = ROLES_PERMISSIONS[user.role] || [];
        return perms.includes('all') || perms.includes(permission);
      },
    }),
    {
      name: 'electro-auth',
      merge: (persistedState: any, currentState: any) => {
        if (!persistedState) return currentState;
        const pUser = persistedState.user;
        if (pUser) {
          pUser.maNguoiDung = pUser.maNguoiDung || pUser.id || '';
          pUser.hoTen = pUser.hoTen || pUser.name || '';
          pUser.dienThoai = pUser.dienThoai || pUser.phone || '';
          pUser.diaChi = pUser.diaChi || pUser.address || '';
        }
        return {
          ...currentState,
          ...persistedState,
          user: pUser,
        };
      },
    }
  )
);