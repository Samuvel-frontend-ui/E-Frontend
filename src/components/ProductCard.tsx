import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { getFullImageUrl } from '../utils/imageHelpers';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    price: number;
    cover_image: string;
    category_name?: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);
  const isWishlisted = isInWishlist(product.id);
  const [isAdded, setIsAdded] = useState(false);

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR'
  }).format(product.price);

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleWishlist({
      id: product.id,
      title: product.title,
      slug: product.slug,
      price: product.price,
      cover_image: product.cover_image
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      coverImage: product.cover_image
    });
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const imageUrl = getFullImageUrl(product.cover_image);


  return (
    <div className="group relative bg-white border border-gray-100 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col h-full">
      {/* Product Image */}
      <Link to={`/products/${product.slug}`} className="block overflow-hidden relative pb-[100%] bg-gray-50">
        <img
          src={imageUrl}
          alt={product.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs p-2 rounded-full shadow-xs hover:bg-white transition-colors z-10"
          aria-label="Toggle Wishlist"
        >
          <Heart
            className={`h-4 w-4 transition-colors ${
              isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600 hover:text-red-500'
            }`}
          />
        </button>
      </Link>

      {/* Info & Details */}
      <div className="p-4 flex flex-col flex-1">
        {product.category_name && (
          <span className="text-xxs font-bold uppercase tracking-wider text-purple-600 mb-1">
            {product.category_name}
          </span>
        )}
        <Link to={`/products/${product.slug}`} className="block flex-1">
          <h3 className="text-sm font-semibold text-gray-950 group-hover:text-purple-600 transition-colors line-clamp-1 mb-1">
            {product.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between mt-3">
          <span className="text-sm font-bold text-gray-950">{formattedPrice}</span>
          <button
            onClick={handleAddToCart}
            disabled={isAdded}
            className={`${
              isAdded ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-purple-50 hover:bg-purple-100 text-purple-600'
            } px-3 py-2 rounded-lg transition-colors flex items-center justify-center text-xs font-semibold whitespace-nowrap`}
            aria-label="Add to cart"
          >
            {isAdded ? 'Added to Cart' : <><ShoppingBag className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Add</span></>}
          </button>
        </div>
      </div>
    </div>
  );
}
