import React, { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Lock, ShieldAlert, UserPlus, Image as ImageIcon, Trash2 } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { useAuthStore } from '../../stores/authStore';
import AdminLayout from '../../components/AdminLayout';
import { getFullImageUrl } from '../../utils/imageHelpers';

export default function AdminSettings() {
  const [searchParams] = useSearchParams();
  const forceChange = searchParams.get('force_change') === '1';
  const { user, setUser } = useAuthStore();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const maxUploadSizeMb = Number(import.meta.env.VITE_UPLOAD_LIMIT_MB || 25);
  const maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;


  // Password change state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Super Admin state: Create Admin
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminRole, setAdminRole] = useState<'ADMIN' | 'SUPER_ADMIN'>('ADMIN');
  const [adminError, setAdminError] = useState('');

  // Hero Settings state
  const [heroImages, setHeroImages] = useState<string[]>([]);
  const [uploadingHero, setUploadingHero] = useState(false);

  // Fetch settings
  const { data: settings } = useQuery({
    queryKey: ['adminSettings'],
    queryFn: () => apiFetch<any[]>('/api/admin/settings')
  });

  // Fetch admins
  const { data: adminUsers, refetch: refetchAdmins } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: () => apiFetch<any[]>('/api/admin/users'),
    enabled: user?.role === 'SUPER_ADMIN'
  });

  React.useEffect(() => {
    if (settings) {
      const heroSetting = settings.find(s => s.key === 'hero_images');
      if (heroSetting) {
        try {
          const parsed = JSON.parse(heroSetting.value);
          setHeroImages(Array.isArray(parsed) ? parsed.filter(Boolean) : []);
        } catch {
          setHeroImages([]);
        }
      } else {
        setHeroImages([]);
      }
    }
  }, [settings]);

  const updateSettingsMutation = useMutation({
    mutationFn: (newSettings: any) =>
      apiFetch('/api/admin/settings', {
        method: 'PUT',
        json: newSettings
      }),
    onSuccess: () => alert('Settings updated successfully'),
    onError: (err: any) => alert(err.message || 'Failed to update settings')
  });

  const saveHeroImages = (nextImages: string[]) => {
    const cleaned = nextImages.filter(Boolean);
    setHeroImages(cleaned);
    updateSettingsMutation.mutate({ hero_images: JSON.stringify(cleaned) });
  };

  const handleHeroImageDelete = (index: number) => {
    const updatedUrls = heroImages.filter((_, i) => i !== index);
    saveHeroImages(updatedUrls);
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingHero(true);
    try {
      const newUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > maxUploadSizeBytes) {
          throw new Error(`${file.name} is too large. Maximum upload size is ${maxUploadSizeMb}MB.`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/api/admin/uploads`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Upload failed');
        const data = await response.json();
        const uploadedUrl = data.image?.image_path || data.url;
        if (uploadedUrl) {
          newUrls.push(uploadedUrl);
        }
      }
      
      saveHeroImages([...heroImages, ...newUrls]);
    } catch (err: any) {
      alert(err.message || 'Failed to upload hero images');
    } finally {
      setUploadingHero(false);
    }
  };

  // Password change mutation
  const changePasswordMutation = useMutation({
    mutationFn: (pwd: string) =>
      apiFetch('/api/auth/force-change-password', {
        method: 'POST',
        json: { newPassword: pwd }
      }),
    onSuccess: () => {
      alert('Password updated successfully! Welcome to your admin dashboard.');
      if (user) {
        setUser({ ...user, force_password_change: false });
      }
      navigate('/admin/dashboard');
    },
    onError: (err: any) => {
      setPasswordError(err.message || 'Failed to update password');
    }
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    changePasswordMutation.mutate(newPassword);
  };

  // Create Admin user mutation
  const createAdminMutation = useMutation({
    mutationFn: (newAdmin: any) =>
      apiFetch('/api/admin/users', {
        method: 'POST',
        json: newAdmin
      }),
    onSuccess: () => {
      setAdminEmail('');
      setAdminPassword('');
      setAdminError('');
      alert('Admin account created successfully');
      refetchAdmins();
    },
    onError: (err: any) => {
      setAdminError(err.message || 'Failed to create admin user');
    }
  });

  // Delete Admin user mutation
  const deleteAdminMutation = useMutation({
    mutationFn: (adminId: string) =>
      apiFetch(`/api/admin/users/${adminId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      alert('Admin account deleted successfully');
      refetchAdmins();
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete admin user');
    }
  });

  const handleCreateAdmin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    if (!adminEmail || !adminPassword) return;
    createAdminMutation.mutate({
      email: adminEmail,
      password: adminPassword,
      role: adminRole
    });
  };


  // If force password change layout is active
  if (forceChange || user?.force_password_change) {
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center px-4">
        <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-purple-950/50 w-12 h-12 rounded-full flex items-center justify-center mx-auto text-purple-400">
              <Lock className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white font-sans">Update Default Password</h1>
            <p className="text-xs text-gray-500">You must update your default development password before proceeding.</p>
          </div>

          {passwordError && (
            <div className="bg-red-950/20 border border-red-900/30 rounded-lg p-3 flex items-start text-xs text-red-400">
              <ShieldAlert className="h-4 w-4 mr-2 shrink-0 mt-0.5" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">New Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-gray-500 tracking-wider">Confirm New Password</label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-gray-950 border border-gray-800 rounded-lg px-4 py-2.5 text-xs text-white focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={changePasswordMutation.isPending}
              className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-450 text-white font-semibold py-3 rounded-lg text-xs transition-colors flex items-center justify-center"
            >
              {changePasswordMutation.isPending ? 'Updating...' : 'Change Password'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const canManageHeroImages = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">System Settings</h1>
          <p className="text-xs text-gray-500 mt-1">Configure global configurations, run database backups, and manage roles</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

          {/* Super Admin: Create Admin Account */}
          {isSuperAdmin && (
            <div className="bg-white border border-gray-200/60 rounded-xl shadow-xs p-6 space-y-4">
              <h2 className="font-bold text-gray-950 text-sm flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-purple-600" /> Create Administrator Account
              </h2>
              {adminError && <p className="text-xs text-red-500 font-semibold">{adminError}</p>}
              <form onSubmit={handleCreateAdmin} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-semibold text-gray-500">Admin Email *</label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-500">Initial Password *</label>
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-500">System Role *</label>
                  <select
                    value={adminRole}
                    onChange={(e) => setAdminRole(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="SUPER_ADMIN">SUPER_ADMIN</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={createAdminMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg shadow-xs transition-colors flex items-center justify-center"
                >
                  Create Account
                </button>
              </form>

              {/* Admin Users List */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="font-bold text-gray-950 text-xs mb-3">Existing Administrators</h3>
                <div className="space-y-2">
                  {adminUsers?.map((admin: any) => (
                    <div key={admin.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-100 rounded-lg text-xs">
                      <div>
                        <p className="font-semibold text-gray-900">{admin.email}</p>
                        <p className="text-gray-500">{admin.role}</p>
                      </div>
                      {admin.id !== user?.id && (
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this admin?')) {
                              deleteAdminMutation.mutate(admin.id);
                            }
                          }}
                          className="text-red-500 hover:text-red-700 p-1 bg-white border border-gray-200 rounded shadow-xs transition-colors"
                          title="Delete Admin"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Hero Images Settings */}
          {canManageHeroImages && (
            <div className="bg-white border border-gray-200/60 rounded-xl shadow-xs p-6 space-y-4">
              <h2 className="font-bold text-gray-950 text-sm flex items-center">
                <ImageIcon className="h-5 w-5 mr-2 text-purple-600" /> Hero Section Images
              </h2>
              <div className="space-y-4">
                 <div>
                   <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors inline-flex items-center">
                     {uploadingHero ? 'Uploading...' : 'Upload Transparent Images/GIFs'}
                     <input type="file" multiple accept="image/*,image/gif" className="hidden" onChange={handleHeroUpload} disabled={uploadingHero} />
                   </label>
                 </div>
                 {/* Display Hero Images */}
                 <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-4">
                   {heroImages.length > 0 ? heroImages.map((url: string, idx: number) => (
                     <div key={`${url}-${idx}`} className="relative pb-[50%] bg-gray-50 rounded border border-gray-200 overflow-hidden">
                       <img src={getFullImageUrl(url)} alt={`Hero ${idx}`} className="absolute inset-0 w-full h-full object-cover" />
                       <button
                         onClick={() => handleHeroImageDelete(idx)}
                         className="absolute top-1 right-1 bg-white p-1 rounded shadow text-gray-500 hover:text-red-600 transition-colors"
                         title="Delete Image"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                     </div>
                   )) : (
                     <p className="text-xs text-gray-400">No hero images uploaded yet.</p>
                   )}
                 </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
