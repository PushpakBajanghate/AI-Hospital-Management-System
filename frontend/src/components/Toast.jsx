import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export const Toast = ({ id, message, type = 'info', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const themes = {
    success: {
      bg: 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300',
      icon: <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />,
    },
    error: {
      bg: 'bg-rose-950/90 border-rose-500/30 text-rose-300',
      icon: <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />,
    },
    info: {
      bg: 'bg-slate-900/90 border-slate-700/30 text-slate-300',
      icon: <Info className="w-5 h-5 text-slate-400 shrink-0" />,
    },
  };

  const theme = themes[type] || themes.info;

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 ${theme.bg}`}
      style={{ minWidth: '320px', maxWidth: '400px' }}
    >
      {theme.icon}
      <p className="text-xs font-semibold flex-1 leading-relaxed">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-slate-400 hover:text-white transition p-1 hover:bg-white/10 rounded-lg"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            id={toast.id}
            message={toast.message}
            type={toast.type}
            onClose={onClose}
          />
        </div>
      ))}
    </div>
  );
};
