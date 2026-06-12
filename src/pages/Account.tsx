import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { User, Package, Heart, LogOut, ChevronRight, Camera, Save, Edit2 } from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { apiFetch } from '../services/api';
import ProductCard from '../components/ProductCard';
import { getFullImageUrl } from '../utils/imageHelpers';
import { toast } from 'react-hot-toast';

export default function Account() {
  const { user, isAuthenticated, isChecking, logout, setUser } = useAuthStore();
  const wishlist = useWishlistStore((state) => state.items);
  const navigate = useNavigate();
  const location = useLocation();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const maxUploadSizeMb = Number(import.meta.env.VITE_UPLOAD_LIMIT_MB || 25);
  const maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;

  // Profile edit state
  const [editMode, setEditMode] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (!isChecking && !isAuthenticated) {
      navigate('/checkout');
    }
  }, [isAuthenticated, isChecking, navigate]);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || '');
      setLastName(user.last_name || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  // Fetch orders
  const { data: orders } = useQuery<any[]>({
    queryKey: ['myOrders'],
    queryFn: () => apiFetch<any[]>('/api/orders'),
    enabled: isAuthenticated
  });

  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => apiFetch<{ user: any }>('/api/auth/profile', { method: 'PUT', json: data }),
    onSuccess: (res) => {
      setUser(res.user);
      setEditMode(false);
      toast.success('Profile updated successfully!');
    },
    onError: (err: any) => {
      toast.error(err.message || 'Failed to update profile');
    }
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ first_name: firstName, last_name: lastName, phone });
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > maxUploadSizeBytes) {
      toast.error(`Avatar is too large. Maximum upload size is ${maxUploadSizeMb}MB.`);
      return;
    }
    setUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${API_URL}/api/auth/avatar`, {
        method: 'POST',
        body: formData,
        credentials: 'include'
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      // The avatar endpoint already updates avatar_url in the DB,
      // so just refresh the local user state from the response.
      if (data.user) {
        setUser(data.user);
      }
      toast.success('Photo updated!');
    } catch (err: any) {
      toast.error(err.message || 'Avatar upload failed');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleLogout = async () => {
    await logout(API_URL);
    navigate('/');
  };

  if (isChecking || !user) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const path = location.pathname;
  const isOrders = path === '/account/orders';
  const isWishlist = path === '/account/wishlist';
  const isProfile = !isOrders && !isWishlist;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

  const initials = (user.first_name?.[0] || '') + (user.last_name?.[0] || '') || user.email[0].toUpperCase();

  return (
    <div className="max-w-none flex flex-col md:flex-row gap-8">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 bg-white border border-gray-100 rounded-xl p-4 shadow-xxs h-fit space-y-4">
        {/* Avatar */}
        <div className="flex flex-col items-center pb-4 border-b border-gray-100 space-y-3">
          <div className="relative group">
            {user.avatar_url ? (
              <img
                src={getFullImageUrl(user.avatar_url)}
                alt="Profile"
                className="h-16 w-16 rounded-full object-cover border-2 border-purple-200"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  // Use a simple gray placeholder data URL if image fails to load
                  img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTYwIiBoZWlnaHQ9IjE2MCIgZmlsbD0iI2U2ZTZlNiIvPjwvc3ZnPg==';
                }}
              />
            ) : (
              <div className="bg-purple-600 text-white rounded-full h-16 w-16 flex items-center justify-center font-bold text-xl">
                {initials}
              </div>
            )}
            <label className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              {uploadingAvatar ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Camera className="h-5 w-5 text-white" />
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
              />
            </label>
          </div>
          <div className="text-center">
            <h2 className="text-sm font-bold text-gray-950">{user.first_name} {user.last_name || ''}</h2>
            <p className="text-[10px] text-gray-400 font-medium">{user.role}</p>
          </div>
        </div>

        <nav className="space-y-1">
          <Link
            to="/account"
            className={`w-full flex items-center px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              isProfile ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <User className="h-4 w-4 mr-3" /> Profile Details
          </Link>
          <Link
            to="/account/orders"
            className={`w-full flex items-center px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              isOrders ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Package className="h-4 w-4 mr-3" /> My Orders
          </Link>
          <Link
            to="/account/wishlist"
            className={`w-full flex items-center px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${
              isWishlist ? 'bg-purple-50 text-purple-700' : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Heart className="h-4 w-4 mr-3" /> Wishlist ({wishlist.length})
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-xs font-semibold rounded-lg text-red-500 hover:bg-red-50 transition-colors mt-4"
          >
            <LogOut className="h-4 w-4 mr-3" /> Logout
          </button>
        </nav>
      </aside>

      {/* Content Panel */}
      <main className="flex-1 bg-white border border-gray-100 rounded-xl p-6 shadow-xxs">
        {isProfile && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-950">Profile Details</h2>
              <button
                onClick={() => setEditMode(!editMode)}
                className={`flex items-center text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                  editMode ? 'bg-gray-100 text-gray-600' : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                }`}
              >
                <Edit2 className="h-3 w-3 mr-1.5" />
                {editMode ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {editMode ? (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-500">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={user.email}
                    disabled
                    className="w-full bg-gray-100 border border-gray-200 rounded-lg px-3 py-2 text-gray-400 cursor-not-allowed"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-gray-500">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex items-center bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded-lg text-xs transition-colors shadow-xs"
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">First Name</span>
                  <span className="font-semibold text-gray-800">{user.first_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Last Name</span>
                  <span className="font-semibold text-gray-800">{user.last_name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Email Address</span>
                  <span className="font-semibold text-gray-800">{user.email}</span>
                </div>
                <div>
                  <span className="text-gray-400 block mb-1">Phone Number</span>
                  <span className="font-semibold text-gray-800">{user.phone || 'N/A'}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {isOrders && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-950 pb-4 border-b border-gray-100">Order History</h2>
            {orders && orders.length > 0 ? (
              <div className="space-y-4">
                {orders.map((ord) => (
                  <div key={ord.id} className="border border-gray-150 rounded-xl p-4 flex justify-between items-center text-xs">
                    <div>
                      <p className="font-mono text-purple-600 font-bold">{ord.id}</p>
                      <p className="text-gray-400 mt-1">Placed: {new Date(ord.created_at).toLocaleDateString()}</p>
                      <p className="text-gray-800 font-bold mt-1.5">{formatPrice(ord.total_amount)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <span className="bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase">
                        {ord.status}
                      </span>
                      <Link to={`/orders/${ord.id}`} className="text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center">
                        Track <ChevronRight className="h-4 w-4 ml-0.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-xs">No orders placed yet.</div>
            )}
          </div>
        )}

        {isWishlist && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-gray-950 pb-4 border-b border-gray-100">Wishlist</h2>
            {wishlist.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlist.map((item) => (
                  <ProductCard key={item.id} product={item} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-400 text-xs">Your wishlist is empty.</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
