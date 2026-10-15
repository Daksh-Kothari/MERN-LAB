import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';
import { ArrowRight, Trash2, Tag, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export default function WishlistCard({ product, onRemove }) {
  const [removing, setRemoving] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  if (!product) return null;

  const formattedPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const inStock = product.stock > 0;

  const handleRemove = async () => {
    if (removing) return;
    setRemoving(true);
    setErrorMessage(null);

    try {
      const res = await axiosInstance.delete(`/wishlist/${product._id}`);
      if (res.data && res.data.success) {
        // Notify parent component to update list
        if (onRemove) {
          onRemove(product._id);
        }
        // Broadcast custom event to update Navbar count
        window.dispatchEvent(new CustomEvent('wishlist-updated'));
      } else {
        setErrorMessage(res.data?.message || 'Failed to remove product.');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Unable to remove product from wishlist.';
      setErrorMessage(msg);
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="glass-card rounded-3xl border border-slate-800 shadow-xl overflow-hidden flex flex-col justify-between group hover:border-rose-500/40 hover:shadow-2xl hover:shadow-rose-500/10 transition-all duration-300">
      
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-900/80">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-xs font-semibold text-rose-300 flex items-center gap-1.5 shadow-md">
          <Tag className="w-3 h-3 text-rose-400" />
          <span>{product.category}</span>
        </div>

        {/* Stock Badge */}
        <div className="absolute top-3 right-3">
          {inStock ? (
            <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 backdrop-blur-md border border-emerald-500/40 text-[11px] font-bold text-emerald-300 flex items-center gap-1 shadow-md">
              <CheckCircle className="w-3 h-3 text-emerald-400" />
              <span>{product.stock} units left</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full bg-rose-950/90 backdrop-blur-md border border-rose-500/40 text-[11px] font-bold text-rose-300 flex items-center gap-1 shadow-md">
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Out of stock</span>
            </span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 justify-between space-y-4">
        <div>
          <h3 className="text-lg font-bold text-white group-hover:text-rose-300 transition-colors line-clamp-1">
            {product.name}
          </h3>
          <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description || 'Exclusive item saved in your ShopKart wishlist.'}
          </p>
        </div>

        {/* Price */}
        <div>
          <span className="text-[11px] text-slate-500 block uppercase font-semibold">Price</span>
          <span className="text-xl font-extrabold text-white tracking-tight">
            {formattedPrice}
          </span>
        </div>

        {/* Error notification if removal fails */}
        {errorMessage && (
          <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
            {errorMessage}
          </div>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
          {/* View Details */}
          <Link
            to={`/products/${product._id}`}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
          >
            <span>View Details</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          {/* Remove from Wishlist */}
          <button
            onClick={handleRemove}
            disabled={removing}
            className="py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            title="Remove from Wishlist"
          >
            {removing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Removing...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove ♥</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
