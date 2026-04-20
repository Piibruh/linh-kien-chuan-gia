import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'product_staff' | 'order_staff' | 'staff' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

/**
 * Permission matrix — Bảng 0.21 yêu cầu:
 *
 * | Chức năng               | admin | product_staff | order_staff | user |
 * |-------------------------|-------|---------------|-------------|------|
 * | manage_accounts         |   A   |      NA       |     NA      |  NA  |
 * | edit_own_profile        |   A   |      NA       |     NA      |   A  |
 * | login_logout            |   A   |       A       |      A      |   A  |
 * | view_products           |   A   |       A       |      A      |   A  |
 * | manage_categories       |   A   |       A       |     NA      |  NA  |
 * | manage_products         |   A   |       A       |     NA      |  NA  |
 * | manage_cart             |  NA   |      NA       |     NA      |   A  |
 * | place_orders            |  NA   |      NA       |     NA      |   A  |
 * | cancel_orders           |   A   |      NA       |      A      |   A  |
 * | manage_orders           |   A   |      NA       |      A      |  NA  |
 * | manage_discounts        |   A   |       A       |     NA      |  NA  |
 * | view_dashboard          |   A   |       A       |      A      |  NA  |
 * | manage_settings         |   A   |      NA       |     NA      |  NA  |
 */
export type Permission =
  | 'manage_accounts'
  | 'edit_own_profile'
  | 'login_logout'
  | 'view_products'
  | 'manage_categories'
  | 'manage_products'
  | 'manage_cart'
  | 'place_orders'
  | 'cancel_orders'
  | 'manage_orders'
  | 'manage_discounts'
  | 'view_dashboard'
  | 'manage_settings';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'manage_accounts', 'edit_own_profile', 'login_logout', 'view_products',
    'manage_categories', 'manage_products', 'cancel_orders',
    'manage_orders', 'manage_discounts', 'view_dashboard', 'manage_settings',
  ],
  product_staff: [
    'login_logout', 'view_products',
    'manage_categories', 'manage_products',
    'manage_discounts', 'view_dashboard',
  ],
  order_staff: [
    'login_logout', 'view_products',
    'cancel_orders', 'manage_orders', 'view_dashboard',
  ],
  // legacy 'staff' — treated same as order_staff for backward compat
  staff: [
    'login_logout', 'view_products',
    'cancel_orders', 'manage_orders', 'view_dashboard',
  ],
  user: [
    'edit_own_profile', 'login_logout', 'view_products',
    'manage_cart', 'place_orders', 'cancel_orders',
  ],
};

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  can: (permission: Permission) => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoggedIn: false,
      token: null,

      login: async (email, password) => {
        const normalizedEmail = email.trim().toLowerCase();
        const normalizedPassword = password.trim();

        if (!normalizedEmail || !normalizedPassword) {
          return { success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu' };
        }

        try {
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: normalizedEmail, password: normalizedPassword }),
          });
          const data = await res.json().catch(() => ({}));
          if (res.ok && data?.token && data?.user) {
            // FIX: Normalize role to lowercase to handle DB returning "USER"/"ADMIN"
            const normalizedUser = { ...data.user, role: String(data.user.role ?? 'user').toLowerCase() };
            set({ user: normalizedUser, isLoggedIn: true, token: data.token });
            return { success: true, message: `Chào mừng ${normalizedUser.name}!` };
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
              id: 'u1',
              name: 'Admin System',
              email: 'admin@test.com',
              password: 'password123',
              role: 'admin',
              phone: '0912345678',
              address: '123 Đường ABC, Quận 1, TP.HCM',
            },
            {
              id: 'u2',
              name: 'NV Quản lý Sản phẩm',
              email: 'product@test.com',
              password: 'product123',
              role: 'product_staff',
              phone: '0987654321',
              address: '456 Đường XYZ, Quận 3, TP.HCM',
            },
            {
              id: 'u4',
              name: 'NV Quản lý Đơn hàng',
              email: 'order@test.com',
              password: 'order123',
              role: 'order_staff',
              phone: '0976543210',
              address: '789 Đường ABC, Quận 5, TP.HCM',
            },
            {
              id: 'u3',
              name: 'Nguyễn Văn A',
              email: 'user@test.com',
              password: 'user123',
              role: 'user',
              phone: '0969000001',
              address: '789 Đường DEF, Quận 5, TP.HCM',
            },
          ];

          let users: Array<User & { password: string }> = DEFAULT_USERS;
          try {
            const adminStoreState = localStorage.getItem('electro-admin');
            if (adminStoreState) {
              const parsed = JSON.parse(adminStoreState);
              const storedUsers = parsed.state?.users || [];
              if (storedUsers.length > 0) users = storedUsers;
            }
          } catch {
            users = DEFAULT_USERS;
          }

          const found = users.find(
            (u) =>
              u.email.trim().toLowerCase() === normalizedEmail &&
              u.password === normalizedPassword
          );
          if (found) {
            const { password: _pw, ...user } = found;
            const token =
              typeof crypto !== 'undefined' &&
              'randomUUID' in crypto &&
              (crypto as any).randomUUID()
                ? (crypto as any).randomUUID()
                : `token_${Math.random().toString(36).slice(2)}_${Date.now()}`;
            set({ user, isLoggedIn: true, token });
            return { success: true, message: `Chào mừng ${user.name}!` };
          }
          return { success: false, message: 'Email hoặc mật khẩu không đúng' };
        }
        return { success: false, message: 'Đăng nhập thất bại' };
      },

      logout: () => {
        set({ user: null, isLoggedIn: false, token: null });
      },

      updateProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }));
      },

      hasRole: (role) => {
        const { user } = get();
        if (!user) return false;
        if (Array.isArray(role)) return role.includes(user.role);
        return user.role === role;
      },

      can: (permission) => {
        const { user } = get();
        if (!user) return false;
        const perms = ROLE_PERMISSIONS[user.role] ?? [];
        return perms.includes(permission);
      },
    }),
    {
      name: 'electro-auth',
    }
  )
);