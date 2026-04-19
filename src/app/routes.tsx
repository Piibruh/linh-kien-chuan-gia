import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { Header } from './components/header';
import { Footer } from './components/footer';
import { RequireAuth } from './components/guards/RequireAuth';
import { RequireRole } from './components/guards/RequireRole';
import { RouteFallback } from './components/RouteFallback';

const HomePage = lazy(() => import('./pages/home'));
const CategoryPage = lazy(() => import('./pages/category'));
const ProductDetailPage = lazy(() => import('./pages/product-detail'));
const CartPage = lazy(() => import('./pages/cart'));
const CheckoutPage = lazy(() => import('./pages/checkout'));
const AdminDashboard = lazy(() => import('./pages/admin-dashboard'));
const LoginPage = lazy(() => import('./pages/login'));
const RegisterPage = lazy(() => import('./pages/register'));
const ProfilePage = lazy(() => import('./pages/profile'));
const OrdersPage = lazy(() => import('./pages/orders'));
const AddProduct = lazy(() => import('./pages/admin/add-product'));
const AddCategory = lazy(() => import('./pages/admin/add-category'));
const AddUser = lazy(() => import('./pages/admin/add-user'));
const ProductsList = lazy(() => import('./pages/admin/products-list'));
const CategoriesList = lazy(() => import('./pages/admin/categories-list'));
const UsersList = lazy(() => import('./pages/admin/users-list'));
const OrdersList = lazy(() => import('./pages/admin/orders-list'));

function Suspended({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<RouteFallback />}>{children}</Suspense>;
}

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
        <Suspended>
          <HomePage />
        </Suspended>
      </Layout>
    ),
  },
  {
    path: '/category/:slug',
    element: (
      <Layout>
        <Suspended>
          <CategoryPage />
        </Suspended>
      </Layout>
    ),
  },
  {
    path: '/product/:id',
    element: (
      <Layout>
        <Suspended>
          <ProductDetailPage />
        </Suspended>
      </Layout>
    ),
  },
  {
    path: '/cart',
    element: (
      <Layout>
        <Suspended>
          <CartPage />
        </Suspended>
      </Layout>
    ),
  },
  {
    path: '/checkout',
    element: (
      <RequireAuth>
        <Layout>
          <Suspended>
            <CheckoutPage />
          </Suspended>
        </Layout>
      </RequireAuth>
    ),
  },
  {
    path: '/profile',
    element: (
      <RequireAuth>
        <Layout>
          <Suspended>
            <ProfilePage />
          </Suspended>
        </Layout>
      </RequireAuth>
    ),
  },
  {
    path: '/orders',
    element: (
      <RequireAuth>
        <Layout>
          <Suspended>
            <OrdersPage />
          </Suspended>
        </Layout>
      </RequireAuth>
    ),
  },
  {
    path: '/login',
    element: (
      <Suspended>
        <LoginPage />
      </Suspended>
    ),
  },
  {
    path: '/register',
    element: (
      <Suspended>
        <RegisterPage />
      </Suspended>
    ),
  },
  {
    path: '/admin',
    element: (
      <RequireRole roles={['admin', 'staff']}>
        <Suspended>
          <AdminDashboard />
        </Suspended>
      </RequireRole>
    ),
  },
  {
    path: '/admin/products/add',
    element: (
      <RequireRole roles={['admin']}>
        <Suspended>
          <AddProduct />
        </Suspended>
      </RequireRole>
    ),
  },
  {
    path: '/admin/products/edit',
    element: (
      <RequireRole roles={['admin']}>
        <Suspended>
          <AddProduct />
        </Suspended>
      </RequireRole>
    ),
  },
  {
    path: '/admin/products',
    element: (
      <RequireRole roles={['admin', 'staff']}>
        <Suspended>
          <ProductsList />
        </Suspended>
      </RequireRole>
    ),
  },
  {
    path: '/admin/categories',
    element: (
      <RequireRole roles={['admin']}>
        <Suspended>
          <CategoriesList />
        </Suspended>
      </RequireRole>
    ),
  },
  {
    path: '/admin/categories/add',
    element: (
      <RequireRole roles={['admin']}>
        <Suspended>
          <AddCategory />
        </Suspended>
      </RequireRole>
    ),
  },
  {
    path: '/admin/users',
    element: (
      <RequireRole roles={['admin']}>
        <Suspended>
          <UsersList />
        </Suspended>
      </RequireRole>
    ),
  },
  {
    path: '/admin/users/add',
    element: (
      <RequireRole roles={['admin']}>
        <Suspended>
          <AddUser />
        </Suspended>
      </RequireRole>
    ),
  },
  {
    path: '/admin/users/edit',
    element: (
      <RequireRole roles={['admin']}>
        <Suspended>
          <AddUser />
        </Suspended>
      </RequireRole>
    ),
  },
  {
    path: '/admin/orders',
    element: (
      <RequireRole roles={['admin', 'staff']}>
        <Suspended>
          <OrdersList />
        </Suspended>
      </RequireRole>
    ),
  },
  {
    path: '*',
    element: (
      <Layout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold text-foreground mb-4">404</h1>
          <p className="text-muted-foreground mb-8">Trang không tồn tại</p>
          <a
            href="/"
            className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors inline-block"
          >
            Về trang chủ
          </a>
        </div>
      </Layout>
    ),
  },
]);
