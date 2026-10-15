import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProfileCard from '../components/ProfileCard';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { ShoppingBag, ArrowRight } from 'lucide-react';

export default function Home() {
  const { user, loading, error } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      
      {/* Reusable Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-12 my-auto w-full space-y-8">
        {error && (
          <div className="mb-6">
            <AlertMessage type="error" message={error} />
          </div>
        )}

        {loading ? (
          <LoadingSpinner message="Fetching customer profile details..." />
        ) : (
          <>
            <ProfileCard user={user} />

            {/* Quick Link to Product Catalog */}
            <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Explore ShopKart Products</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Browse through our latest electronics, fashion, books, and home catalogue.</p>
                </div>
              </div>

              <Link
                to="/products"
                className="w-full sm:w-auto px-6 py-3 rounded-2xl gradient-bg-primary text-white text-xs font-bold shadow-lg glow-indigo hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <span>Browse Products</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </>
        )}
      </main>

      {/* Reusable Footer */}
      <Footer />
    </div>
  );
}