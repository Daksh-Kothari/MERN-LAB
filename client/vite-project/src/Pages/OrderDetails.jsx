import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeft,
  Package,
  Calendar,
  CreditCard,
  MapPin,
  CheckCircle2,
  Clock,
  Truck,
  ShieldCheck,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const fetchOrder = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(`/orders/${id}`);
      if (res.data && res.data.success) {
        setOrder(res.data.order);
      } else {
        setError(res.data?.message || 'Unable to find order.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to retrieve order details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchOrder();
    }
  }, [id]);

  // Bonus: Demo Status Progression Toggle
  const handleUpdateStatus = async (newStatus) => {
    if (updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const res = await axiosInstance.patch(`/orders/${id}/status`, { status: newStatus });
      if (res.data && res.data.success) {
        setOrder(res.data.order);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const steps = ['PLACED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];

  const getStepIndex = (status) => {
    return steps.indexOf(status);
  };

  const formattedDate = order
    ? new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  const formattedTotal = order
    ? new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(order.totalAmount)
    : '';

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* Back Navigation */}
        <div className="mb-6">
          <Link
            to="/orders"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to My Orders</span>
          </Link>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center">
            <LoadingSpinner message="Loading order details..." />
          </div>
        ) : error || !order ? (
          <div className="glass-card rounded-3xl p-10 text-center border border-slate-800 max-w-md mx-auto space-y-4 my-10">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
            <h2 className="text-xl font-bold text-white">Order Not Found</h2>
            <p className="text-xs text-slate-400">{error || 'This order does not exist or you do not have permission to view it.'}</p>
            <Link
              to="/orders"
              className="px-5 py-2.5 rounded-xl gradient-bg-primary text-white text-xs font-bold inline-block"
            >
              Return to Orders
            </Link>
          </div>
        ) : (
          <div className="space-y-8 animate-fade-in">
            
            {/* Header Card */}
            <div className="glass-card rounded-3xl border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
                    Order #{order._id.slice(-8)}
                  </h1>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
                    {order.paymentStatus}
                  </span>
                </div>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Placed on {formattedDate}</span>
                </p>
                {order.razorpayPaymentId && (
                  <p className="text-[11px] font-mono text-slate-500">
                    Payment ID: {order.razorpayPaymentId}
                  </p>
                )}
              </div>

              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 block uppercase font-medium">Order Total</span>
                <span className="text-2xl sm:text-3xl font-black text-white">{formattedTotal}</span>
              </div>
            </div>

            {/* Visual Status Progression Tracker (Bonus Feature) */}
            <div className="glass-card rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-400" />
                  <span>Delivery Status Progression</span>
                </h3>

                {/* Demo Status Switcher */}
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-500 text-[11px] hidden sm:inline">Demo Switch:</span>
                  {steps.map((st) => (
                    <button
                      key={st}
                      onClick={() => handleUpdateStatus(st)}
                      disabled={updatingStatus}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        order.status === st
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Progress Steps Visual */}
              <div className="grid grid-cols-4 gap-2 pt-2">
                {steps.map((st, index) => {
                  const currentIdx = getStepIndex(order.status);
                  const isDone = index <= currentIdx;
                  const isCurrent = index === currentIdx;

                  return (
                    <div key={st} className="flex flex-col items-center text-center space-y-2">
                      <div
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                          isDone
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-900 border border-slate-800 text-slate-500'
                        } ${isCurrent ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950' : ''}`}
                      >
                        {isDone ? <CheckCircle2 className="w-5 h-5" /> : index + 1}
                      </div>
                      <span
                        className={`text-[10px] sm:text-xs font-semibold ${
                          isDone ? 'text-indigo-300' : 'text-slate-500'
                        }`}
                      >
                        {st}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Two-Column Breakdown: Items List + Shipping Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              
              {/* Left Column: Items (2 cols) */}
              <div className="lg:col-span-2 glass-card rounded-3xl border border-slate-800 p-6 sm:p-7 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider pb-2 border-b border-slate-800">
                  Purchased Items ({order.items.length})
                </h3>

                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-14 h-14 rounded-xl object-cover bg-slate-950 border border-slate-800 shrink-0"
                          />
                        )}
                        <div>
                          <p className="font-bold text-white text-sm">{item.name}</p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            ₹{item.price} × {item.quantity} units
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-extrabold text-white text-base">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Address & Payment Summary (1 col) */}
              <div className="space-y-6">
                
                {/* Shipping Address */}
                <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-3">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                    <MapPin className="w-4 h-4" />
                    <span>Delivery Address</span>
                  </div>
                  {order.shippingAddress && (
                    <div className="text-xs text-slate-300 space-y-1 leading-relaxed">
                      <p className="font-bold text-white text-sm">{order.shippingAddress.fullName}</p>
                      <p>{order.shippingAddress.addressLine1}</p>
                      <p>
                        {order.shippingAddress.city}, {order.shippingAddress.state} -{' '}
                        {order.shippingAddress.pincode}
                      </p>
                      <p className="text-slate-400 pt-1">Contact: {order.shippingAddress.phone}</p>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="glass-card rounded-3xl border border-slate-800 p-6 space-y-3 text-xs">
                  <h4 className="font-bold text-white text-sm pb-2 border-b border-slate-800">
                    Payment Breakdown
                  </h4>
                  <div className="flex justify-between text-slate-400">
                    <span>Items Total</span>
                    <span className="text-white font-semibold">{formattedTotal}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Express Shipping</span>
                    <span className="text-emerald-400 font-semibold">FREE</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST</span>
                    <span className="text-slate-300">Included</span>
                  </div>
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                    <span className="font-bold text-white text-sm">Total Paid</span>
                    <span className="font-black text-white text-xl">{formattedTotal}</span>
                  </div>
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
