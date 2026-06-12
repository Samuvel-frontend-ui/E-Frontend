import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiFetch } from '../services/api';
import ProductCard from '../components/ProductCard';

interface ProductsResponse {
  products: any[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Sync params with query state
  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Categories query
  const { data: categories } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: () => apiFetch<Category[]>('/api/categories')
  });

  // Products query (refetches when parameters change)
  const { data: productData, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['products', q, category, sort, page],
    queryFn: () => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (category) params.set('category', category);
      if (sort) params.set('sort', sort);
      params.set('page', String(page));
      params.set('limit', '8');
      return apiFetch<ProductsResponse>(`/api/products?${params.toString()}`);
    }
  });

  // Filter updates
  const setParam = (key: string, val: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (val) {
      newParams.set(key, val);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset page to 1
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage: number) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', String(newPage));
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Title / Mobile Filter Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-gray-100 pb-5 mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">
            {category
              ? categories?.find((c) => c.slug === category)?.name || 'Collection'
              : 'All Products'}
          </h1>
          {q && (
            <p className="text-xs text-gray-500 mt-1">
              Search results for <span className="font-semibold text-purple-600">"{q}"</span> ({productData?.pagination?.total || 0} products)
            </p>
          )}
        </div>

        {/* Mobile controls */}
        <div className="flex w-full sm:w-auto items-center justify-between sm:justify-end gap-3 md:hidden">
          <button
            onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
            className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" /> Filters
          </button>

          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="bg-white border border-gray-200 px-3 py-2 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Sort: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Releases</option>
          </select>
        </div>

        {/* Desktop controls */}
        <div className="hidden md:flex items-center gap-4">
          <select
            value={sort}
            onChange={(e) => setParam('sort', e.target.value)}
            className="bg-white border border-gray-200 px-4 py-2 rounded-lg text-xs font-semibold focus:outline-hidden focus:ring-1 focus:ring-purple-500"
          >
            <option value="">Sort: Default</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest Releases</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar filters (Desktop) */}
        <aside className="hidden md:block w-64 shrink-0 space-y-8">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-900 mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setParam('category', '')}
                  className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${
                    !category ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  All Categories
                </button>
              </li>
              {categories?.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => setParam('category', cat.slug)}
                    className={`w-full text-left text-sm py-1.5 px-3 rounded-lg transition-colors ${
                      category === cat.slug ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Mobile Filters Drawer Overlay */}
        {mobileFiltersOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex justify-end">
            <div className="bg-white w-72 h-full p-6 overflow-y-auto flex flex-col justify-between">
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-950">Filters</h3>
                  <button
                    onClick={() => setMobileFiltersOpen(false)}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-600"
                  >
                    Close
                  </button>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-400 mb-4 tracking-wider">Categories</h4>
                  <ul className="space-y-2">
                    <li>
                      <button
                        onClick={() => { setParam('category', ''); setMobileFiltersOpen(false); }}
                        className={`w-full text-left text-xs py-2 px-3 rounded-lg ${
                          !category ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        All Categories
                      </button>
                    </li>
                    {categories?.map((cat) => (
                      <li key={cat.id}>
                        <button
                          onClick={() => { setParam('category', cat.slug); setMobileFiltersOpen(false); }}
                          className={`w-full text-left text-xs py-2 px-3 rounded-lg ${
                            category === cat.slug ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {cat.name}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Product Grid & Loader */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl h-72 shadow-xxs" />
              ))}
            </div>
          ) : productData?.products && productData.products.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
              {productData.products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-xl p-12 text-center max-w-md mx-auto mt-12 shadow-xs">
              <p className="text-gray-500 font-medium mb-4">No products found matching your filters.</p>
              <button
                onClick={() => setSearchParams({})}
                className="bg-purple-600 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          )}

          {/* Pagination */}
          {productData?.pagination && productData.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-12 border-t border-gray-100 pt-6">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: productData.pagination.totalPages }).map((_, idx) => {
                const p = idx + 1;
                return (
                  <button
                    key={p}
                    onClick={() => handlePageChange(p)}
                    className={`w-9 h-9 rounded-lg border text-xs font-semibold transition-all ${
                      p === page
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === productData.pagination.totalPages}
                className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
