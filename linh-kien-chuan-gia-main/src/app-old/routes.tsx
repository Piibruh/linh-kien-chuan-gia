import { createBrowserRouter } from 'react-router';
import HomePage from './pages/home';
import CategoryPage from './pages/category';
import ProductDetailPage from './pages/product-detail';
import CartPage from './pages/cart';
import CheckoutPage from './pages/checkout';
import AdminDashboard from './pages/admin-dashboard';
import LoginPage from './pages/login';
import RegisterPage from './pages/register';
import ProfilePage from './pages/profile';
import OrdersPage from './pages/orders';
import { Header } from './components/header';
import { Footer } from './components/footer';

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Layout>
        <HomePage />
      </Layout>
    ),
  },
  {
    path: '/category/:slug',
    element: (
      <Layout>
        <CategoryPage />
      </Layout>
    ),
  },
  {
    path: '/product/:id',
    element: (
      <Layout>
        <ProductDetailPage />
      </Layout>
    ),
  },
  {
    path: '/cart',
    element: (
      <Layout>
        <CartPage />
      </Layout>
    ),
  },
  {
    path: '/checkout',
    element: (
      <Layout>
        <CheckoutPage />
      </Layout>
    ),
  },
  {
    path: '/profile',
    element: (
      <Layout>
        <ProfilePage />
      </Layout>
    ),
  },
  {
    path: '/orders',
    element: (
      <Layout>
        <OrdersPage />
      </Layout>
    ),
  },
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
  {
    path: '*',
    element: (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground mb-8">Trang không tồn tại</p>
          <a href="/" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block">
            Về trang chủ
          </a>
        </div>
      </Layout>
    ),
  },
]);