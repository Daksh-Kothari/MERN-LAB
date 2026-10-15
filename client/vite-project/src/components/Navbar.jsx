import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { axiosInstance } from '../axiosCalls/axios';
import { Store, LogOut, User, ShoppingBag, Heart, ShoppingCart, Package } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [wishlistCount, setWishlistCount] = useState(0);

  const fetchWishlistCount = useCallback(async () => {
    if (!user) {
      setWishlistCount(0);
      return;
    }
    try {
      const res = await axiosInstance.get('/wishlist/count');
      if (res.data && res.data.success && typeof res.data.count === 'number') {
        setWishlistCount(res.data.count);
      }
    } catch (err) {
      // If error (or unauthenticated), fallback to count = 0
      setWishlistCount(0);
    }
  }, [user]);

  useEffect(() => {
    fetchWishlistCount();

    const handleWishlistUpdate = () => {
      fetchWishlistCount();
    };

    window.addEventListener('wishlist-updated', handleWishlistUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleWishlistUpdate);
    };
  }, [fetchWishlistCount]);

  const handleLogout = async () => {
    await logout();
    setWishlistCount(0);
    navigate('/login');
  };

  const { totalCount } = useCart();

  const isProductsActive = location.pathname.startsWith('/products');
  const isWishlistActive = location.pathname.startsWith('/wishlist');
  const isCartActive = location.pathname.startsWith('/cart');
  const isOrdersActive = location.pathname.startsWith('/orders');

  return (
    <nav className="glass-nav sticky top-0 z-40 border-b border-slate-800/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Brand / Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl gradient-bg-primary flex items-center justify-center text-white font-bold shadow-lg">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xl font-bold tracking-tight text-white">
            ShopKart <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">SST</span>
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            to="/"
            className="text-sm text-slate-400 hover:text-white font-medium transition-colors hidden sm:block"
          >
            Home
          </Link>

          <Link
            to="/products"
            className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              isProductsActive ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-indigo-400" />
            <span>Products</span>
          </Link>

          {/* Wishlist Link with dynamic backend-driven count */}
          <Link
            to="/wishlist"
            className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              isWishlistActive ? 'text-rose-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlistActive ? 'fill-current text-rose-400' : 'text-rose-400'}`} />
            <span>Wishlist</span>
            {user && wishlistCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-[11px] font-bold">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Link with dynamic derived totalCount */}
          <Link
            to="/cart"
            className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
              isCartActive ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
            }`}
          >
            <ShoppingCart className={`w-4 h-4 ${isCartActive ? 'text-indigo-400' : 'text-indigo-400'}`} />
            <span>Cart</span>
            {user && totalCount > 0 && (
              <span className="px-1.5 py-0.5 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-[11px] font-bold">
                {totalCount}
              </span>
            )}
          </Link>

          {/* Orders Link */}
          {user && (
            <Link
              to="/orders"
              className={`text-sm font-semibold flex items-center gap-1.5 transition-colors ${
                isOrdersActive ? 'text-indigo-400 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Package className="w-4 h-4 text-indigo-400" />
              <span>Orders</span>
            </Link>
          )}
          
          {user ? (
            <div className="flex items-center gap-3">
              <Link 
                to="/home" 
                className="px-3 py-1.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs font-semibold text-slate-200 hover:text-white hover:border-slate-600 transition-all flex items-center gap-2"
              >
                <User className="w-3.5 h-3.5 text-indigo-400" />
                <span>{user.fullName?.split(' ')[0] || 'Profile'}</span>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold hover:bg-rose-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
                Log in
              </Link>
              <Link to="/signup" className="px-4 py-2.5 rounded-xl gradient-bg-primary text-xs font-bold text-white shadow-md hover:opacity-90 active:scale-95 transition-all">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
