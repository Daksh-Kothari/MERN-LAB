import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
      © {new Date().getFullYear()} ShopKart SST • Built with React, Vite & Tailwind CSS
    </footer>
  );
}
