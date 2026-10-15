import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, Tag, Loader2, AlertCircle } from 'lucide-react';

export default function CartItem({ item }) {
  const { updateQuantity, removeFromCart, actionLoading } = useCart();

  if (!item || !item.product) return null;

  const product = item.product;
  const quantity = item.quantity || 1;
  const isActionLoading = !!actionLoading[product._id];

  const formattedUnitPrice = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price);

  const formattedItemTotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(product.price * quantity);

  const handleDecrease = () => {
    if (quantity > 1 && !isActionLoading) {
      updateQuantity(product._id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (quantity < product.stock && !isActionLoading) {
      updateQuantity(product._id, quantity + 1);
    }
  };

  const handleRemove = () => {
    if (!isActionLoading) {
      removeFromCart(product._id);
    }
  };

  const isAtMaxStock = quantity >= product.stock;

  return (
    <div className="glass-card rounded-2xl border border-slate-800 p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4 hover:border-slate-700 transition-all">
      
      {/* Product Image */}
      <Link
        to={`/products/${product._id}`}
        className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 relative group"
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=800&q=80';
          }}
        />
      </Link>

      {/* Details Section */}
      <div className="flex-1 w-full flex flex-col justify-between space-y-2">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[10px] font-semibold text-indigo-400 border border-slate-700 flex items-center gap-1">
              <Tag className="w-2.5 h-2.5" />
              <span>{product.category}</span>
            </span>
            {isAtMaxStock && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-[10px] font-semibold text-amber-400 border border-amber-500/20">
                Max stock reached
              </span>
            )}
          </div>

          <Link
            to={`/products/${product._id}`}
            className="text-base font-bold text-white hover:text-indigo-300 transition-colors line-clamp-1"
          >
            {product.name}
          </Link>
          <p className="text-xs text-slate-400">
            Unit Price: <span className="text-slate-200 font-semibold">{formattedUnitPrice}</span>
          </p>
        </div>

        {/* Quantity Controls & Actions */}
        <div className="flex items-center justify-between pt-2">
          {/* Quantity Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner">
              <button
                type="button"
                onClick={handleDecrease}
                disabled={quantity <= 1 || isActionLoading}
                aria-label="Decrease quantity"
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>

              <div className="w-10 text-center text-xs font-bold text-white select-none">
                {isActionLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin mx-auto text-indigo-400" />
                ) : (
                  quantity
                )}
              </div>

              <button
                type="button"
                onClick={handleIncrease}
                disabled={quantity >= product.stock || isActionLoading}
                aria-label="Increase quantity"
                className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <span className="text-[11px] text-slate-500 hidden sm:inline">
              ({product.stock} available)
            </span>
          </div>

          {/* Item Subtotal & Remove Button */}
          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-base font-extrabold text-white tracking-tight">
                {formattedItemTotal}
              </span>
            </div>

            <button
              type="button"
              onClick={handleRemove}
              disabled={isActionLoading}
              title="Remove from Cart"
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/30 transition-all cursor-pointer disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
