import { Link, useLocation } from 'react-router-dom';
import { Home, ShoppingBag, Heart, User, Search } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';

export default function BottomNav() {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const cartCount = useCartStore((state) => state.getCartCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Shop', path: '/shop', icon: Search },
    {
      label: 'Wishlist',
      path: '/account/wishlist',
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : undefined
    },
    {
      label: 'Cart',
      path: '/cart',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : undefined
    },
    {
      label: 'Profile',
      path: isAuthenticated ? '/account' : '/checkout',
      icon: User
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex items-center justify-around h-16 px-2 shadow-lg safe-bottom">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path || (item.path !== '/' && currentPath.startsWith(item.path));
        
        return (
          <Link
            key={item.label}
            to={item.path}
            className={`flex flex-col items-center justify-center w-12 h-12 relative transition-colors ${
              isActive ? 'text-purple-600 font-semibold' : 'text-gray-500 hover:text-purple-600'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] mt-1 tracking-tight">{item.label}</span>
            {item.badge !== undefined && (
              <span className="absolute top-1 right-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[9px] font-bold leading-none text-white bg-purple-600 rounded-full">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
