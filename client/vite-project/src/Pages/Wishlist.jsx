import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import WishlistCard from '../components/WishlistCard';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Sparkles,
  LogIn,
} from 'lucide-react';

export default function Wishlist() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get('/wishlist/my-wishlist');
      if (res.data && res.data.success) {
        setWishlist(res.data.wishlist || []);
      } else {
        setError(res.data?.message || "We couldn't load your wishlist.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to view your saved items.');
      } else {
        setError(
          err.response?.data?.message || "We couldn't load your wishlist."
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setLoading(false);
        setError('Please log in to view your saved items.');
      } else {
        fetchWishlist();
      }
    }
  }, [user, authLoading, fetchWishlist]);

  // Handle removing a product from local state without full page reload
  const handleRemoveProduct = (productId) => {
    setWishlist((prev) => prev.filter((item) => item._id !== productId));
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-rose-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full my-auto flex-1 flex flex-col">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold mb-2">
              <Heart className="w-3.5 h-3.5 fill-current" />
              <span>Saved Items</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>My Wishlist</span>
              {!loading && !error && user && (
                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {wishlist.length} {wishlist.length === 1 ? 'product' : 'products'} saved
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Your curated collection of favourite products. Save now, purchase whenever you are ready.
            </p>
          </div>

          {/* Action Link: Continue Shopping */}
          <Link
            to="/products"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-rose-400" />
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* --- STATE 1: LOADING STATE --- */}
        {loading || authLoading ? (
          <div className="py-24 my-auto flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner message="Loading your wishlist..." />
          </div>
        ) : !user ? (
          /* --- UNAUTHENTICATED STATE --- */
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 max-w-lg mx-auto space-y-6 my-auto animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
              <LogIn className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                You need to be signed in to access and manage your personal wishlist.
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Link
                to="/login"
                className="px-6 py-3 rounded-2xl gradient-bg-primary text-white text-xs font-bold shadow-lg hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Log In to ShopKart</span>
              </Link>
            </div>
          </div>
        ) : error ? (
          /* --- STATE 2: ERROR STATE --- */
          <div className="glass-card rounded-3xl p-12 text-center border border-rose-900/40 max-w-lg mx-auto space-y-6 my-auto animate-fade-in bg-slate-950/60">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Something went wrong.</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {error || "We couldn't load your wishlist."}
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={fetchWishlist}
                className="px-6 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/10"
              >
                <RefreshCw className="w-4 h-4 text-rose-400" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        ) : wishlist.length === 0 ? (
          /* --- STATE 3: EMPTY WISHLIST STATE --- */
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 max-w-lg mx-auto space-y-6 my-auto animate-fade-in bg-slate-950/40">
            <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-xl shadow-rose-500/10">
              <Heart className="w-10 h-10 text-rose-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Your wishlist is empty ❤️
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Save products you love and find them here later. You haven't added any products to your wishlist yet.
              </p>
            </div>

            <div className="pt-3 flex justify-center">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-2xl gradient-bg-primary text-white text-xs font-bold shadow-xl glow-indigo hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Browse Products</span>
              </Link>
            </div>
          </div>
        ) : (
          /* --- STATE 4: SUCCESS / WISHLIST PRODUCTS GRID --- */
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fade-in">
              {wishlist.map((product) => (
                <WishlistCard
                  key={product._id}
                  product={product}
                  onRemove={handleRemoveProduct}
                />
              ))}
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
