import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  ArrowRight,
  Tag,
  CheckCircle,
  AlertCircle,
  Heart,
  Loader2,
  ShoppingCart,
  Plus,
} from 'lucide-react';

export default function ProductCard({ product, initialWishlisted = false }) {
  const { user } = useAuth();
  const { addToCart, getItemQuantity, actionLoading } = useCart();
  const navigate = useNavigate();

  const [isWishlisted, setIsWishlisted] = useState(initialWishlisted);
  const [savingWishlist, setSavingWishlist] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successNotice, setSuccessNotice] = useState(null);

  if (!product) return null;

  const isAddingToCart = actionLoading[product._id] === 'add';
  const cartQty = getItemQuantity(product._id);
  const inStock = product.stock > 0;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (savingWishlist) return;

    if (!user) {
      setErrorMsg('Please log in to save to wishlist');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    setSavingWishlist(true);
    setErrorMsg(null);
    setSuccessNotice(null);

    try {
      if (isWishlisted) {
        const res = await axiosInstance.delete(`/wishlist/${product._id}`);
        if (res.data && res.data.success) {
          setIsWishlisted(false);
          setSuccessNotice('Removed from wishlist');
          window.dispatchEvent(new CustomEvent('wishlist-updated'));
          setTimeout(() => setSuccessNotice(null), 2500);
        }
      } else {
        const res = await axiosInstance.post(`/wishlist/${product._id}`);
        if (res.data && res.data.success) {
          setIsWishlisted(true);
          setSuccessNotice('Added to Wishlist');
          window.dispatchEvent(new CustomEvent('wishlist-updated'));
          setTimeout(() => setSuccessNotice(null), 3000);
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        setIsWishlisted(true);
        setSuccessNotice('Already in Wishlist');
        window.dispatchEvent(new CustomEvent('wishlist-updated'));
        setTimeout(() => setSuccessNotice(null), 2500);
      } else if (err.response?.status === 401) {
        setErrorMsg('Please log in to save to wishlist');
        setTimeout(() => setErrorMsg(null), 3000);
      } else {
        const msg =
          err.response?.data?.message ||
          'Unable to save product. Please try again.';
        setErrorMsg(msg);
        setTimeout(() => setErrorMsg(null), 3500);
      }
    } finally {
      setSavingWishlist(false);
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAddingToCart || !inStock) return;

    if (!user) {
      setErrorMsg('Please log in to add items to cart');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    const res = await addToCart(product._id);
    if (res.success) {
      setSuccessNotice(cartQty > 0 ? `Added another (${cartQty + 1} in cart)` : 'Added to Cart!');
      setTimeout(() => setSuccessNotice(null), 3000);
    } else {
      setErrorMsg(res.message);
      setTimeout(() => setErrorMsg(null), 3500);
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative">
      
      {/* Product Image Container */}
      <div className="relative aspect-video sm:aspect-square overflow-hidden bg-slate-900/80">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-indigo-300 flex items-center gap-1.5 shadow-md">
          <Tag className="w-3 h-3 text-indigo-400" />
          <span>{product.category}</span>
        </div>

        {/* Stock Badge & Heart Wishlist Action */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          {inStock ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 backdrop-blur-md border border-emerald-500/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1 shadow-md">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>{product.stock} left</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-rose-950/90 backdrop-blur-md border border-rose-500/40 text-[11px] font-bold text-rose-300 flex items-center gap-1 shadow-md">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Out of stock</span>
            </span>
          )}

          {/* Quick Heart Wishlist Button */}
          <button
            onClick={handleWishlistToggle}
            disabled={savingWishlist}
            aria-label={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all cursor-pointer ${
              isWishlisted
                ? 'bg-rose-500/90 border-rose-400 text-white shadow-lg shadow-rose-500/30'
                : 'bg-slate-950/80 border-slate-700/80 text-slate-300 hover:text-rose-400 hover:border-rose-500/50'
            } ${savingWishlist ? 'opacity-60 cursor-not-allowed' : ''}`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            {savingWishlist ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Heart
                className={`w-4 h-4 ${
                  isWishlisted ? 'fill-current text-white' : ''
                }`}
              />
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Feedback Notices */}
        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-fade-in flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-400" />
            <span className="line-clamp-1">{errorMsg}</span>
          </div>
        )}

        {successNotice && (
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs animate-fade-in flex items-center gap-2">
            <CheckCircle className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
            <span className="line-clamp-1">{successNotice}</span>
          </div>
        )}

        {/* Price & Action Buttons */}
        <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-500 block uppercase font-semibold">
                Price
              </span>
              <span className="text-xl font-extrabold text-white tracking-tight">
                {formattedPrice}
              </span>
            </div>

            {cartQty > 0 && (
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {cartQty} in cart
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* View Details */}
            <Link
              to={`/products/${product._id}`}
              className="py-2.5 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center"
            >
              <span>Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!inStock || isAddingToCart}
              className={`flex-1 py-2.5 px-3 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                !inStock
                  ? 'bg-slate-800 text-slate-500 border border-slate-700'
                  : cartQty > 0
                  ? 'bg-indigo-600/30 hover:bg-indigo-600/40 border border-indigo-500/50 text-indigo-200'
                  : 'gradient-bg-primary text-white glow-indigo hover:opacity-95 active:scale-95'
              }`}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Adding...</span>
                </>
              ) : !inStock ? (
                <span>Out of Stock</span>
              ) : cartQty > 0 ? (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Add to Cart</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}