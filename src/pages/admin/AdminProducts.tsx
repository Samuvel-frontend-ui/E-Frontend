import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, Edit, Trash2, Eye, EyeOff, Package } from 'lucide-react';
import { apiFetch } from '../../services/api';
import { getFullImageUrl } from '../../utils/imageHelpers';
import AdminLayout from '../../components/AdminLayout';

interface ProductAdmin {
  id: string;
  title: string;
  slug: string;
  price: number;
  stock: number;
  reserved_stock: number;
  category_name?: string;
  is_published: number;
  cover_image?: string;
  sizes?: string[];
}

export default function AdminProducts() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: products, isLoading } = useQuery<ProductAdmin[]>({
    queryKey: ['adminProducts'],
    queryFn: () => apiFetch<ProductAdmin[]>('/api/admin/products')
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiFetch(`/api/admin/products/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      alert('Product deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete product');
    }
  });

  const confirmDelete = (id: string) => {
    deleteMutation.mutate(id);
    setDeletingId(null);
  };

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Product Catalog</h1>
            <p className="text-xs text-gray-500 mt-1">Manage items, pricing, inventory stock, and visibility</p>
          </div>
          <Link
            to="/admin/products/new"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2.5 rounded-lg text-xs flex items-center justify-center shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="h-4 w-4 mr-2" /> Add Product
          </Link>
        </div>

        {/* Products Table Wrapper */}
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
                    <th className="pb-3">Image</th>
                    <th className="pb-3">Product details</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Size</th>
                    <th className="pb-3">Stock Available</th>
                    <th className="pb-3 text-center">Status</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {products?.map((prod) => (
                    <tr key={prod.id} className="text-gray-600 hover:bg-gray-50/40">
                      {/* Product Image */}
                      <td className="py-4">
                        {prod.cover_image ? (
                          <img src={getFullImageUrl(prod.cover_image)} alt={prod.title} className="w-12 h-12 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-200 flex items-center justify-center rounded">
                            <Package className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </td>
                      {/* Product Name/Slug */}
                      <td className="py-4 font-semibold text-gray-950">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 leading-snug">{prod.title}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{prod.slug}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4">{prod.category_name || <span className="text-gray-300">Uncategorized</span>}</td>

                      {/* Price */}
                      <td className="py-4 font-semibold text-gray-900">{formatPrice(prod.price)}</td>

                      {/* Size List */}
                      <td className="py-4">
                        {prod.sizes && prod.sizes.length > 0 ? prod.sizes.join(', ') : '-'}
                      </td>

                      {/* Stock */}
                      <td className="py-4">
                        <span className={`font-semibold ${prod.stock - prod.reserved_stock <= 3 ? 'text-amber-600 font-bold' : 'text-gray-900'}`}>
                          {prod.stock - prod.reserved_stock} / {prod.stock}
                        </span>
                        {prod.reserved_stock > 0 && (
                          <span className="text-[10px] text-purple-500 block">({prod.reserved_stock} reserved)</span>
                        )}
                      </td>

                      {/* Status (published / hidden) */}
                      <td className="py-4 text-center">
                        {prod.is_published === 1 ? (
                          <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center justify-center w-fit mx-auto">
                            <Eye className="h-3 w-3 mr-1" /> Published
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center justify-center w-fit mx-auto">
                            <EyeOff className="h-3 w-3 mr-1" /> Hidden
                          </span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 text-right">
                        {deletingId === prod.id ? (
                          <div className="flex items-center justify-end space-x-2 text-[10px] bg-red-50 p-1.5 rounded-lg border border-red-100 w-fit ml-auto">
                            <span className="text-red-500 font-bold uppercase mr-1">Sure?</span>
                            <button onClick={() => confirmDelete(prod.id)} className="bg-red-500 text-white px-2 py-0.5 rounded hover:bg-red-600 transition-colors">Yes</button>
                            <button onClick={() => setDeletingId(null)} className="bg-gray-200 text-gray-700 px-2 py-0.5 rounded hover:bg-gray-300 transition-colors">No</button>
                          </div>
                        ) : (
                          <div className="space-x-2">
                            <button
                              onClick={() => navigate(`/admin/products/${prod.id}`)}
                              className="p-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
                              aria-label="Edit"
                            >
                              <Edit className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => setDeletingId(prod.id)}
                              className="p-1.5 border border-red-100 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              aria-label="Delete"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {products?.length === 0 && (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">No products found in catalog.</td>
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
