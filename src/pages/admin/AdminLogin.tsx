import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldAlert } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { apiFetch } from '../../services/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await apiFetch<{ user: any }>('/api/auth/admin/login', {
        method: 'POST',
        json: { email, password }
      });

      setUser(data.user);
      
      if (data.user.force_password_change) {
        navigate('/admin/settings?force_change=1');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email, password or insufficient permissions');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="bg-purple-950/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-purple-400">
            <Lock className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-white">Admin Control Center</h1>
          <p className="text-xs text-gray-500">Sign in with administrator credentials</p>
        </div>

        {error && (
          <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3.5 flex items-start text-xs text-red-400">
            <ShieldAlert className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Email Address</label>
            <input
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-hidden focus:ring-1 focus:ring-purple-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-450 text-white font-semibold py-3 rounded-lg text-xs transition-colors flex items-center justify-center shadow-md shadow-purple-950/20"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
