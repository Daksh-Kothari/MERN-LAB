import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CartItem from '../components/CartItem';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShoppingCart,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Truck,
  RotateCcw,
  LogIn,
  Trash2,
} from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    cartItems,
    loading: cartLoading,
    error,
    totalCount,
    subtotal,
    fetchCart,
    clearCart,
  } = useCart();

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full my-auto flex-1 flex flex-col">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Shopping Cart</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>My Cart</span>
              {!cartLoading && !error && user && cartItems.length > 0 && (
                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Review your selected products, manage quantities, and proceed to checkout.
            </p>
          </div>

          <Link
            to="/products"
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 self-start sm:self-center"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-400" />
            <span>Continue Shopping</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* --- STATE 1: LOADING STATE --- */}
        {cartLoading || authLoading ? (
          <div className="py-24 my-auto flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner message="Loading your cart..." />
          </div>
        ) : !user ? (
          /* --- UNAUTHENTICATED STATE --- */
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 max-w-lg mx-auto space-y-6 my-auto animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/10">
              <LogIn className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                You need to be logged in to view and manage your shopping cart.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
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
              <h2 className="text-2xl font-bold text-white">Unable to load your cart.</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {error || "Something went wrong while retrieving your cart."}
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={fetchCart}
                className="px-6 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/10"
              >
                <RefreshCw className="w-4 h-4 text-rose-400" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          /* --- STATE 3: EMPTY CART STATE --- */
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 max-w-lg mx-auto space-y-6 my-auto animate-fade-in bg-slate-950/40">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/10">
              <ShoppingCart className="w-10 h-10 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                Your cart is empty 🛒
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                Looks like you haven't added anything yet. Explore our curated catalogue and pick up what you love.
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
          /* --- STATE 4: POPULATED CART LAYOUT --- */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Product Details
                </span>
                <button
                  type="button"
                  onClick={clearCart}
                  className="text-xs text-slate-500 hover:text-rose-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear All</span>
                </button>
              </div>

              {cartItems.map((item) => (
                <CartItem key={item.product._id} item={item} />
              ))}
            </div>

            {/* Right Column: Order Summary */}
            <div className="glass-card rounded-3xl border border-slate-800 p-6 sm:p-7 space-y-6 sticky top-28 shadow-2xl bg-slate-950/70">
              <h2 className="text-xl font-bold text-white tracking-tight pb-3 border-b border-slate-800/80">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Total Items</span>
                  <span className="text-white font-semibold">{totalCount} units</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">{formattedSubtotal}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Shipping</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Taxes</span>
                  <span className="text-slate-300 font-medium">Included</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-base font-bold text-white">Estimated Total</span>
                  <span className="text-2xl font-black text-white tracking-tight">
                    {formattedSubtotal}
                  </span>
                </div>
              </div>

              {/* Checkout Action Button */}
              <button
                type="button"
                className="w-full py-4 rounded-2xl gradient-bg-primary text-white font-bold text-sm shadow-xl glow-indigo hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                onClick={() => navigate('/checkout')}
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Trust Badges */}
              <div className="pt-4 border-t border-slate-800/80 space-y-2 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Secure 256-Bit SSL Encrypted Checkout</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>Free doorstep express shipping across India</span>
                </div>
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-purple-400 shrink-0" />
                  <span>7 Days hassle-free return policy</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
