import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { getFullImageUrl } from '../utils/imageHelpers';

export default function Cart() {
  const { items, updateQuantity, removeItem, getCartTotal } = useCartStore();
  const navigate = useNavigate();

  const total = getCartTotal();
  const shipping = total > 999 ? 0 : 99; // Free over ₹999
  const tax = Math.round(total * 0.18); // 18% GST included or added
  const finalTotal = total + shipping;

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center px-4">
        <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 text-purple-600">
          <ShoppingBag className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-gray-950 mb-2">Your Cart is Empty</h2>
        <p className="text-gray-500 mb-8 text-sm">Looks like you haven't added anything to your cart yet. Let's find some amazing products!</p>
        <Link
          to="/shop"
          className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg flex items-center justify-center transition-colors shadow-xs"
        >
          Explore Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-none">
      <h1 className="text-2xl font-bold tracking-tight text-gray-950 mb-8">Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || 'base'}`}
              className="bg-white border border-gray-100 rounded-xl p-4 flex gap-4 shadow-xxs items-center"
            >
              {/* Product Cover */}
              <div className="w-20 h-20 bg-gray-50 rounded-lg overflow-hidden shrink-0">
                <img
                  src={getFullImageUrl(item.coverImage)}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <Link to={`/products/${item.productId}`} className="text-sm font-semibold text-gray-950 hover:text-purple-600 transition-colors line-clamp-1">
                  {item.title}
                </Link>
                {item.variantTitle && (
                  <p className="text-xxs font-bold text-purple-600 uppercase mt-0.5">{item.variantTitle}</p>
                )}
                <p className="text-sm font-bold text-gray-950 mt-1.5">{formatPrice(item.price)}</p>
              </div>

              {/* Quantity Adjuster */}
              <div className="flex items-center border border-gray-200 rounded-lg shrink-0">
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity - 1, item.variantId)}
                  className="px-2.5 py-1.5 text-gray-500 hover:text-purple-600"
                >
                  -
                </button>
                <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.productId, item.quantity + 1, item.variantId)}
                  className="px-2.5 py-1.5 text-gray-500 hover:text-purple-600"
                >
                  +
                </button>
              </div>

              {/* Remove Action */}
              <button
                onClick={() => removeItem(item.productId, item.variantId)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                aria-label="Remove item"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        {/* Pricing Summary */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xxs space-y-6">
          <h3 className="font-bold text-gray-950 text-sm pb-4 border-b border-gray-100">Order Summary</h3>
          
          <div className="space-y-3 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-950">{formatPrice(total)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (18% GST incl.)</span>
              <span>{formatPrice(tax)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping Fee</span>
              <span className="font-semibold text-gray-950">
                {shipping === 0 ? <span className="text-green-600 font-bold uppercase">Free</span> : formatPrice(shipping)}
              </span>
            </div>
            {shipping > 0 && (
              <p className="text-[10px] text-purple-600 font-medium">Add {formatPrice(1000 - total)} more for free shipping!</p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-950 text-sm">
            <span>Total</span>
            <span className="text-purple-600">{formatPrice(finalTotal)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg text-sm flex items-center justify-center shadow-xs transition-colors"
          >
            Proceed to Checkout <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
