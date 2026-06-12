import { useQuery } from '@tanstack/react-query';


import { apiFetch } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

interface CustomerAdmin {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  created_at: string;
  total_orders: number;
  total_spent: number;
}

export default function AdminCustomers() {
  const { data: customers, isLoading } = useQuery<CustomerAdmin[]>({
    queryKey: ['adminCustomers'],
    queryFn: () => apiFetch<CustomerAdmin[]>('/api/admin/customers')
  });

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Customer Management</h1>
          <p className="text-xs text-gray-500 mt-1">Review active storefront customers, order frequency, and lifetime expenditures</p>
        </div>

        {/* Customers Table */}
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-xs p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold">
                    <th className="pb-3">Customer name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Created Date</th>
                    <th className="pb-3 text-center">Orders</th>
                    <th className="pb-3 text-right">Lifetime Spent</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {customers?.map((cust) => (
                    <tr key={cust.id} className="text-gray-600 hover:bg-gray-50/40">
                      <td className="py-4 font-semibold text-gray-900">
                        {cust.first_name ? `${cust.first_name} ${cust.last_name || ''}` : <span className="text-gray-300">N/A</span>}
                      </td>
                      <td className="py-4">{cust.email}</td>
                      <td className="py-4">{cust.phone || <span className="text-gray-350">—</span>}</td>
                      <td className="py-4">{new Date(cust.created_at).toLocaleDateString()}</td>
                      <td className="py-4 text-center font-semibold text-gray-900">{cust.total_orders}</td>
                      <td className="py-4 text-right font-bold text-purple-600">
                        {formatPrice(cust.total_spent || 0)}
                      </td>
                    </tr>
                  ))}
                  {customers?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">No customers registered yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
