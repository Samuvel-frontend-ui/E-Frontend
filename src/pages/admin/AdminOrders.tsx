import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Eye, ShoppingBag, MapPin, X } from 'lucide-react';
import { apiFetch } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

interface OrderAdmin {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  shipping_address: string;
  payment_status: string;
  customer_email?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
}

export default function AdminOrders() {
  const queryClient = useQueryClient();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Fetch all orders
  const { data: orders, isLoading } = useQuery<OrderAdmin[]>({
    queryKey: ['adminOrders'],
    queryFn: () => apiFetch<OrderAdmin[]>('/api/admin/orders')
  });

  // Fetch specific order details if selected
  const { data: activeOrderDetail } = useQuery<any>({
    queryKey: ['adminOrderDetail', selectedOrderId],
    queryFn: () => apiFetch<any>(`/api/orders/${selectedOrderId}`),
    enabled: !!selectedOrderId
  });

  // Status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiFetch(`/api/admin/orders/${id}/status`, {
        method: 'PUT',
        json: { status }
      }),
    onSuccess: () => {
      alert('Order status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminOrderDetail', selectedOrderId] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to update order status');
    }
  });

  const handleStatusChange = (id: string, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleViewDetails = (id: string) => {
    setSelectedOrderId(id);
    setDetailsOpen(true);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  const validStatuses = ['PLACED', 'CONFIRMED', 'PROCESSING', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'RETURNED'];

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Orders Management</h1>
          <p className="text-xs text-gray-500 mt-1">Track purchase transactions, dispatch orders, and change shipment status</p>
        </div>

        {/* Orders Table */}
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-xs p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-gray-100 text-gray-400 font-bold">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Date Placed</th>
                    <th className="pb-3">Customer Email</th>
                    <th className="pb-3">Amount</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Order Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {orders?.map((ord) => (
                    <tr 
                      key={ord.id} 
                      onClick={() => handleViewDetails(ord.id)}
                      className="text-gray-600 hover:bg-gray-50/40 cursor-pointer transition-colors"
                    >
                      <td className="py-4 font-mono text-purple-600 font-bold">{ord.id.substring(0, 15)}...</td>
                      <td className="py-4">{new Date(ord.created_at).toLocaleDateString()}</td>
                      <td className="py-4">{ord.customer_email || 'Guest'}</td>
                      <td className="py-4 font-semibold text-gray-900">{formatPrice(ord.total_amount)}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          ord.payment_status === 'PAID' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {ord.payment_status}
                        </span>
                      </td>
                      <td className="py-4" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={ord.status}
                          onChange={(e) => handleStatusChange(ord.id, e.target.value)}
                          className="bg-gray-50 border border-gray-250 rounded-lg px-2 py-1 text-[10px] font-semibold text-gray-750 focus:outline-hidden"
                        >
                          {validStatuses.map((st) => (
                            <option key={st} value={st}>
                              {st}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                  {orders?.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-400">No orders found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detailed Modal Drawer */}
        {detailsOpen && activeOrderDetail && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
            <div className="bg-white w-full max-w-lg h-full p-6 overflow-y-auto flex flex-col space-y-6">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h2 className="font-bold text-gray-950 text-sm">Order Details</h2>
                  <p className="text-[10px] font-mono text-gray-400 mt-0.5">{activeOrderDetail.order.id}</p>
                </div>
                <button onClick={() => setDetailsOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Status Selector */}
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Update Order Status</span>
                <div className="flex gap-2">
                  <select
                    value={activeOrderDetail.order.status}
                    onChange={(e) => handleStatusChange(activeOrderDetail.order.id, e.target.value)}
                    className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 text-xs font-semibold"
                  >
                    {validStatuses.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-950 text-xs flex items-center">
                  <ShoppingBag className="h-4.5 w-4.5 mr-2 text-purple-600" /> Items List
                </h3>
                <div className="divide-y divide-gray-100">
                  {activeOrderDetail.items.map((item: any) => (
                    <div key={item.id} className="py-2.5 flex justify-between text-xs">
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        {item.variant_title && <p className="text-[10px] text-purple-500">{item.variant_title}</p>}
                        <p className="text-[10px] text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shipping Address */}
              <div className="space-y-3">
                <h3 className="font-bold text-gray-950 text-xs flex items-center">
                  <MapPin className="h-4.5 w-4.5 mr-2 text-purple-600" /> Shipping Address
                </h3>
                {(() => {
                  const addr = JSON.parse(activeOrderDetail.order.shipping_address);
                  return (
                    <div className="text-xs text-gray-600 space-y-1 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                      <p className="font-semibold text-gray-900">{addr.first_name} {addr.last_name}</p>
                      <p>{addr.line1}</p>
                      {addr.line2 && <p>{addr.line2}</p>}
                      <p>{addr.city}, {addr.state} - {addr.postal_code}</p>
                      <p className="pt-2 font-medium">Phone: {addr.phone}</p>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
