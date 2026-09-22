import React, { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, X } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onCancel?: () => void;
  onConfirm: (reason?: string) => void | Promise<void>;
  title: string;
  description?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  confirmVariant?: string;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
  isLoading?: boolean;
  details?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  description,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant,
  confirmVariant,
  requireReason = false,
  reasonLabel = 'Reason for this action',
  reasonPlaceholder = 'Please explain why this action is being taken...',
  isLoading = false,
  details,
}: ConfirmModalProps) {
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState('');

  const effectiveDescription = description || message || '';
  const effectiveClose = onClose || onCancel || (() => {});
  const effectiveVariant = (variant || confirmVariant || 'danger') as 'danger' | 'warning' | 'primary';

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setReasonError('A reason is required to proceed with this administrative action.');
      return;
    }
    setReasonError('');
    await onConfirm(reason);
    setReason('');
  };

  const handleClose = () => {
    setReason('');
    setReasonError('');
    effectiveClose();
  };

  const variantStyles = {
    danger: {
      icon: <AlertCircle className="w-6 h-6 text-rose-600" />,
      iconBg: 'bg-rose-100 dark:bg-rose-950/60',
      button: 'bg-rose-600 hover:bg-rose-700 text-white',
    },
    warning: {
      icon: <AlertTriangle className="w-6 h-6 text-amber-600" />,
      iconBg: 'bg-amber-100 dark:bg-amber-950/60',
      button: 'bg-amber-600 hover:bg-amber-700 text-white',
    },
    primary: {
      icon: <Info className="w-6 h-6 text-blue-600" />,
      iconBg: 'bg-blue-100 dark:bg-blue-950/60',
      button: 'bg-blue-600 hover:bg-blue-700 text-white',
    },
  }[effectiveVariant] || {
    icon: <AlertCircle className="w-6 h-6 text-rose-600" />,
    iconBg: 'bg-rose-100 dark:bg-rose-950/60',
    button: 'bg-rose-600 hover:bg-rose-700 text-white',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-2xl shrink-0 ${variantStyles.iconBg}`}>
              {variantStyles.icon}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
                  {title}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {effectiveDescription}
              </p>

              {details && (
                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                  {details}
                </div>
              )}

              {requireReason && (
                <div className="mt-4 space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    {reasonLabel} <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => {
                      setReason(e.target.value);
                      if (e.target.value.trim()) setReasonError('');
                    }}
                    placeholder={reasonPlaceholder}
                    className={`w-full rounded-xl border px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 ${
                      reasonError
                        ? 'border-rose-500 focus:ring-rose-500/20'
                        : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500/20 focus:border-blue-500'
                    }`}
                  />
                  {reasonError && (
                    <p className="text-xs text-rose-600 dark:text-rose-400">{reasonError}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800/40 px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            {cancelText}
          </Button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-sm flex items-center justify-center gap-2 ${variantStyles.button} ${
              isLoading ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            {isLoading && (
              <svg className="animate-spin h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
