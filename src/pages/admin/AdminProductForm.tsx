import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Plus, Trash2, Upload } from 'lucide-react';
import { apiFetch } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';
import { getFullImageUrl } from '../../utils/imageHelpers';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface VariantInput {
  title: string;
  price: number;
  stock: number;
}

export default function AdminProductForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Core product details state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [lowStockAlert, setLowStockAlert] = useState(5);
  const [categoryId, setCategoryId] = useState('');
  const [isPublished, setIsPublished] = useState(1);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [formError, setFormError] = useState('');

  // Variants builder
  const [variants, setVariants] = useState<VariantInput[]>([]);
  const [newVarTitle, setNewVarTitle] = useState('');
  const [newVarPrice, setNewVarPrice] = useState(0);
  const [newVarStock, setNewVarStock] = useState(0);

  // Upload image state
  const [uploading, setUploading] = useState(false);
  const [productImages, setProductImages] = useState<any[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/api/categories')
  });

  // Fetch product if editing – loads from admin products list and finds by id
  const { data: productData, isLoading: isProductLoading } = useQuery<any>({
    queryKey: ['adminProductDetail', id],
    queryFn: async () => {
      const allProds = await apiFetch<any[]>('/api/admin/products');
      const found = allProds.find((p) => p.id === id);
      if (!found) throw new Error('Product not found');
      return found;
    },
    enabled: isEdit
  });

  // Automatically update form fields when edit data arrives
  useEffect(() => {
    if (productData) {
      setTitle(productData.title || '');
      setSlug(productData.slug || '');
      setDescription(productData.description || '');
      setPrice(productData.price || 0);
      setStock(productData.stock || 0);
      setLowStockAlert(productData.low_stock_alert || 5);
      setCategoryId(productData.category_id || '');
      setIsPublished(productData.is_published);
      setMetaTitle(productData.meta_title || '');
      setMetaDescription(productData.meta_description || '');
      loadImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productData]);

  const loadImages = async () => {
    try {
      if (productData?.slug) {
        const details = await apiFetch<any>(`/api/products/${productData.slug}`);
        if (details.images) setProductImages(details.images);
        if (details.variants) {
          setVariants(details.variants.map((v: any) => ({
            title: v.title,
            price: v.price || productData.price,
            stock: v.stock
          })));
        }
      }
    } catch { /* ignore */ }
  };

  // Generate slug dynamically from title if not custom-edited
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!isEdit) {
      setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    }
  };

  // Add Variant Action
  const handleAddVariant = () => {
    if (!newVarTitle) {
      alert('Variant title is required');
      return;
    }
    setVariants([...variants, {
      title: newVarTitle,
      price: newVarPrice || price,
      stock: newVarStock
    }]);
    setNewVarTitle('');
    setNewVarPrice(0);
    setNewVarStock(0);
  };

  const handleRemoveVariant = (idx: number) => {
    setVariants(variants.filter((_, i) => i !== idx));
  };

  // File upload action
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isEdit && id) {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('product_id', id);

      try {
        const response = await fetch(`${API_URL}/api/admin/uploads`, {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });

        if (!response.ok) throw new Error('Upload failed');
        alert('Image uploaded successfully');
        loadImages();
      } catch (err: any) {
        alert(err.message || 'Failed to upload image');
      } finally {
        setUploading(false);
      }
    } else {
      setPendingFiles([...pendingFiles, file]);
    }
  };

  const removePendingFile = (idx: number) => {
    setPendingFiles(pendingFiles.filter((_, i) => i !== idx));
  };

  const deleteImageMutation = useMutation({
    mutationFn: (imageId: string) =>
      apiFetch(`/api/admin/products/${id}/images/${imageId}`, {
        method: 'DELETE'
      }),
    onSuccess: () => {
      alert('Image deleted successfully');
      loadImages();
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to delete image');
    }
  });

  const handleImageDelete = (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      deleteImageMutation.mutate(imageId);
    }
  };

  // Product save action
  const saveMutation = useMutation({
    mutationFn: async (payload: any) => {
      const path = isEdit ? `/api/admin/products/${id}` : '/api/admin/products';
      const method = isEdit ? 'PUT' : 'POST';
      const response = await fetch(`${API_URL}${path}`, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || 'Failed to save product');
      }
      return response.json();
    },
    onSuccess: async (data: any) => {
      const productId = isEdit ? id : data.id;

      if (!isEdit && pendingFiles.length > 0 && productId) {
        setUploading(true);
        try {
          for (const file of pendingFiles) {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('product_id', productId);
            await fetch(`${API_URL}/api/admin/uploads`, {
              method: 'POST',
              body: formData,
              credentials: 'include'
            });
          }
        } catch (err) {
          console.error('Failed to upload some images', err);
        } finally {
          setUploading(false);
        }
      }

      alert('Product saved successfully');
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      navigate('/admin/products');
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to save product');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Product title is required.');
      return;
    }
    if (Number(price) < 0) {
      setFormError('Price cannot be negative.');
      return;
    }
    if (Number(stock) < 0) {
      setFormError('Stock count cannot be negative.');
      return;
    }
    if (Number(lowStockAlert) < 0) {
      setFormError('Low stock alert cannot be negative.');
      return;
    }

    const payload = {
      title: title.trim(),
      slug: slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: description.trim(),
      price: Number(price),
      stock: Number(stock),
      low_stock_alert: Number(lowStockAlert),
      category_id: categoryId || null,
      is_published: Number(isPublished),
      meta_title: metaTitle || null,
      meta_description: metaDescription || null,
      variants
    };

    saveMutation.mutate(payload);
  };

  return (
    <AdminLayout>
      <div className="space-y-8 max-w-4xl">
        {/* Back and Title */}
        <div className="flex items-center space-x-4">
          <Link to="/admin/products" className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-500">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              {isEdit ? 'Edit Product' : 'Create New Product'}
            </h1>
          </div>
        </div>

        {isEdit && isProductLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Core details card */}
            <div className="bg-white border border-gray-200/60 rounded-xl shadow-xs p-6 space-y-6">
              <h2 className="font-bold text-gray-950 text-sm">Product details</h2>
              {formError && (
                <div className="bg-red-50 text-red-600 text-xs font-semibold p-3 rounded-lg border border-red-100">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-gray-500">Product Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="font-semibold text-gray-500">Description *</label>
                  <textarea
                    rows={4}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="grid grid-cols-3 gap-4 sm:col-span-2">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500">Price (INR) *</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500">Stock count *</label>
                    <input
                      type="number"
                      value={stock}
                      onChange={(e) => setStock(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-500">Low Stock Alert *</label>
                    <input
                      type="number"
                      value={lowStockAlert}
                      onChange={(e) => setLowStockAlert(Number(e.target.value))}
                      className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-gray-500">Category Collection *</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:ring-1 focus:ring-purple-500 focus:outline-hidden"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>


              </div>
            </div>

            {/* Images section */}
            <div className="bg-white border border-gray-200/60 rounded-xl shadow-xs p-6 space-y-6">
              <h2 className="font-bold text-gray-950 text-sm">Product Images</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {productImages.map((img) => (
                  <div key={img.id} className="relative pb-[100%] bg-gray-50 rounded-lg overflow-hidden border border-gray-150">
                    {img.image_path ? (
                      <img
                        src={getFullImageUrl(img.image_path)}
                        alt="Product"
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-gray-400">
                        No image
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => handleImageDelete(img.id)}
                      className="absolute top-1 right-1 bg-white p-1.5 rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {!isEdit && pendingFiles.map((file, idx) => (
                  <div key={idx} className="relative pb-[100%] bg-gray-50 rounded-lg overflow-hidden border border-gray-150">
                    <img
                      src={URL.createObjectURL(file)}
                      alt="Pending"
                      className="absolute inset-0 w-full h-full object-cover opacity-70"
                    />
                    <button
                      type="button"
                      onClick={() => removePendingFile(idx)}
                      className="absolute top-1 right-1 bg-white p-1.5 rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors"
                      title="Remove Image"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}

                {/* Upload placeholder */}
                <label className="relative pb-[100%] border-2 border-dashed border-gray-200 hover:border-purple-500 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400 hover:text-purple-600 bg-gray-50/50">
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                    <Upload className="h-6 w-6 mb-2" />
                    <span className="text-[10px] font-semibold">
                      {uploading ? 'Uploading...' : 'Upload Image'}
                    </span>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              </div>
            </div>





            {/* Save Button */}
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 px-6 rounded-lg text-xs flex items-center justify-center shadow-xs transition-colors w-fit"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Saving product...' : 'Save Product Details'}
            </button>
          </form>
        )}
      </div>
    </AdminLayout>
  );
}
