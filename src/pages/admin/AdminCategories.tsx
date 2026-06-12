import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Folder } from 'lucide-react';
import { apiFetch } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';

interface CategoryAdmin {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

export default function AdminCategories() {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch categories
  const { data: categories, isLoading } = useQuery<CategoryAdmin[]>({
    queryKey: ['adminCategories'],
    queryFn: () => apiFetch<CategoryAdmin[]>('/api/admin/categories')
  });

  // Create category mutation
  const createMutation = useMutation({
    mutationFn: (newCat: any) => apiFetch('/api/admin/categories', { method: 'POST', json: newCat }),
    onSuccess: () => {
      setName('');
      setSlug('');
      setDescription('');
      setFormError('');
      alert('Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
    },
    onError: (err: any) => {
      setFormError(err.message || 'Failed to create category');
    }
  });

  // Delete category mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/categories/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      alert('Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminCategories'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete category');
    }
  });

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    if (!name.trim()) {
      setFormError('Category name is required.');
      return;
    }
    if (name.trim().length < 3) {
      setFormError('Category name must be at least 3 characters.');
      return;
    }
    createMutation.mutate({ 
      name: name.trim(), 
      slug: slug || name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), 
      description: description.trim() 
    });
  };

  const confirmDelete = (id: string) => {
    deleteMutation.mutate(id);
    setDeletingId(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Category Collections</h1>
          <p className="text-xs text-gray-500 mt-1">Organize products into distinct groupings for easier storefront discovery</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Create Category Form */}
          <div className="bg-white border border-gray-200/60 rounded-xl shadow-xs p-6 space-y-4">
            <h2 className="font-bold text-gray-950 text-sm">Add New Category</h2>
            {formError && <p className="text-xs text-red-500 font-semibold">{formError}</p>}
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-gray-500">Category Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={handleNameChange}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                  required
                />
              </div>



              <div className="space-y-1">
                <label className="font-semibold text-gray-500">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2.5 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg shadow-xs transition-colors flex items-center justify-center"
              >
                <Plus className="h-4 w-4 mr-2" /> Add Category
              </button>
            </form>
          </div>

          {/* Categories List */}
          <div className="md:col-span-2 bg-white border border-gray-200/60 rounded-xl shadow-xs p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 font-bold">
                      <th className="pb-3">Collection details</th>
                      <th className="pb-3">Slug</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {categories?.map((cat) => (
                      <tr key={cat.id} className="text-gray-600 hover:bg-gray-50/40">
                        <td className="py-4 font-semibold text-gray-900 flex items-center">
                          <Folder className="h-4.5 w-4.5 mr-2.5 text-purple-600 shrink-0" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-snug">{cat.name}</p>
                            {cat.description && <p className="text-[10px] text-gray-400 font-normal line-clamp-1 mt-0.5">{cat.description}</p>}
                          </div>
                        </td>
                        <td className="py-4 font-mono">{cat.slug}</td>
                        <td className="py-4 text-right">
                          {deletingId === cat.id ? (
                            <div className="flex items-center justify-end space-x-2 text-[10px] bg-red-50 p-1.5 rounded-lg border border-red-100 w-fit ml-auto">
                              <span className="text-red-500 font-bold uppercase mr-1">Sure?</span>
                              <button onClick={() => confirmDelete(cat.id)} className="bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 transition-colors">Yes</button>
                              <button onClick={() => setDeletingId(null)} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded hover:bg-gray-300 transition-colors">No</button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setDeletingId(cat.id)}
                              className="p-1.5 border border-red-100 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                    {categories?.length === 0 && (
                      <tr>
                        <td colSpan={3} className="text-center py-12 text-gray-400">No categories created yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
