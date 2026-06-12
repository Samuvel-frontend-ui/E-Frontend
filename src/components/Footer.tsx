import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 text-sm mt-auto">
      <div className="max-w-none mx-auto px-4 py-12 md:px-8 lg:px-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Graceonix</h3>
            <p className="text-xs leading-relaxed mb-4">
              Building the next-generation shopping experience with serverless architecture and high performance.
            </p>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Shop</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/shop" className="hover:text-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?category=t-shirt" className="hover:text-white transition-colors">T-Shirts</Link></li>
              <li><Link to="/shop?category=shirt" className="hover:text-white transition-colors">Shirts</Link></li>
              <li><Link to="/shop?category=cap" className="hover:text-white transition-colors">Caps</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Support</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Shipping & Delivery</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-sm font-semibold tracking-wider uppercase mb-4">Legal</h3>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link to="/admin" className="hover:text-white transition-colors">Admin Panel</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 border-t border-gray-800 pt-8 flex flex-col items-center justify-center text-xs text-center w-full">
          <p>© {new Date().getFullYear()} Graceonix Ecommerce. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
