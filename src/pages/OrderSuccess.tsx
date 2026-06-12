import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, Package, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('id') || '';

  return (
    <div className="max-w-md mx-auto py-20 text-center px-4">
      <div className="bg-green-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 animate-bounce">
        <CheckCircle2 className="h-10 w-10" />
      </div>

      <h1 className="text-2xl font-bold text-gray-950 mb-2">Order Confirmed!</h1>
      <p className="text-gray-500 text-sm mb-6 leading-relaxed">
        Thank you for your purchase. Your payment was verified successfully and your order is now being processed.
      </p>

      {orderId && (
        <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 mb-8">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
            Order Reference
          </span>
          <code className="text-xs font-bold text-purple-600">{orderId}</code>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <Link
          to={orderId ? `/orders/${orderId}` : '/account/orders'}
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center text-sm shadow-xs transition-colors"
        >
          <Package className="h-4 w-4 mr-2" /> Track Order Status
        </Link>
        <Link
          to="/shop"
          className="text-purple-600 hover:text-purple-700 text-xs font-semibold flex items-center justify-center py-2"
        >
          Continue Shopping <ArrowRight className="ml-1 h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
