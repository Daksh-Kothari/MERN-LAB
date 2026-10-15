import React from 'react';
import { AlertCircle, CheckCircle2, Info } from 'lucide-react';

export default function AlertMessage({ type = 'error', message }) {
  if (!message) return null;

  const isSuccess = type === 'success';
  const isInfo = type === 'info';

  const styles = isSuccess
    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
    : isInfo
    ? 'bg-indigo-950/80 border-indigo-500/40 text-indigo-200'
    : 'bg-rose-950/80 border-rose-500/40 text-rose-200';

  const Icon = isSuccess ? CheckCircle2 : isInfo ? Info : AlertCircle;

  return (
    <div className={`p-4 rounded-2xl border text-sm flex items-center gap-3 transition-all ${styles}`}>
      <Icon className="w-5 h-5 shrink-0" />
      <span>{message}</span>
    </div>
  );
}
