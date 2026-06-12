import  { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, RotateCcw, ShieldCheck } from 'lucide-react';
import { apiFetch } from '../services/api';
import ProductCard from '../components/ProductCard';
import { getFullImageUrl } from '../utils/imageHelpers';

interface ProductsResponse {
  products: any[];
}

export default function Home() {
  const { data, isLoading } = useQuery<ProductsResponse>({
    queryKey: ['featuredProducts'],
    queryFn: () => apiFetch<ProductsResponse>('/api/products?limit=4')
  });

  const { data: settings } = useQuery({
    queryKey: ['publicSettings'],
    queryFn: () => apiFetch<any[]>('/api/settings')
  });

// removed local getFullImageUrl function

  const heroImages = useMemo(() => {
    if (!settings) return [];
    const heroSetting = settings.find((s: any) => s.key === 'hero_images');
    if (heroSetting) {
      try {
        return JSON.parse(heroSetting.value);
      } catch {
        return [];
      }
    }
    return [];
  }, [settings]);

  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);

  useEffect(() => {
    if (heroImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentHeroIndex(prev => (prev + 1) % heroImages.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [heroImages]);

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative bg-purple-900 rounded-2xl overflow-hidden py-25 min-h-[500px] px-8 sm:px-16 text-white mt-6 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="absolute inset-0 bg-radial from-transparent to-purple-950/80 pointer-events-none" />
        <div className="relative z-10 max-w-lg space-y-6 text-center sm:text-left">
          <span className="bg-purple-800 text-purple-200 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">
            Premium Serverless Shopping
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-tight">
            Discover a Premium Shopping Flow
          </h1>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              to="/shop"
              className="bg-white text-purple-950 hover:bg-purple-50 text-sm font-semibold px-6 py-3 rounded-lg flex items-center justify-center transition-colors shadow-xs"
            >
              Shop All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              to="/shop?category=t-shirt"
              className="bg-purple-800 hover:bg-purple-700 text-purple-100 text-sm font-semibold px-6 py-3 rounded-lg flex items-center justify-center transition-colors"
            >
              Browse T-Shirts
            </Link>
          </div>
        </div>

        {heroImages.length > 0 && (
          <img
            src={getFullImageUrl(heroImages[currentHeroIndex])}
            alt="Hero Presentation"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-7xl mx-auto px-4">
        <div className="bg-white border border-gray-100 p-6 rounded-xl flex items-start space-x-4 shadow-xxs">
          <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
            <Truck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-950 text-sm mb-1">Free & Fast Delivery</h3>
            <p className="text-xs text-gray-500">Free shipping on all orders over ₹999 across India.</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-xl flex items-start space-x-4 shadow-xxs">
          <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
            <RotateCcw className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-950 text-sm mb-1">Easy Returns</h3>
            <p className="text-xs text-gray-500">Not satisfied? Return within 14 days for a full refund.</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 p-6 rounded-xl flex items-start space-x-4 shadow-xxs">
          <div className="bg-purple-50 p-3 rounded-lg text-purple-600">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-950 text-sm mb-1">Secure checkout</h3>
            <p className="text-xs text-gray-500">Safe payments powered by Razorpay Test Mode.</p>
          </div>
        </div>
      </section>

      {/* Category Collections Banner */}
      <section className="space-y-6 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-gray-950">Shop by Collection</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link
            to="/shop?category=t-shirt"
            className="group relative h-48 bg-purple-950 rounded-xl overflow-hidden block shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop"
              alt="T-Shirts"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
            />
            <div className="absolute bottom-5 left-5 z-20 text-white">
              <span className="text-xxs font-bold uppercase tracking-wider text-purple-300">Casual Wear</span>
              <h3 className="text-lg font-bold">T-Shirts</h3>
            </div>
          </Link>
          <Link
            to="/shop?category=shirt"
            className="group relative h-48 bg-purple-950 rounded-xl overflow-hidden block shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=500&auto=format&fit=crop"
              alt="Shirts"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
            />
            <div className="absolute bottom-5 left-5 z-20 text-white">
              <span className="text-xxs font-bold uppercase tracking-wider text-purple-300">Formal & Casual</span>
              <h3 className="text-lg font-bold">Shirts</h3>
            </div>
          </Link>
          <Link
            to="/shop?category=cap"
            className="group relative h-48 bg-purple-950 rounded-xl overflow-hidden block shadow-sm"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 to-transparent z-10" />
            <img
              src="https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=500&auto=format&fit=crop"
              alt="Caps"
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-60"
            />
            <div className="absolute bottom-5 left-5 z-20 text-white">
              <span className="text-xxs font-bold uppercase tracking-wider text-purple-300">Accessories</span>
              <h3 className="text-lg font-bold">Caps</h3>
            </div>
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="space-y-6 max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold tracking-tight text-gray-950">Trending Now</h2>
          <Link to="/shop" className="text-purple-600 hover:text-purple-700 text-xs font-semibold flex items-center">
            View All <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse bg-white border border-gray-100 rounded-xl h-64 shadow-xxs" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {data?.products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
