import React from 'react';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react';

const CATEGORIES = ['All', 'Electronics', 'Fashion', 'Books', 'Home'];

export default function SearchBar({
  search,
  setSearch,
  category,
  setCategory,
  sort,
  setSort,
  onClear,
}) {
  return (
    <div className="glass-card rounded-3xl p-4 sm:p-6 border border-slate-800 shadow-xl mb-8 space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        
        {/* Search Input (Takes 6 cols on md) */}
        <div className="md:col-span-6 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products by name..."
            className="w-full pl-11 pr-10 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Dropdown (Takes 3 cols on md) */}
        <div className="md:col-span-3 relative">
          <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full pl-11 pr-8 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat} className="bg-slate-900 text-slate-100">
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Price Sort Dropdown (Takes 3 cols on md) */}
        <div className="md:col-span-3 relative">
          <ArrowUpDown className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full pl-11 pr-8 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all appearance-none cursor-pointer"
          >
            <option value="default" className="bg-slate-900 text-slate-100">
              Default Sorting
            </option>
            <option value="price_asc" className="bg-slate-900 text-slate-100">
              Price: Low to High
            </option>
            <option value="price_desc" className="bg-slate-900 text-slate-100">
              Price: High to Low
            </option>
          </select>
        </div>

      </div>

      {/* Active Filters bar */}
      {(search || category !== 'All' || sort !== 'default') && (
        <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs text-slate-400">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-300">Active Filters:</span>
            {search && (
              <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300">
                "{search}"
              </span>
            )}
            {category !== 'All' && (
              <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300">
                Category: {category}
              </span>
            )}
            {sort !== 'default' && (
              <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300">
                Sort: {sort === 'price_asc' ? 'Price Low-High' : 'Price High-Low'}
              </span>
            )}
          </div>

          <button
            onClick={onClear}
            className="text-xs text-slate-400 hover:text-white underline cursor-pointer"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
