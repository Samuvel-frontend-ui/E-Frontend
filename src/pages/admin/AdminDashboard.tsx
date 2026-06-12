import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { DollarSign, ShoppingBag, Users, AlertTriangle } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import AdminLayout from '../../components/AdminLayout';

interface DashboardData {
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    lowStockCount: number;
  };
  recentOrders: any[];
  topProducts: any[];
  deviceStats: {
    Mobile: number;
    Tablet: number;
    Desktop: number;
  };
}

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['adminDashboard'],
    queryFn: () => apiFetch<DashboardData>('/api/admin/dashboard')
  });

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  if (isLoading || !data) {
    return (
      <AdminLayout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      </AdminLayout>
    );
  }

  const { metrics, recentOrders, topProducts } = data;

  const cards = [
    { label: 'Total Revenue', value: formatPrice(metrics.totalRevenue), icon: DollarSign, color: 'text-green-600 bg-green-50', path: '/admin/orders', adminOnly: true },
    { label: 'Paid Orders', value: metrics.totalOrders, icon: ShoppingBag, color: 'text-blue-600 bg-blue-50', path: '/admin/orders', adminOnly: false },
    { label: 'Customers', value: metrics.totalCustomers, icon: Users, color: 'text-purple-600 bg-purple-50', path: '/admin/customers', adminOnly: false },
    { label: 'Low Stock Alerts', value: metrics.lowStockCount, icon: AlertTriangle, color: metrics.lowStockCount > 0 ? 'text-amber-600 bg-amber-50 animate-pulse' : 'text-gray-500 bg-gray-50', path: '/admin/products', adminOnly: false }
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-xs text-gray-500 mt-1">Real-time statistics & business metrics</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.filter(card => !card.adminOnly || user?.role === 'SUPER_ADMIN').map((card) => {
            const Icon = card.icon;
            return (
              <Link to={card.path} key={card.label} className="bg-white border border-gray-200/60 rounded-xl p-5 shadow-xs flex items-center justify-between hover:border-purple-200 transition-colors">
                <div className="space-y-1">
                  <span className="text-xxs font-bold uppercase tracking-wider text-gray-400 block">{card.label}</span>
                  <span className="text-xl font-bold text-gray-900">{card.value}</span>
                </div>
                <div className={`p-3 rounded-lg ${card.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </Link>
            );
          })}
        </div>

        {/* Recent Orders & Top Products */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Recent Orders Table */}
          <div className="lg:col-span-2 bg-white border border-gray-200/60 rounded-xl shadow-xs p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-sm">Recent Orders</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentOrders.map((ord) => (
                    <tr key={ord.id} className="text-gray-600">
                      <td className="py-3 font-mono text-purple-600 font-bold">{ord.id.substring(0, 12)}...</td>
                      <td className="py-3">{ord.customer_email}</td>
                      <td className="py-3 font-semibold text-gray-900">{formatPrice(ord.total_amount)}</td>
                      <td className="py-3">
                        <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase">
                          {ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {recentOrders.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-gray-400">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Products Volume Card */}
          <div className="bg-white border border-gray-200/60 rounded-xl shadow-xs p-6 space-y-6">
            <h2 className="font-bold text-gray-900 text-sm">Top Selling Products</h2>
            <div className="space-y-4">
              {topProducts.map((p) => (
                <div key={p.product_id} className="flex justify-between items-center text-xs">
                  <div className="space-y-0.5">
                    <p className="font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                    <p className="text-[10px] text-gray-400">{p.sales_volume} sales</p>
                  </div>
                  <span className="font-bold text-purple-600">{formatPrice(p.revenue)}</span>
                </div>
              ))}
              {topProducts.length === 0 && (
                <p className="text-center py-6 text-gray-400 text-xs">No sales data.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
