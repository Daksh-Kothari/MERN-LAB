import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  Package,
  ShoppingBag,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  Calendar,
  CheckCircle2,
  Clock,
  Truck,
  Sparkles,
  LogIn,
} from 'lucide-react';

export default function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get('/orders/my-orders');
      if (res.data && res.data.success) {
        setOrders(res.data.orders || []);
      } else {
        setError(res.data?.message || 'Unable to load orders.');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        setError('Please log in to view your orders.');
      } else {
        setError(err.response?.data?.message || 'Failed to fetch your orders.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        setLoading(false);
        setError('Please log in to view your orders.');
      } else {
        fetchOrders();
      }
    }
  }, [user, authLoading, fetchOrders]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'SHIPPED':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'CONFIRMED':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'PLACED':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1 flex flex-col">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
              <Package className="w-3.5 h-3.5" />
              <span>Purchase History</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <span>My Orders</span>
              {!loading && !error && user && (
                <span className="text-sm font-semibold px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'} placed
                </span>
              )}
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Track your past orders, delivery status, and view historical purchase summaries.
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
        {loading || authLoading ? (
          <div className="py-24 my-auto flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner message="Loading your orders..." />
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
                Please log in to view your placed orders and order history.
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
              <h2 className="text-2xl font-bold text-white">Something went wrong.</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">{error}</p>
            </div>
            <div className="pt-2 flex justify-center">
              <button
                onClick={fetchOrders}
                className="px-6 py-3 rounded-2xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-500/10"
              >
                <RefreshCw className="w-4 h-4 text-rose-400" />
                <span>Try Again</span>
              </button>
            </div>
          </div>
        ) : orders.length === 0 ? (
          /* --- STATE 3: EMPTY ORDERS STATE --- */
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 max-w-lg mx-auto space-y-6 my-auto animate-fade-in bg-slate-950/40">
            <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto shadow-xl shadow-indigo-500/10">
              <Package className="w-10 h-10 text-indigo-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white tracking-tight">
                You have not placed any orders yet.
              </h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                When you purchase products from ShopKart, your orders and invoice details will appear here.
              </p>
            </div>

            <div className="pt-3 flex justify-center">
              <Link
                to="/products"
                className="px-6 py-3.5 rounded-2xl gradient-bg-primary text-white text-xs font-bold shadow-xl glow-indigo hover:opacity-95 active:scale-95 transition-all flex items-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Start Shopping</span>
              </Link>
            </div>
          </div>
        ) : (
          /* --- STATE 4: POPULATED ORDERS LIST --- */
          <div className="space-y-6">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              const formattedOrderTotal = new Intl.NumberFormat('en-IN', {
                style: 'currency',
                currency: 'INR',
                maximumFractionDigits: 0,
              }).format(order.totalAmount);

              return (
                <div
                  key={order._id}
                  className="glass-card rounded-3xl border border-slate-800 p-6 sm:p-7 space-y-5 hover:border-slate-700 transition-all shadow-xl"
                >
                  {/* Order Card Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-sm font-bold text-white">
                          Order #{order._id.slice(-8)}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${getStatusBadge(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                          {order.paymentStatus}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Placed on {formattedDate}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-start sm:self-auto">
                      <div className="text-right">
                        <span className="text-[11px] text-slate-500 block uppercase font-medium">
                          Total
                        </span>
                        <span className="text-lg font-extrabold text-white">
                          {formattedOrderTotal}
                        </span>
                      </div>

                      <Link
                        to={`/orders/${order._id}`}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 hover:text-white transition-all flex items-center gap-1.5"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-3"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-12 h-12 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                          />
                        )}
                        <div className="truncate text-xs">
                          <p className="font-semibold text-white truncate">{item.name}</p>
                          <p className="text-slate-400 text-[11px] mt-0.5">
                            Qty: <span className="font-bold text-slate-300">{item.quantity}</span>{' '}
                            × ₹{item.price}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
