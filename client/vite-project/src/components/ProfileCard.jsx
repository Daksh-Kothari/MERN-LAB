import React from 'react';
import { User, Mail, Phone, ShieldCheck, Sparkles, Calendar, Key } from 'lucide-react';

export default function ProfileCard({ user }) {
  if (!user) return null;

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Recently Active';

  return (
    <div className="glass-card rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl space-y-8 animate-fade-in relative overflow-hidden">
      {/* Glow highlight background */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-border from-indigo-500/10 via-purple-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Profile Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-800/80">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl gradient-bg-primary flex items-center justify-center text-white text-2xl font-black shadow-xl glow-indigo shrink-0">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {user.fullName}
              </h1>
              <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" title="Verified Customer">
                <ShieldCheck className="w-4 h-4" />
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-2">
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold self-start sm:self-center">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Active Session</span>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <User className="w-4 h-4 text-indigo-400" /> Full Name
          </div>
          <p className="text-base font-medium text-slate-100">{user.fullName}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Mail className="w-4 h-4 text-purple-400" /> Email Address
          </div>
          <p className="text-base font-medium text-slate-100 break-all">{user.email}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Phone className="w-4 h-4 text-pink-400" /> Phone Number
          </div>
          <p className="text-base font-medium text-slate-100">{user.phone || 'N/A'}</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Calendar className="w-4 h-4 text-emerald-400" /> Member Since
          </div>
          <p className="text-base font-medium text-slate-100">{formattedDate}</p>
        </div>
      </div>

      {/* Account metadata footer info */}
      <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-indigo-300">
        <div className="flex items-center gap-2 font-mono">
          <Key className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-slate-400">Customer ID:</span>
          <span className="text-indigo-200">{user._id || user.id || 'N/A'}</span>
        </div>
        <div className="text-emerald-400 font-semibold flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Authenticated via HttpOnly Cookie</span>
        </div>
      </div>
    </div>
  );
}
