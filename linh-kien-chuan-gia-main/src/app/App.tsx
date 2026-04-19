import { useEffect } from 'react';
import { RouterProvider } from 'react-router';
import { router } from './routes';
import { Toaster } from 'sonner';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';

export default function App() {
  const theme = useThemeStore((s) => s.theme);
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    useAdminStore.getState().bootstrapFromApi();
  }, [token]);

  // Apply theme on mount and when it changes
  useEffect(() => {
    const isDark = theme === 'dark';
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
  }, [theme]);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton duration={3000} />
    </>
  );
}
