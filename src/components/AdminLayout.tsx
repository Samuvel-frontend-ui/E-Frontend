import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  Settings,
  ShieldCheck,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated, isChecking, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 768);
  const displayName = [user?.first_name, user?.last_name].filter(Boolean).join(' ').trim();
  const initials =
    (displayName
      ? displayName
          .split(' ')
          .map((part) => part[0])
          .join('')
      : user?.email?.[0] || 'S'
    ).toUpperCase();

  // Close sidebar on Escape key press
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [sidebarOpen]);

  const handleLogout = async () => {
    await logout(API_URL);
    navigate('/')
  };

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || (user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 text-center">
        <ShieldCheck className="h-16 w-16 text-red-500 mb-4 animate-bounce" />
        <h1 className="text-2xl font-bold text-gray-950 mb-2">Access Denied</h1>
        <p className="text-gray-500 text-sm max-w-sm mb-6">
          You must be logged in as an Administrator to view this panel.
        </p>
        <button
          onClick={() => navigate('/admin/login')}
          className="bg-purple-600 text-white px-6 py-2.5 rounded-md text-sm font-semibold hover:bg-purple-700 transition-colors shadow-xs"
        >
          Go to Admin Login
        </button>
      </div>
    );
  }

  // If force password change is active, prompt them to change it immediately
  if (user?.force_password_change) {
    navigate('/admin/settings?force_change=1');
  }

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', path: '/admin/products', icon: Package },
    { label: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Categories', path: '/admin/categories', icon: FolderOpen },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-50 flex flex-col md:flex-row">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-gray-950 text-gray-300 flex flex-col border-r border-gray-800 shadow-2xl shadow-gray-950/20 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Close button */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white lg:hidden"
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>
        <div className="p-5 border-b border-gray-800 bg-gray-950/80 backdrop-blur">
          <div className="flex items-start justify-between gap-4">
            <Link 
              to="/" 
              className="text-lg font-bold text-white tracking-tight flex items-center"
              onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
            >
              <ShieldCheck className="h-5 w-5 mr-2 text-purple-400" />
              Graceonix Admin
            </Link>

            {/* Close button inside header area */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-5 rounded-2xl border border-white/5 bg-white/5 p-4">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-fuchsia-500 text-white rounded-full h-11 w-11 flex items-center justify-center text-sm font-bold shadow-lg shadow-purple-500/20">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {displayName || user?.email || 'System Administrator'}
                </p>
                <p className="text-xs text-gray-400 truncate">System Administrator</p>
              </div>
            </div>
            <div className="mt-3 inline-flex items-center rounded-full bg-purple-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-purple-300">
              {user.role}
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path !== '/admin/dashboard' && location.pathname.startsWith(item.path));
            
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => {
                  if (window.innerWidth < 768) setSidebarOpen(false);
                }}
                className={`flex items-center px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-purple-600 text-white font-semibold'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 mr-3" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800 bg-gray-950/90 space-y-3">
          <Link
            to="/"
            onClick={() => { if (window.innerWidth < 768) setSidebarOpen(false); }}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-gray-800/50 hover:bg-gray-800 text-gray-300 text-sm font-semibold rounded-xl transition-colors border border-gray-700/50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Store
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center px-4 py-2.5 bg-red-950/30 hover:bg-red-900/40 text-red-300 text-sm font-semibold rounded-xl transition-colors border border-red-500/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${sidebarOpen ? 'md:ml-72' : ''}`}>
        <header className="flex items-center justify-between p-4 bg-white shadow-sm border-b border-gray-200 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className={`text-gray-600 hover:text-gray-900 ${sidebarOpen ? 'hidden' : 'block'}`}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-10 overflow-y-auto max-w-none mx-auto w-full mb-16 md:mb-0">
          {children}
        </main>
      </div>
    </div>
  );
}
