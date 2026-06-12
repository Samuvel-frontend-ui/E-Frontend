import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Toaster } from 'react-hot-toast';

// Stores
import { useAuthStore } from './stores/authStore';
import { useCartStore } from './stores/cartStore';
import { useWishlistStore } from './stores/wishlistStore';

// Components
import Header from './components/Header';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import ScrollToTop from './components/ScrollToTop';

// Pages - Public
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderTracking from './pages/OrderTracking';
import { About, Contact, FAQ, Legal } from './pages/StaticPages';

// Pages - Account
import Account from './pages/Account';

// Pages - Admin
import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminProductForm from './pages/admin/AdminProductForm';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminCategories from './pages/admin/AdminCategories';
import AdminUploads from './pages/admin/AdminUploads';
import AdminSettings from './pages/admin/AdminSettings';

const queryClient = new QueryClient();
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

function MainLayout() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  if (isAdminPath) {
    return <Outlet />;
  }

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 bg-gray-50/50">
        <ScrollToTop />
      <Header />
      <main className="flex-1 max-w-none w-full mx-auto px-4 md:px-8 lg:px-12 py-8">
        <Outlet />
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}

function AppContent() {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const loadCart = useCartStore((state) => state.loadCart);
  const loadWishlist = useWishlistStore((state) => state.loadWishlist);

  useEffect(() => {
    // Bootstrap authentication session and IndexedDB offline cache on mount
    checkAuth(API_URL);
    loadCart();
    loadWishlist();
  }, [checkAuth, loadCart, loadWishlist]);

  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/collections/:slug" element={<Shop />} />
        <Route path="/products/:slug" element={<ProductDetails />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/order/success" element={<OrderSuccess />} />
        <Route path="/orders/:id" element={<OrderTracking />} />
        
        {/* Static Content */}
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Legal />} />
        <Route path="/terms" element={<Legal />} />
        <Route path="/shipping" element={<Legal />} />
        <Route path="/returns" element={<Legal />} />

        {/* User Account Portal */}
        <Route path="/account" element={<Account />} />
        <Route path="/account/orders" element={<Account />} />
        <Route path="/account/wishlist" element={<Account />} />
        <Route path="/account/addresses" element={<Account />} />
        <Route path="/account/notifications" element={<Account />} />
      </Route>

      {/* Admin Panel Routes */}
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route path="/admin/products" element={<AdminProducts />} />
      <Route path="/admin/products/new" element={<AdminProductForm />} />
      <Route path="/admin/products/:id" element={<AdminProductForm />} />
      <Route path="/admin/orders" element={<AdminOrders />} />
      <Route path="/admin/customers" element={<AdminCustomers />} />
      <Route path="/admin/uploads" element={<AdminUploads />} />
      <Route path="/admin/categories" element={<AdminCategories />} />
      <Route path="/admin/settings" element={<AdminSettings />} />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContent />
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
