import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type UserRole = 'admin' | 'staff' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  hasRole: (role: UserRole | UserRole[]) => boolean;
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
          // If response not OK and no error message, treat missing API as offline fallback.
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
              name: 'Nhân viên Bán hàng',
              email: 'staff@test.com',
              password: 'staff123',
              role: 'staff',
              phone: '0987654321',
              address: '456 Đường XYZ, Quận 3, TP.HCM',
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
    }),
    {
      name: 'electro-auth',
    }
  )
);