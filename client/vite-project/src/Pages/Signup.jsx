import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import AlertMessage from '../components/AlertMessage';
import { User, Mail, Lock, Phone, Eye, EyeOff, ArrowRight, Store, CheckCircle2 } from 'lucide-react';

export default function Signup() {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { signup, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'phone') {
      // Strip non-digit characters and restrict to exactly 10 digits for Indian mobile numbers
      const sanitizedPhone = value.replace(/\D/g, '').slice(0, 10);
      setForm((prev) => ({ ...prev, [name]: sanitizedPhone }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (localError) setLocalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.phone || !form.password) {
      setLocalError('All fields (Full Name, Email, Phone, Password) are required');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone)) {
      setLocalError('Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9)');
      return;
    }

    if (form.password.length < 6) {
      setLocalError('Password must contain at least 6 characters');
      return;
    }

    setIsSubmitting(true);
    setLocalError('');
    setSuccessMsg('');

    const res = await signup(form);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMsg(res.message || 'Account created successfully!');
      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } else {
      setLocalError(res.message || 'Registration failed');
    }
  };

  const displayError = localError || error;

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="flex items-center justify-center p-4 sm:p-6 relative overflow-hidden my-auto w-full">
        {/* Glow Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-tr from-purple-600/20 via-indigo-600/20 to-pink-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-4xl glass-card rounded-3xl border border-slate-800 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 relative z-10">
          
          {/* Left Branding Panel */}
          <div className="hidden md:flex flex-col justify-between p-10 gradient-bg-primary relative overflow-hidden text-white">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white font-bold">
                <Store className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">ShopKart SST</span>
            </div>

            <div className="space-y-4 my-auto">
              <h2 className="text-3xl font-extrabold leading-tight">
                Create your customer account.
              </h2>
              <p className="text-sm text-indigo-100 leading-relaxed">
                Register now to access your account dashboard and securely log in.
              </p>
              <div className="space-y-2 pt-2 text-xs text-indigo-100 font-medium">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Express Backend Integration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  <span>Full Field Validation</span>
                </div>
              </div>
            </div>

            <div className="text-xs text-indigo-200">
              © {new Date().getFullYear()} SST Social / ShopKart. All rights reserved.
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="p-8 sm:p-10 flex flex-col justify-between bg-slate-950/80">
            <div>
              <div className="text-left mb-6">
                <h1 className="text-2xl font-extrabold text-white">Create Account</h1>
                <p className="text-xs text-slate-400 mt-1">Fill in the fields below to register</p>
              </div>

              {/* Alerts */}
              {displayError && (
                <div className="mb-6">
                  <AlertMessage type="error" message={displayError} />
                </div>
              )}
              {successMsg && (
                <div className="mb-6">
                  <AlertMessage type="success" message={successMsg} />
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Alex Morgan"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="alex@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <span className="absolute left-10 top-1/2 -translate-y-1/2 text-xs font-bold text-indigo-400 border-r border-slate-800 pr-2 pointer-events-none">
                      +91
                    </span>
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      required
                      minLength={10}
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      inputMode="numeric"
                      className="w-full pl-20 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      className="w-full pl-11 pr-11 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-2xl gradient-bg-primary text-white font-bold text-sm shadow-xl glow-indigo hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="pt-6 border-t border-slate-800/80 text-center mt-6">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-indigo-400 hover:text-indigo-300 hover:underline">
                  Log in
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}