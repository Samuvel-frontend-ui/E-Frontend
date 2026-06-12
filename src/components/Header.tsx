import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, User, Search, Menu, X } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const cartCount = useCartStore((state) => state.getCartCount());
  const wishlistCount = useWishlistStore((state) => state.items.length);
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-xs">
      <div className="max-w-none mx-auto px-4 md:px-8 lg:px-12">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-1 md:flex-initial">
            <Link to="/" className="text-xl font-bold tracking-tight text-purple-600 hover:text-purple-700">
              Graceonix
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 text-sm font-medium text-gray-700">
            <Link to="/" className="hover:text-purple-600 transition-colors">Home</Link>
            <Link to="/shop" className="hover:text-purple-600 transition-colors">Shop</Link>
            <Link to="/about" className="hover:text-purple-600 transition-colors">About</Link>
          </nav>

          {/* User & Actions */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 text-gray-500 hover:text-purple-600 transition-colors focus:outline-hidden"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Wishlist */}
            <Link
              to="/account/wishlist"
              className="hidden md:flex relative p-2 text-gray-500 hover:text-purple-600 transition-colors"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-purple-600 rounded-full">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="hidden md:flex relative p-2 text-gray-500 hover:text-purple-600 transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xxs font-bold leading-none text-white bg-purple-600 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              to={isAuthenticated ? "/account" : "/checkout"}
              className="hidden sm:flex items-center text-gray-500 hover:text-purple-600 transition-colors"
              aria-label="Account"
            >
              <User className="h-5 w-5 mr-1" />
              {isAuthenticated ? (
                <span className="text-xs font-semibold max-w-16 truncate">
                  {user?.first_name || 'Account'}
                </span>
              ) : (
                <span className="text-xs font-semibold">Login</span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-purple-600 focus:outline-hidden"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Floating Search Bar */}
      {searchOpen && (
        <div className="bg-gray-50 border-b border-gray-100 px-4 py-3 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="max-w-3xl mx-auto flex">
            <input
              type="search"
              placeholder="Search products, brands, collections..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-l-md px-4 py-2 text-sm focus:outline-hidden focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              autoFocus
            />
            <button
              type="submit"
              className="bg-purple-600 text-white rounded-r-md px-6 py-2 text-sm font-medium hover:bg-purple-700 transition-colors"
            >
              Search
            </button>
          </form>
        </div>
      )}

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-purple-600"
          >
            Home
          </Link>
          <Link
            to="/shop"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-purple-600"
          >
            Shop
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-purple-600"
          >
            About
          </Link>
          {!isAuthenticated && (
            <Link
              to="/checkout"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-purple-600 sm:hidden"
            >
              Login / Register
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
