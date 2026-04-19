import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useAuthStore } from '../../../store/authStore';

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);

  if (!isLoggedIn) {
    const next = `${location.pathname}${location.search}`;
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />;
  }

  return <>{children}</>;
}
