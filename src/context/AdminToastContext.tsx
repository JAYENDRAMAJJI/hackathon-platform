import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, title?: string, duration?: number) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (arg1: string, arg2?: string | ToastType, title?: string, duration: number = 4000) => {
      const knownTypes: ToastType[] = ['success', 'error', 'warning', 'info'];
      let actualType: ToastType = 'info';
      let actualMessage = '';

      if (knownTypes.includes(arg1 as ToastType)) {
        actualType = arg1 as ToastType;
        actualMessage = arg2 || '';
      } else {
        actualMessage = arg1 || '';
        if (arg2 && knownTypes.includes(arg2 as ToastType)) {
          actualType = arg2 as ToastType;
        }
      }

      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, type: actualType, title, message: actualMessage, duration };
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const success = useCallback((msg: string, title?: string) => showToast(msg, 'success', title), [showToast]);
  const error = useCallback((msg: string, title?: string) => showToast(msg, 'error', title), [showToast]);
  const warning = useCallback((msg: string, title?: string) => showToast(msg, 'warning', title), [showToast]);
  const info = useCallback((msg: string, title?: string) => showToast(msg, 'info', title), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      {/* Toast Notification Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full pointer-events-none p-4">
        {toasts.map((toast) => {
          const typeConfig = {
            success: {
              icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
              border: 'border-emerald-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-emerald-500/10',
              badge: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400',
            },
            error: {
              icon: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />,
              border: 'border-rose-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-rose-500/10',
              badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400',
            },
            warning: {
              icon: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
              border: 'border-amber-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-amber-500/10',
              badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400',
            },
            info: {
              icon: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
              border: 'border-blue-500/30 bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-blue-500/10',
              badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
            },
          }[toast.type];

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl transition-all animate-in slide-in-from-bottom-3 duration-200 ${typeConfig.border}`}
            >
              {typeConfig.icon}
              <div className="flex-1 text-sm">
                {toast.title && <div className="font-semibold mb-0.5">{toast.title}</div>}
                <div className="text-slate-600 dark:text-slate-300 leading-snug">{toast.message}</div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
