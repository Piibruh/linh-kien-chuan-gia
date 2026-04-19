import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { ShieldAlert } from 'lucide-react';
import { useAuthStore, type UserRole } from '../../../store/authStore';

export function RequireRole({ roles, children }: { roles: UserRole[]; children: ReactNode }) {
  const location = useLocation();
  const { isLoggedIn, user } = useAuthStore();

  if (!isLoggedIn || !user) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  if (!roles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">Không có quyền truy cập</h1>
          <p className="text-muted-foreground mb-6">Tài khoản của bạn không có quyền truy cập trang này</p>
          <a
            href="/"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
