import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ArrowLeft,
  ShoppingCart,
  Tag,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Heart,
  Loader2,
  Plus,
} from 'lucide-react';

export default function ProductDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addToCart, getItemQuantity, actionLoading } = useCart();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cartFeedback, setCartFeedback] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistNotice, setWishlistNotice] = useState(null);

  const isAddingToCart = actionLoading[id] === 'add';
  const cartQty = getItemQuantity(id);

  useEffect(() => {
    const fetchProductDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axiosInstance.get(`/products/${id}`);
        if (res.data && res.data.success) {
          setProduct(res.data.product);
        } else {
          setError(res.data?.message || 'Product not found');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  // Check if current product is in user's wishlist
  useEffect(() => {
    const checkWishlistStatus = async () => {
      if (!user || !id) return;
      try {
        const res = await axiosInstance.get('/wishlist/my-wishlist');
        if (res.data && res.data.success && Array.isArray(res.data.wishlist)) {
          const inWishlist = res.data.wishlist.some((item) => item._id === id);
          setIsWishlisted(inWishlist);
        }
      } catch (err) {
        // Silently catch on status check
      }
    };

    checkWishlistStatus();
  }, [user, id]);

  const handleToggleWishlist = async () => {
    if (wishlistLoading) return;
    if (!user) {
      setWishlistNotice({ type: 'error', message: 'Please log in to save to your wishlist' });
      setTimeout(() => setWishlistNotice(null), 3000);
      return;
    }

    setWishlistLoading(true);
    setWishlistNotice(null);

    try {
      if (isWishlisted) {
        const res = await axiosInstance.delete(`/wishlist/${id}`);
        if (res.data && res.data.success) {
          setIsWishlisted(false);
          setWishlistNotice({ type: 'success', message: 'Removed from wishlist' });
          window.dispatchEvent(new CustomEvent('wishlist-updated'));
        }
      } else {
        const res = await axiosInstance.post(`/wishlist/${id}`);
        if (res.data && res.data.success) {
          setIsWishlisted(true);
          setWishlistNotice({ type: 'success', message: 'Added to wishlist!' });
          window.dispatchEvent(new CustomEvent('wishlist-updated'));
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        setWishlistNotice({ type: 'success', message: 'Already in your wishlist' });
        window.dispatchEvent(new CustomEvent('wishlist-updated'));
      } else {
        setWishlistNotice({
          type: 'error',
          message: err.response?.data?.message || 'Unable to save product. Please try again.',
        });
      }
    } finally {
      setWishlistLoading(false);
      setTimeout(() => setWishlistNotice(null), 3000);
    }
  };

  const handleAddToCart = async () => {
    if (isAddingToCart || product.stock === 0) return;

    if (!user) {
      setCartFeedback({ type: 'error', message: 'Please log in to add items to your cart' });
      setTimeout(() => setCartFeedback(null), 3000);
      return;
    }

    const res = await addToCart(id);
    if (res.success) {
      setCartFeedback({
        type: 'success',
        message: cartQty > 0 ? `Added another unit (${cartQty + 1} now in cart)` : 'Product added to cart!',
      });
    } else {
      setCartFeedback({ type: 'error', message: res.message });
    }
    setTimeout(() => setCartFeedback(null), 3000);
  };

  const formattedPrice = product
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(product.price)
    : '';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full my-auto">
        
        {/* Back Link */}
        <div className="mb-6">
          <Link
            to="/products"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Products Catalog</span>
          </Link>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="py-20">
            <LoadingSpinner message="Fetching product details..." />
          </div>
        ) : error ? (
          /* Error / 404 State */
          <div className="glass-card rounded-3xl p-10 text-center border border-slate-800 max-w-md mx-auto space-y-6 my-10">
            <AlertMessage type="error" message={error} />
            <div className="pt-2">
              <Link
                to="/products"
                className="px-6 py-3 rounded-2xl gradient-bg-primary text-white text-xs font-bold inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Return to Catalog
              </Link>
            </div>
          </div>
        ) : product ? (
          /* Product Details Layout */
          <div className="glass-card rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10 animate-fade-in">
            
            {/* Left Image Section */}
            <div className="p-6 sm:p-10 bg-slate-900/60 border-b md:border-b-0 md:border-r border-slate-800/80 flex items-center justify-center relative">
              <div className="w-full aspect-square max-w-md rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-xl relative group">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
                  }}
                />

                {/* Category Badge overlay */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-indigo-300 flex items-center gap-1.5 shadow-lg">
                  <Tag className="w-3.5 h-3.5 text-indigo-400" />
                  <span>{product.category}</span>
                </div>
              </div>
            </div>

            {/* Right Information Section */}
            <div className="p-8 sm:p-10 flex flex-col justify-between space-y-6 bg-slate-950/80">
              <div className="space-y-6">
                
                {/* Header info */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    {product.stock > 0 ? (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>In Stock ({product.stock} units left)</span>
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Out of Stock</span>
                      </span>
                    )}
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                    {product.name}
                  </h1>

                  <div className="mt-4 flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                      {formattedPrice}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">Inclusive of all taxes</span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2 pt-2 border-t border-slate-800/80">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Product Description
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Feature highlights grid */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
                    <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Free Shipping</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2.5 text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0" />
                    <span>1 Year Warranty</span>
                  </div>
                </div>

                {/* Cart feedback alert */}
                {cartFeedback && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 animate-fade-in ${
                      cartFeedback.type === 'error'
                        ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                        : 'bg-indigo-950/80 border-indigo-500/40 text-indigo-200'
                    }`}
                  >
                    {cartFeedback.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                    <span>{cartFeedback.message}</span>
                  </div>
                )}

                {/* Wishlist Notice Alert */}
                {wishlistNotice && (
                  <div
                    className={`p-3.5 rounded-2xl border text-xs flex items-center gap-2 animate-fade-in ${
                      wishlistNotice.type === 'error'
                        ? 'bg-rose-950/80 border-rose-500/40 text-rose-200'
                        : 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                    }`}
                  >
                    {wishlistNotice.type === 'error' ? (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    )}
                    <span>{wishlistNotice.message}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-6 border-t border-slate-800/80 space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0 || isAddingToCart}
                    className={`flex-1 w-full py-4 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center gap-2.5 transition-all ${
                      product.stock > 0
                        ? 'gradient-bg-primary text-white glow-indigo hover:opacity-95 active:scale-95 cursor-pointer'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    }`}
                  >
                    {isAddingToCart ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Adding to Cart...</span>
                      </>
                    ) : product.stock === 0 ? (
                      <span>Currently Unavailable</span>
                    ) : cartQty > 0 ? (
                      <>
                        <Plus className="w-4 h-4" />
                        <span>Add Another ({cartQty} in Cart)</span>
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleToggleWishlist}
                    disabled={wishlistLoading}
                    className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-sm border flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-60 ${
                      isWishlisted
                        ? 'bg-rose-500/20 border-rose-500/50 text-rose-300 hover:bg-rose-500/30 shadow-lg shadow-rose-500/10'
                        : 'bg-slate-900 border-slate-700/80 text-slate-200 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    {wishlistLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-rose-400" />
                        <span>Saving...</span>
                      </>
                    ) : isWishlisted ? (
                      <>
                        <Heart className="w-4 h-4 fill-current text-rose-400" />
                        <span>Saved to Wishlist</span>
                      </>
                    ) : (
                      <>
                        <Heart className="w-4 h-4 text-slate-400" />
                        <span>♡ Wishlist</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

          </div>
        ) : null}

      </main>

      <Footer />
    </div>
  );
}
