import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ExternalLink, Package } from 'lucide-react';
import { apiFetch } from '../../services/api';
import AdminLayout from '../../components/AdminLayout';


export default function AdminUploads() {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8787';
  const cdnBase = import.meta.env.VITE_CDN_URL || API_URL;
  const maxUploadSizeMb = Number(import.meta.env.VITE_UPLOAD_LIMIT_MB || 25);
  const maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;

  // Let's fetch all images.
  // Wait, we don't have a special API `/api/admin/uploads` that returns all images in D1,
  // but since we query products which contain images, we can fetch all products and construct the list of files,
  // or define a simple fallback listing. Let's fetch the list of products and map their cover images,
  // or retrieve images. Let's make it fetch all products to pull all cover images and variant image paths.
  const { data: products, isLoading } = useQuery<any[]>({
    queryKey: ['adminProducts'],
    queryFn: () => apiFetch<any[]>('/api/admin/products')
  });

  const [uploading, setUploading] = useState(false);

  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${cdnBase}/${path}`;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
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

        if (!response.ok) {
          console.error(`Upload failed for ${file.name}`);
        }
      }
      alert('Uploads completed');
      // Note: For media manager without a global files table, we might not see the file immediately
      // unless we build a dedicated /api/admin/media endpoint to list all R2 objects.
    } catch (err: any) {
      alert(err.message || 'Failed to upload images');
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Media Manager</h1>
            <p className="text-xs text-gray-500 mt-1">Review uploaded files, thumbnail grids, and associated products</p>
          </div>
          <div>
            <label className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors flex items-center shadow-xs">
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Uploading...
                </>
              ) : (
                <>Upload Media</>
              )}
              <input 
                type="file" 
                multiple 
                accept="image/*,image/gif" 
                className="hidden" 
                onChange={handleFileUpload} 
                disabled={uploading} 
              />
            </label>
          </div>
        </div>

        {/* Media Grid */}
        <div className="bg-white border border-gray-200/60 rounded-xl shadow-xs p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
              {products?.filter((p) => p.cover_image).map((prod) => (
                <div key={prod.id} className="border border-gray-150 rounded-xl overflow-hidden shadow-xxs bg-gray-50 flex flex-col h-fit">
                  <div className="relative pb-[100%]">
                    <img
                      src={getFullImageUrl(prod.cover_image)}
                      alt={prod.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3 text-xxs space-y-1 bg-white">
                    <p className="font-semibold text-gray-950 truncate flex items-center">
                      <Package className="h-3 w-3 mr-1 text-purple-600 shrink-0" /> {prod.title}
                    </p>
                    <p className="text-gray-400 truncate font-mono select-all mt-0.5">{prod.cover_image}</p>
                    <a
                      href={getFullImageUrl(prod.cover_image)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-purple-600 font-bold hover:text-purple-700 flex items-center pt-2"
                    >
                      Open Link <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
              {products?.filter((p) => p.cover_image).length === 0 && (
                <div className="col-span-full text-center py-12 text-gray-400 text-xs">No media files uploaded yet.</div>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
