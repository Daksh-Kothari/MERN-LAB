import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ArrowRight, Zap, Sparkles, UserCheck, Layers } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Reusable Navbar */}
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-28 overflow-hidden my-auto">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10 space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Modern MERN Stack Application</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Welcome to <span className="gradient-text">SST ShopKart</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Experience seamless authentication, secure encrypted sessions, and an ultra-responsive client dashboard powered by React and Tailwind CSS.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              to="/products"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl gradient-bg-primary text-white font-bold text-sm shadow-xl glow-indigo hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2.5"
            >
              Browse Product Catalog <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/home"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-200 font-bold text-sm transition-all flex items-center justify-center gap-2"
            >
              User Dashboard
            </Link>
          </div>

          {/* Feature highlights */}
          <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left max-w-4xl mx-auto">
            <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
              <Zap className="w-6 h-6 text-indigo-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Fast & Responsive</h3>
              <p className="text-xs text-slate-400">Lightning-fast React 19 single-page interface with Tailwind CSS styling.</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
              <UserCheck className="w-6 h-6 text-purple-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Secure Auth Context</h3>
              <p className="text-xs text-slate-400">Global state management with JWT cookies and user session context.</p>
            </div>
            <div className="glass-card p-5 rounded-2xl border border-slate-800/80">
              <Layers className="w-6 h-6 text-pink-400 mb-3" />
              <h3 className="text-sm font-bold text-white mb-1">Reusable Components</h3>
              <p className="text-xs text-slate-400">Clean component architecture with Navbar, ProfileCard, and ProtectedRoute.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}