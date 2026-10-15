import React, { useState, useEffect, useCallback } from 'react';
import { axiosInstance } from '../axiosCalls/axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import LoadingSpinner from '../components/LoadingSpinner';
import AlertMessage from '../components/AlertMessage';
import { useAuth } from '../context/AuthContext';
import { ShoppingBag, PackageX, Sparkles, RefreshCw } from 'lucide-react';

export default function Products() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search, filter, and sort state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [sort, setSort] = useState('default');
  const [seeding, setSeeding] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (category && category !== 'All') params.category = category;
      if (sort && sort !== 'default') params.sort = sort;

      const res = await axiosInstance.get('/products/all', { params });
      if (res.data && res.data.success) {
        setProducts(res.data.products || []);
      } else {
        setError(res.data?.message || 'Failed to load products');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong while loading products.');
    } finally {
      setLoading(false);
    }
  }, [search, category, sort]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300); // 300ms debounce for typing search

    return () => clearTimeout(timer);
  }, [fetchProducts]);

  // Sync wishlist status for authenticated user
  const fetchUserWishlist = useCallback(async () => {
    if (!user) {
      setWishlistIds(new Set());
      return;
    }
    try {
      const res = await axiosInstance.get('/wishlist/my-wishlist');
      if (res.data && res.data.success && Array.isArray(res.data.wishlist)) {
        const ids = new Set(res.data.wishlist.map((item) => item._id));
        setWishlistIds(ids);
      }
    } catch (err) {
      // Ignore unauthenticated or network error on background sync
    }
  }, [user]);

  useEffect(() => {
    fetchUserWishlist();

    const handleUpdate = () => {
      fetchUserWishlist();
    };

    window.addEventListener('wishlist-updated', handleUpdate);
    return () => {
      window.removeEventListener('wishlist-updated', handleUpdate);
    };
  }, [fetchUserWishlist]);

  const handleClearFilters = () => {
    setSearch('');
    setCategory('All');
    setSort('default');
  };

  const handleSeedProducts = async () => {
    setSeeding(true);
    try {
      await axiosInstance.post('/products/seed');
      fetchProducts();
    } catch (err) {
      console.error('Failed to seed sample products:', err);
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full my-auto">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore Products</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Product Discovery Catalogue
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Browse top electronics, fashion, books, and home essentials with live filtering.
            </p>
          </div>

          {/* Seed Sample Products Button */}
          <button
            onClick={handleSeedProducts}
            disabled={seeding}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white hover:border-slate-700 transition-all flex items-center gap-2 cursor-pointer self-start sm:self-center"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${seeding ? 'animate-spin' : ''}`} />
            <span>{seeding ? 'Seeding...' : 'Load Sample Data'}</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <SearchBar
          search={search}
          setSearch={setSearch}
          category={category}
          setCategory={setCategory}
          sort={sort}
          setSort={setSort}
          onClear={handleClearFilters}
        />

        {/* State 1: Error State */}
        {error && (
          <div className="mb-8 max-w-2xl mx-auto">
            <AlertMessage type="error" message={error} />
          </div>
        )}

        {/* State 2: Loading State */}
        {loading ? (
          <div className="py-16">
            <LoadingSpinner message="Loading products from ShopKart server..." />
          </div>
        ) : products.length > 0 ? (
          /* Products Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                initialWishlisted={wishlistIds.has(product._id)}
              />
            ))}
          </div>
        ) : (
          /* State 3: Empty State */
          <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 max-w-lg mx-auto space-y-6 animate-fade-in my-8">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <PackageX className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">No products found</h2>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {search || category !== 'All'
                  ? 'No items matched your search query or active category filter. Try clearing filters or searching for something else.'
                  : 'No products are available in the catalogue right now.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              {(search || category !== 'All' || sort !== 'default') && (
                <button
                  onClick={handleClearFilters}
                  className="px-5 py-2.5 rounded-xl gradient-bg-primary text-white text-xs font-bold shadow-md hover:opacity-95"
                >
                  Clear All Filters
                </button>
              )}
              <button
                onClick={handleSeedProducts}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs font-bold hover:bg-slate-800/60"
              >
                Seed Sample Catalog
              </button>
            </div>
          </div>
        )}

      </main>

      <Footer />
    </div>
  );
}
