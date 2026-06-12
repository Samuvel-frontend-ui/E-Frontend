import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShoppingBag, ShieldCheck } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { apiFetch } from '../services/api';
import { getFullImageUrl } from '../utils/imageHelpers';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getCartTotal, clearCart } = useCartStore();
  const { user, isAuthenticated, setUser } = useAuthStore();


  // Login / Register state for unauthenticated users
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [authError, setAuthError] = useState('');

  // Shipping form state for authenticated users
  const [shipFirstName, setShipFirstName] = useState('');
  const [shipLastName, setShipLastName] = useState('');
  const [shipLine1, setShipLine1] = useState('');
  const [shipLine2, setShipLine2] = useState('');
  const [shipCity, setShipCity] = useState('');
  const [shipState, setShipState] = useState('');
  const [shipPostalCode, setShipPostalCode] = useState('');
  const [shipPhone, setShipPhone] = useState('');
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  // Sync default user data into shipping form
  useEffect(() => {
    if (user) {
      setShipFirstName(user.first_name || '');
      setShipLastName(user.last_name || '');
      setShipPhone(user.phone || '');
    }
  }, [user]);

  // Dynamically inject Razorpay Checkout Script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');

    try {
      if (authTab === 'login') {
        const data = await apiFetch<{ user: any }>('/api/auth/login', {
          method: 'POST',
          json: { email, password }
        });
        setUser(data.user);
      } else {
        const data = await apiFetch<{ user: any }>('/api/auth/register', {
          method: 'POST',
          json: {
            email,
            password,
            first_name: firstName,
            last_name: lastName,
            phone
          }
        });
        setUser(data.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) return;

    if (!shipFirstName || !shipLine1 || !shipCity || !shipState || !shipPostalCode || !shipPhone) {
      alert('Please fill out all required shipping fields.');
      return;
    }

    setCheckoutLoading(true);

    try {
      // 1. Load Razorpay script
      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        alert('Failed to load Razorpay payment gateway. Please try again.');
        setCheckoutLoading(false);
        return;
      }

      // Prepare items format for backend
      const orderItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      }));

      const address = {
        first_name: shipFirstName,
        last_name: shipLastName,
        line1: shipLine1,
        line2: shipLine2,
        city: shipCity,
        state: shipState,
        postal_code: shipPostalCode,
        phone: shipPhone,
        country: 'India'
      };

      // 2. Create Order in Backend
      const checkoutRes = await apiFetch<{
        orderId: string;
        razorpayOrderId: string;
        amount: number;
        razorpayKey: string;
      }>('/api/checkout', {
        method: 'POST',
        json: {
          items: orderItems,
          shippingAddress: address,
          billingAddress: address // Simplify by matching shipping
        }
      });

      // 3. Launch Razorpay Checkout Modals
      const options = {
        key: checkoutRes.razorpayKey,
        amount: checkoutRes.amount * 100, // in paise
        currency: 'INR',
        name: 'Graceonix Store',
        description: `Order Payment for ${checkoutRes.orderId}`,
        order_id: checkoutRes.razorpayOrderId,
        handler: async function (response: any) {
          try {
            // Verify signature against backend
            const verifyRes = await apiFetch<{ success: boolean; orderId: string }>('/api/checkout/verify', {
              method: 'POST',
              json: {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature
              }
            });

            if (verifyRes.success) {
              clearCart();
              navigate(`/order/success?id=${verifyRes.orderId}`);
            } else {
              alert('Payment verification failed.');
            }
          } catch (err: any) {
            alert(err.message || 'Signature verification error');
          }
        },
        prefill: {
          name: `${shipFirstName} ${shipLastName}`,
          email: user?.email || '',
          contact: shipPhone
        },
        theme: {
          color: '#8b5cf6'
        },
        modal: {
          ondismiss: function () {
            alert('Payment window closed. Order reservation cancelled.');
            setCheckoutLoading(false);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      alert(err.message || 'Checkout error');
      setCheckoutLoading(false);
    }
  };

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-gray-950">Cart is empty</h2>
        <button onClick={() => navigate('/shop')} className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold">
          Explore Shop
        </button>
      </div>
    );
  }

  // Calculate pricing
  const subtotal = getCartTotal();
  const shipping = subtotal > 999 ? 0 : 99;
  const finalTotal = subtotal + shipping;

  return (
    <div className="max-w-none">
      <h1 className="text-2xl font-bold tracking-tight text-gray-950 mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Checkout Main Actions */}
        <div className="lg:col-span-2 space-y-6">
          {!isAuthenticated ? (
            /* Login/Register Panel during checkout */
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xxs">
              <div className="flex border-b border-gray-100 mb-6">
                <button
                  onClick={() => setAuthTab('login')}
                  className={`flex-1 text-center pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    authTab === 'login' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthTab('register')}
                  className={`flex-1 text-center pb-3 text-sm font-semibold border-b-2 transition-colors ${
                    authTab === 'register' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-400'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && <p className="text-xs font-semibold text-red-500 mb-4">{authError}</p>}

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                {authTab === 'register' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400">First Name</label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase text-gray-400">Last Name</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>

                {authTab === 'register' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Phone Number</label>
                    <input
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                      required
                    />
                  </div>
                )}

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Password</label>
                  <input
                    type="password"
                    name="password"
                    autoComplete={authTab === 'register' ? "new-password" : "current-password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-xs shadow-xs transition-colors flex items-center justify-center"
                >
                  <Lock className="h-4 w-4 mr-2" />
                  {authTab === 'login' ? 'Secure Log In' : 'Sign Up & Continue'}
                </button>
              </form>
            </div>
          ) : (
            /* Shipping Address Form */
            <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xxs">
              <h2 className="font-bold text-gray-950 text-sm mb-6 flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-purple-600" /> Shipping Details
              </h2>

              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">First Name *</label>
                    <input
                      type="text"
                      value={shipFirstName}
                      onChange={(e) => setShipFirstName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">Last Name</label>
                    <input
                      type="text"
                      value={shipLastName}
                      onChange={(e) => setShipLastName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Street Address *</label>
                  <input
                    type="text"
                    placeholder="House number and street name"
                    value={shipLine1}
                    onChange={(e) => setShipLine1(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Apartment, Suite, Unit, etc. (optional)</label>
                  <input
                    type="text"
                    value={shipLine2}
                    onChange={(e) => setShipLine2(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">City *</label>
                    <input
                      type="text"
                      value={shipCity}
                      onChange={(e) => setShipCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">State *</label>
                    <input
                      type="text"
                      value={shipState}
                      onChange={(e) => setShipState(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase text-gray-400">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      value={shipPostalCode}
                      onChange={(e) => setShipPostalCode(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-gray-400">Contact Phone Number *</label>
                  <input
                    type="tel"
                    value={shipPhone}
                    onChange={(e) => setShipPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={checkoutLoading}
                  className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-bold py-3.5 rounded-lg text-sm flex items-center justify-center shadow-xs transition-colors"
                >
                  {checkoutLoading ? 'Processing Order...' : 'Pay with Razorpay'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Checkout Order Summary Panel */}
        <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-xxs space-y-6">
          <h3 className="font-bold text-gray-950 text-sm pb-4 border-b border-gray-100 flex items-center">
            <ShoppingBag className="h-5 w-5 mr-2 text-purple-600" /> Items Summary
          </h3>

          <div className="divide-y divide-gray-150 max-h-60 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={`${item.productId}-${item.variantId || 'base'}`} className="py-3 flex gap-3 text-xs">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-50 shrink-0 border border-gray-100">
                  {item.coverImage ? (
                    <img
                      src={getFullImageUrl(item.coverImage)}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-950 line-clamp-1">{item.title}</p>
                  {item.variantTitle && <p className="text-[10px] text-purple-500 mt-0.5">{item.variantTitle}</p>}
                  <p className="text-gray-500 mt-0.5">Qty: {item.quantity}</p>
                </div>
                <span className="font-bold text-gray-950 shrink-0 ml-4">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR'
                  }).format(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-950">
                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(subtotal)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-gray-950">
                {shipping === 0 ? <span className="text-green-600 font-bold uppercase">Free</span> : `₹${shipping}`}
              </span>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between font-bold text-gray-950 text-sm">
            <span>Total</span>
            <span className="text-purple-600">
              {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(finalTotal)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
