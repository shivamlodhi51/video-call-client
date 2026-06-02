import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-rose-400" />,
    info: <Info className="w-5 h-5 text-brand-400" />,
  };

  const borderColors = {
    success: 'border-emerald-500/20 shadow-emerald-500/5',
    error: 'border-rose-500/20 shadow-rose-500/5',
    info: 'border-brand-500/20 shadow-brand-500/5',
  };

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 p-4 rounded-xl border glass-card shadow-2xl animate-fade-in ${borderColors[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <p className="text-sm font-medium text-slate-200 pr-4">{message}</p>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-200 transition-colors p-0.5 rounded-lg hover:bg-white/5 cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
