import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { axiosInstance } from '../axiosCalls/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  CheckCircle2,
  Package,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Calendar,
  CreditCard,
  MapPin,
} from 'lucide-react';

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const res = await axiosInstance.get(`/orders/${id}`);
        if (res.data && res.data.success) {
          setOrder(res.data.order);
        }
      } catch (err) {
        console.error('Failed to load order details:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrderDetails();
    }
  }, [id]);

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

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full my-auto flex-1 flex flex-col justify-center">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner message="Fetching your order confirmation..." />
          </div>
        ) : (
          <div className="glass-card rounded-3xl border border-slate-800 p-8 sm:p-12 text-center space-y-8 animate-fade-in shadow-2xl relative overflow-hidden">
            {/* Top Success Badge */}
            <div className="space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/10">
                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
              </div>

              <div>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  Payment Verified & Completed
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
                  Order Placed Successfully!
                </h1>
                <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you for your purchase. Your order has been placed and confirmed. Your cart has been cleared.
                </p>
              </div>
            </div>

            {/* Key Order Details Summary Card */}
            {order && (
              <div className="rounded-2xl bg-slate-900/60 border border-slate-800 p-6 text-left space-y-5">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-4 border-b border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase font-medium">Order ID</span>
                    <span className="font-mono font-bold text-white text-xs sm:text-sm">
                      #{order._id.slice(-8)}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block uppercase font-medium">Order Status</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-bold text-[11px]">
                      {order.status}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block uppercase font-medium">Payment</span>
                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[11px]">
                      {order.paymentStatus}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-500 block uppercase font-medium">Total Paid</span>
                    <span className="font-extrabold text-white text-sm sm:text-base">
                      {formattedTotal}
                    </span>
                  </div>
                </div>

                {/* Items Preview */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Purchased Items ({order.items.length})
                  </h3>
                  <div className="space-y-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/40 last:border-none"
                      >
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-8 h-8 rounded-lg object-cover bg-slate-950 border border-slate-800 shrink-0"
                            />
                          )}
                          <div>
                            <span className="font-semibold text-white">{item.name}</span>
                            <span className="text-slate-500 ml-2">× {item.quantity}</span>
                          </div>
                        </div>
                        <span className="font-bold text-slate-200">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Destination */}
                {order.shippingAddress && (
                  <div className="pt-3 border-t border-slate-800/80 flex items-start gap-2.5 text-xs text-slate-400">
                    <MapPin className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-slate-200">
                        {order.shippingAddress.fullName}
                      </span>{' '}
                      — {order.shippingAddress.addressLine1}, {order.shippingAddress.city},{' '}
                      {order.shippingAddress.state} - {order.shippingAddress.pincode} (Ph:{' '}
                      {order.shippingAddress.phone})
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                to="/orders"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl gradient-bg-primary text-white text-xs font-bold shadow-xl glow-indigo hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Package className="w-4 h-4" />
                <span>View My Orders</span>
              </Link>

              <Link
                to="/products"
                className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-indigo-400" />
                <span>Continue Shopping</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
