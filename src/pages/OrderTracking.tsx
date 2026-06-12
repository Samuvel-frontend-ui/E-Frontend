import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Package, Clock, Truck, MapPin, CheckCircle, ChevronLeft } from 'lucide-react';
import { apiFetch } from '../services/api';

interface OrderDetail {
  order: any;
  items: any[];
  history: any[];
  payments: any[];
}

export default function OrderTracking() {
  const { id } = useParams<{ id: string }>();

  const { data: detailData, isLoading, error } = useQuery<OrderDetail>({
    queryKey: ['order', id],
    queryFn: () => apiFetch<OrderDetail>(`/api/orders/${id}`)
  });

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !detailData) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-gray-950 mb-2">Order Not Found</h2>
        <p className="text-gray-500 mb-6">Unable to retrieve tracking details for order {id}.</p>
        <Link to="/account/orders" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700">
          My Orders List
        </Link>
      </div>
    );
  }

  const { order, items } = detailData;
  const address = JSON.parse(order.shipping_address);

  // Status mapping
  const statuses = [
    { label: 'Placed', key: 'PLACED', icon: Clock },
    { label: 'Confirmed', key: 'CONFIRMED', icon: CheckCircle },
    { label: 'Processing', key: 'PROCESSING', icon: Clock },
    { label: 'Packed', key: 'PACKED', icon: Package },
    { label: 'Shipped', key: 'SHIPPED', icon: Truck },
    { label: 'Out for Delivery', key: 'OUT_FOR_DELIVERY', icon: Truck },
    { label: 'Delivered', key: 'DELIVERED', icon: CheckCircle }
  ];

  const currentStatusIdx = statuses.findIndex((s) => s.key === order.status);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
      {/* Back button */}
      <div>
        <Link to="/account/orders" className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center">
          <ChevronLeft className="h-4 w-4" /> Back to My Orders
        </Link>
      </div>

      {/* Order Main Card */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xxs space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-100">
          <div>
            <h1 className="text-lg font-bold text-gray-950">Track Order</h1>
            <p className="text-xxs font-mono text-purple-600 mt-0.5">{order.id}</p>
          </div>
          <span className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
            {order.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-gray-400 block">Date Placed</span>
            <span className="font-semibold text-gray-800">{new Date(order.created_at).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-gray-400 block">Total Amount</span>
            <span className="font-semibold text-gray-800">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(order.total_amount)}
            </span>
          </div>
        </div>
      </div>

      {/* Tracking Timeline */}
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xxs">
        <h2 className="font-bold text-gray-950 text-sm mb-8 flex items-center">
          <Truck className="h-5 w-5 mr-2 text-purple-600" /> Delivery Status
        </h2>

        {/* Vertical Timeline for Mobile, Horizontal for Desktop */}
        <div className="relative pl-6 space-y-8 border-l border-gray-200 ml-3">
          {statuses.map((step, idx) => {
            const isCompleted = idx <= currentStatusIdx;
            
            return (
              <div key={step.key} className="relative">
                {/* Connector Dot */}
                <div
                  className={`absolute -left-[31px] top-0.5 rounded-full border-4 border-white h-5 w-5 flex items-center justify-center transition-colors ${
                    isCompleted ? 'bg-purple-600 text-white' : 'bg-gray-200'
                  }`}
                />
                
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-xs font-semibold ${isCompleted ? 'text-gray-900 font-bold' : 'text-gray-400'}`}>
                      {step.label}
                    </h3>
                    {order.status === step.key && (
                      <p className="text-[10px] text-purple-600 font-medium mt-0.5 animate-pulse">Current Status</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shipping address & items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xxs space-y-4">
          <h3 className="font-bold text-gray-950 text-sm flex items-center">
            <MapPin className="h-5 w-5 mr-2 text-purple-600" /> Shipping Address
          </h3>
          <div className="text-xs text-gray-600 space-y-1">
            <p className="font-semibold text-gray-900">{address.first_name} {address.last_name}</p>
            <p>{address.line1}</p>
            {address.line2 && <p>{address.line2}</p>}
            <p>{address.city}, {address.state} - {address.postal_code}</p>
            <p className="pt-2 font-medium">Contact: {address.phone}</p>
          </div>
        </div>

        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xxs space-y-4">
          <h3 className="font-bold text-gray-950 text-sm flex items-center">
            <Package className="h-5 w-5 mr-2 text-purple-600" /> Items List
          </h3>
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="py-2.5 flex justify-between text-xs">
                <div>
                  <p className="font-semibold text-gray-800 line-clamp-1">{item.title}</p>
                  {item.variant_title && <p className="text-[10px] text-purple-500">{item.variant_title}</p>}
                  <p className="text-[10px] text-gray-400">Qty: {item.quantity}</p>
                </div>
                <span className="font-semibold text-gray-900 shrink-0 ml-4">
                  {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
