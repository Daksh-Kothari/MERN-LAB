import React from 'react';

export default function LoadingSpinner({ message = 'Loading...' }) {
  return (
    <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 space-y-4 max-w-md mx-auto">
      <div className="w-10 h-10 border-3 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mx-auto" />
      <p className="text-sm text-slate-400 font-medium">{message}</p>
    </div>
  );
}
