import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Heart, ShoppingBag, Star, AlertTriangle, ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react';
import { apiFetch } from '../services/api';
import { getFullImageUrl } from '../utils/imageHelpers';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';

interface ProductDetailResponse {
  product: any;
  images: any[];
  variants: any[];
}

export default function ProductDetails() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [quantity, setQuantity] = useState(1);

  const queryClient = useQueryClient();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const addItem = useCartStore((state) => state.addItem);
  const { isAuthenticated } = useAuthStore();

  // Fetch Product Details
  const { data: detailData, isLoading, error } = useQuery<ProductDetailResponse>({
    queryKey: ['product', slug],
    queryFn: () => apiFetch<ProductDetailResponse>(`/api/products/${slug}`)
  });

  const product = detailData?.product;
  const images = detailData?.images || [];
  const variants = detailData?.variants || [];

  // Fetch Reviews
  const { data: reviews } = useQuery<any[]>({
    queryKey: ['reviews', product?.id],
    queryFn: () => apiFetch<any[]>(`/api/reviews?product_id=${product?.id}`),
    enabled: !!product?.id
  });

  // Submit Review Mutation
  const addReviewMutation = useMutation({
    mutationFn: (newReview: { product_id: string; rating: number; comment: string }) =>
      apiFetch('/api/reviews', { method: 'POST', json: newReview }),
    onSuccess: (data: any) => {
      alert(data.message || 'Review submitted successfully!');
      setReviewComment('');
      queryClient.invalidateQueries({ queryKey: ['reviews', product?.id] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to submit review');
    }
  });

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      alert('You must be logged in to submit a review');
      return;
    }
    addReviewMutation.mutate({
      product_id: product.id,
      rating: reviewRating,
      comment: reviewComment
    });
  };

  const handleAddToCart = () => {
    if (!product) return;

    let finalPrice = product.price;
    let finalTitle = product.title;
    let variantTitle = '';

    if (selectedVariantId) {
      const variant = variants.find((v) => v.id === selectedVariantId);
      if (variant) {
        variantTitle = variant.title;
        if (variant.price !== null) {
          finalPrice = variant.price;
        }
      }
    } else if (variants.length > 0) {
      alert('Please select a variant option first');
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariantId || undefined,
      title: finalTitle,
      variantTitle: variantTitle || undefined,
      price: finalPrice,
      coverImage: product.cover_image,
      quantity
    });
    alert('Item added to cart!');
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-md mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-gray-950 mb-2">Product Not Found</h2>
        <p className="text-gray-500 mb-6">The product you are looking for might have been removed or is temporarily unavailable.</p>
        <Link to="/shop" className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Stock status
  const selectedVariant = selectedVariantId ? variants.find((v) => v.id === selectedVariantId) : null;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentReserved = selectedVariant ? selectedVariant.reserved_stock : product.reserved_stock;
  const availableStock = currentStock - currentReserved;
  const isLowStock = availableStock <= (product.low_stock_alert || 5) && availableStock > 0;
  const isOutOfStock = availableStock <= 0;

  const galleryList = images.length > 0 ? images.map((img) => img.image_path) : [product.cover_image];

  return (
    <div className="max-w-none space-y-16">
      {/* Product Information Details Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        {/* Swipe Gallery */}
        <div className="space-y-4">
          <div className="relative pb-[100%] bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 shadow-xxs">
            {galleryList[activeImageIndex] ? (
              <img
                src={getFullImageUrl(galleryList[activeImageIndex])}
                alt={product.title}
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">No Image</div>
            )}

            {galleryList.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : galleryList.length - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-xs p-2 rounded-full shadow-xs hover:bg-white text-gray-700 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveImageIndex((prev) => (prev < galleryList.length - 1 ? prev + 1 : 0))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 backdrop-blur-xs p-2 rounded-full shadow-xs hover:bg-white text-gray-700 transition-colors"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail list */}
          {galleryList.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto py-1">
              {galleryList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 ${idx === activeImageIndex ? 'border-purple-600' : 'border-transparent'
                    }`}
                >
                  <img src={getFullImageUrl(img)} alt="Thumbnail" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Form */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50 px-3 py-1 rounded-full">
              {product.category_name}
            </span>
            <h1 className="text-3xl font-bold tracking-tight text-gray-950 mt-2">{product.title}</h1>
          </div>

          {/* Price */}
          <div className="text-2xl font-bold text-gray-950">
            {new Intl.NumberFormat('en-IN', {
              style: 'currency',
              currency: 'INR'
            }).format(selectedVariant?.price !== null && selectedVariant?.price !== undefined ? selectedVariant.price : product.price)}
          </div>

          <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>

          {/* Variants */}
          {variants.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs font-bold uppercase text-gray-500 tracking-wider">Select Size</label>
              <div className="flex flex-wrap gap-2">
                {variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`border px-4 py-2.5 rounded-lg text-xs font-semibold transition-all ${selectedVariantId === v.id
                        ? 'border-purple-600 bg-purple-50 text-purple-700 font-bold'
                        : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                  >
                    {v.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Alerts */}
          <div className="pt-2">
            {isOutOfStock ? (
              <span className="inline-flex items-center text-xs font-semibold text-red-600 bg-red-50 px-3 py-1.5 rounded-lg">
                <AlertTriangle className="h-4 w-4 mr-1.5" /> Out of stock
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg animate-pulse">
                <AlertTriangle className="h-4 w-4 mr-1.5" /> Only {availableStock} left in stock!
              </span>
            ) : (
              <span className="inline-flex items-center text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-lg">
                In stock & ready to ship
              </span>
            )}
          </div>

          {/* Add to Cart Actions */}
          {!isOutOfStock && (
            <div className="flex items-center space-x-4 pt-4">
              <div className="flex items-center border border-gray-200 rounded-lg">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-gray-500 hover:text-purple-600"
                >
                  -
                </button>
                <span className="px-3 py-2 text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(availableStock, q + 1))}
                  className="px-3 py-2 text-gray-500 hover:text-purple-600"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={selectedVariantId === '' && variants.length > 0}
                className="flex-1 bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
                title={selectedVariantId === '' && variants.length > 0 ? 'Select a size first' : ''}
              >
                <ShoppingBag className="h-4 w-4 mr-2" /> Add to Cart
              </button>

              <button
                onClick={() =>
                  toggleWishlist({
                    id: product.id,
                    title: product.title,
                    slug: product.slug,
                    price: product.price,
                    cover_image: product.cover_image
                  })
                }
                className={`border p-3 rounded-lg transition-colors ${isInWishlist(product.id) ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-200 text-gray-500 hover:bg-gray-50'
                  }`}
              >
                <Heart className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t border-gray-100 pt-12 space-y-8">
        <h2 className="text-xl font-bold tracking-tight text-gray-950 flex items-center">
          <MessageSquare className="h-5 w-5 mr-2 text-purple-600" /> Customer Reviews
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Add Review Panel */}
          <div className="bg-gray-50 p-6 rounded-2xl space-y-4">
            <h3 className="font-bold text-gray-950 text-sm">Write a Review</h3>
            {isAuthenticated ? (
              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`h-6 w-6 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-500">Review Comments</label>
                  <textarea
                    rows={4}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe your experience with this product..."
                    className="w-full bg-white border border-gray-200 rounded-lg p-3 text-xs focus:outline-hidden focus:ring-1 focus:ring-purple-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={addReviewMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-lg text-xs shadow-xs transition-colors"
                >
                  {addReviewMutation.isPending ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-gray-500 mb-4">Please log in to share your feedback.</p>
                <Link
                  to="/checkout"
                  className="inline-block bg-purple-600 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-purple-700"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>

          {/* Reviews List */}
          <div className="md:col-span-2 space-y-4">
            {reviews && reviews.length > 0 ? (
              reviews.map((rev) => (
                <div key={rev.id} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-xxs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-800">
                      {rev.first_name} {rev.last_name || ''}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(rev.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex space-x-0.5">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star
                        key={idx}
                        className={`h-3.5 w-3.5 ${idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'
                          }`}
                      />
                    ))}
                  </div>

                  <p className="text-xs text-gray-600 mt-2 italic leading-relaxed">
                    "{rev.comment}"
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-gray-400 text-xs">
                No reviews yet. Be the first to share your thoughts!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
