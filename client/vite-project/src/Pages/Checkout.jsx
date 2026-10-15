import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { axiosInstance } from '../axiosCalls/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ShieldCheck,
  Truck,
  CreditCard,
  Lock,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Loader2,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';

export default function Checkout() {
  const { user, loading: authLoading } = useAuth();
  const { cartItems, loading: cartLoading, totalCount, subtotal, fetchCart } = useCart();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    addressLine1: '',
    city: '',
    state: '',
    pincode: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Prefill details from authenticated user
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || '',
      }));
    }
  }, [user]);

  // Load Razorpay Script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Client-Side Validation
  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) {
      errors.fullName = 'Full Name is required';
    }

    const cleanPhone = formData.phone.trim();
    if (!cleanPhone) {
      errors.phone = 'Phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      errors.phone = 'Please enter a valid 10-digit Indian phone number (starting with 6-9)';
    }

    if (!formData.addressLine1.trim()) {
      errors.addressLine1 = 'Address line is required';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      errors.state = 'State is required';
    }

    const cleanPincode = formData.pincode.trim();
    if (!cleanPincode) {
      errors.pincode = 'Pincode is required';
    } else if (!/^\d{6}$/.test(cleanPincode)) {
      errors.pincode = 'Pincode must contain exactly 6 digits';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Send payment verification to backend
  const verifyPaymentOnBackend = async (verificationPayload) => {
    try {
      const res = await axiosInstance.post('/orders/verify-payment', verificationPayload);
      if (res.data && res.data.success) {
        // Global cart state must be cleared after verified payment
        await fetchCart();
        navigate(`/order-success/${res.data.order._id}`);
      } else {
        setErrorMessage(res.data?.message || 'Payment verification failed. Your cart is preserved.');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Payment verification failed. Your cart is preserved.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Main Checkout & Razorpay Order Placement
  const handlePlaceOrder = async (e, forceSimulate = false) => {
    if (e) e.preventDefault();
    if (submitting) return;

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      // Step 1: Create ShopKart Order + Razorpay Order on the backend
      const res = await axiosInstance.post('/orders/create-payment-order', {
        shippingAddress: {
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          addressLine1: formData.addressLine1.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          pincode: formData.pincode.trim(),
        },
      });

      if (!res.data || !res.data.success) {
        setErrorMessage(res.data?.message || 'Unable to create order. Please try again.');
        setSubmitting(false);
        return;
      }

      const { shopKartOrderId, razorpayOrderId, amount, currency, key } = res.data;

      // If user chooses offline / direct simulated test mode (or script load fails)
      if (forceSimulate) {
        await verifyPaymentOnBackend({
          shopKartOrderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: `test_signature_${razorpayOrderId}`,
        });
        return;
      }

      // Step 2: Load Razorpay Checkout Script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded || !window.Razorpay) {
        // Fallback to simulated test completion with clear notification
        console.warn('Razorpay script could not be loaded directly. Running Test Mode Verification.');
        await verifyPaymentOnBackend({
          shopKartOrderId,
          razorpay_order_id: razorpayOrderId,
          razorpay_payment_id: `pay_test_${Date.now()}`,
          razorpay_signature: `test_signature_${razorpayOrderId}`,
        });
        return;
      }

      // Step 3: Open Razorpay Checkout Modal
      const options = {
        key: key || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_Tnrq3P8iim6L5B',
        amount: amount,
        currency: currency || 'INR',
        name: 'ShopKart SST',
        description: `Order #${shopKartOrderId.slice(-6)}`,
        image: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?auto=format&fit=crop&w=200&q=80',
        order_id: razorpayOrderId,
        handler: async function (response) {
          // Mandatory payment signature verification on server
          await verifyPaymentOnBackend({
            shopKartOrderId: shopKartOrderId,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });
        },
        prefill: {
          name: formData.fullName,
          contact: formData.phone,
          email: user?.email || '',
        },
        theme: {
          color: '#6366f1',
        },
        modal: {
          ondismiss: function () {
            setSubmitting(false);
            setErrorMessage('Payment window was closed. Your cart remains intact.');
          },
        },
      };

      try {
        const razorpayInstance = new window.Razorpay(options);

        razorpayInstance.on('payment.failed', function (failResponse) {
          setSubmitting(false);
          setErrorMessage(
            failResponse.error?.description || 'Payment was unsuccessful. Cart has not been cleared.'
          );
        });

        razorpayInstance.open();
      } catch (sdkErr) {
        setSubmitting(false);
        setErrorMessage(
          sdkErr?.message || 'Failed to open Razorpay payment modal. Please check your credentials.'
        );
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.message || 'Error occurred while initiating checkout. Please try again.'
      );
      setSubmitting(false);
    }
  };

  const formattedSubtotal = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(subtotal);

  if (authLoading || cartLoading) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between">
        <Navbar />
        <div className="py-24 my-auto flex flex-col items-center justify-center">
          <LoadingSpinner message="Preparing checkout..." />
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-lg mx-auto p-12 text-center my-auto glass-card rounded-3xl border border-slate-800 space-y-6">
          <Lock className="w-12 h-12 text-indigo-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Sign In Required</h2>
          <p className="text-xs text-slate-400">
            Please log in to your ShopKart account to proceed with your checkout.
          </p>
          <Link
            to="/login"
            className="px-6 py-3 rounded-2xl gradient-bg-primary text-white text-xs font-bold inline-block shadow-lg"
          >
            Log in to Continue
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between">
        <Navbar />
        <main className="max-w-lg mx-auto p-12 text-center my-auto glass-card rounded-3xl border border-slate-800 space-y-6">
          <ShoppingBag className="w-12 h-12 text-indigo-400 mx-auto" />
          <h2 className="text-2xl font-bold text-white">Your Cart is Empty</h2>
          <p className="text-xs text-slate-400">
            You cannot proceed to checkout without any products in your cart.
          </p>
          <Link
            to="/products"
            className="px-6 py-3 rounded-2xl gradient-bg-primary text-white text-xs font-bold inline-block shadow-lg"
          >
            Browse Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shopping Cart</span>
          </Link>
        </div>

        {/* Page Header */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure 256-Bit SSL Checkout</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Shipping & Order Payment
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Provide your delivery address and complete payment securely via Razorpay Test Mode.
          </p>
        </div>

        {/* Global Error Banner */}
        {errorMessage && (
          <div className="mb-8 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3 animate-fade-in max-w-3xl">
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Shipping Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass-card rounded-3xl border border-slate-800 p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h2 className="text-lg font-bold text-white">Shipping Address</h2>
                </div>
                <span className="text-xs text-slate-400">* All fields required</span>
              </div>

              <form onSubmit={handlePlaceOrder} className="space-y-4">
                
                {/* Full Name & Phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="e.g. Aarav Sharma"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                        formErrors.fullName ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.fullName && (
                      <p className="text-[11px] text-rose-400 mt-1">{formErrors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Phone Number (10 digits)
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="e.g. 9876543210"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                        formErrors.phone ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.phone && (
                      <p className="text-[11px] text-rose-400 mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Address Line 1 */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Street Address & Landmark
                  </label>
                  <input
                    type="text"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleInputChange}
                    placeholder="e.g. 22 MG Road, Koramangala, 4th Block"
                    className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                      formErrors.addressLine1 ? 'border-rose-500' : 'border-slate-800'
                    }`}
                  />
                  {formErrors.addressLine1 && (
                    <p className="text-[11px] text-rose-400 mt-1">{formErrors.addressLine1}</p>
                  )}
                </div>

                {/* City, State, Pincode */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="e.g. Bengaluru"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                        formErrors.city ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.city && (
                      <p className="text-[11px] text-rose-400 mt-1">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      placeholder="e.g. Karnataka"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                        formErrors.state ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.state && (
                      <p className="text-[11px] text-rose-400 mt-1">{formErrors.state}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Pincode (6 digits)
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      maxLength={6}
                      placeholder="e.g. 560001"
                      className={`w-full px-4 py-3 rounded-xl bg-slate-900 border text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                        formErrors.pincode ? 'border-rose-500' : 'border-slate-800'
                      }`}
                    />
                    {formErrors.pincode && (
                      <p className="text-[11px] text-rose-400 mt-1">{formErrors.pincode}</p>
                    )}
                  </div>
                </div>

              </form>
            </div>

            {/* Payment Method Notice */}
            <div className="glass-card rounded-3xl border border-slate-800 p-6 flex items-start gap-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 shrink-0">
                <CreditCard className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Razorpay Standard Checkout (Test Mode)</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                    Active
                  </span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Razorpay Sandbox is enabled. UPI, Cards, NetBanking, and Wallets test instruments can be used. No real currency is deducted.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Order Review (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-card rounded-3xl border border-slate-800 p-6 sm:p-7 space-y-6 sticky top-28 shadow-2xl bg-slate-950/70">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                <h2 className="text-lg font-bold text-white">Order Summary</h2>
                <span className="text-xs font-semibold text-slate-400">
                  {totalCount} {totalCount === 1 ? 'unit' : 'units'}
                </span>
              </div>

              {/* Items List Preview */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={item.product._id}
                    className="flex items-center justify-between gap-3 text-xs py-2 border-b border-slate-800/50"
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-10 h-10 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                      />
                      <div className="truncate">
                        <p className="font-semibold text-white truncate">{item.product.name}</p>
                        <p className="text-slate-400 text-[11px]">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold text-slate-200 shrink-0">
                      ₹{item.product.price * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2.5 text-xs pt-2">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span className="text-white font-semibold">{formattedSubtotal}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Express Shipping</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST Taxes</span>
                  <span className="text-slate-300">Included</span>
                </div>

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Total Amount</span>
                  <span className="text-2xl font-black text-white tracking-tight">
                    {formattedSubtotal}
                  </span>
                </div>
              </div>

              {/* Main Pay with Razorpay Button */}
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="w-full py-4 rounded-2xl gradient-bg-primary text-white font-bold text-sm shadow-xl glow-indigo hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Processing Payment...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay {formattedSubtotal} with Razorpay</span>
                  </>
                )}
              </button>

              {/* Test Simulation Button (For direct sandbox verification) */}
              <button
                type="button"
                onClick={(e) => handlePlaceOrder(e, true)}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulate Direct Test Payment (Demo Mode)</span>
              </button>

              {/* Security Badges */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>HMAC-SHA256 signature verification enforced</span>
                </div>
                <div className="flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <span>Cart clears automatically upon payment completion</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </main>

      <Footer />
    </div>
  );
}
