'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { ReactNode } from 'react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  type?: 'info' | 'warning' | 'success' | 'error';
}

interface ConfirmDialogProps extends DialogProps {
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary';
}

export function Dialog({ isOpen, onClose, title, description, children, type = 'info' }: DialogProps) {
  const icons = {
    info: <Info className="w-6 h-6 text-blue-500" />,
    warning: <AlertTriangle className="w-6 h-6 text-yellow-500" />,
    success: <CheckCircle className="w-6 h-6 text-green-500" />,
    error: <AlertTriangle className="w-6 h-6 text-red-500" />,
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Dialog */}
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-start gap-4 p-6 border-b border-zinc-800">
                <div className="flex-shrink-0 mt-0.5">
                  {icons[type]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-zinc-100">
                    {title}
                  </h3>
                  {description && (
                    <p className="mt-1 text-sm text-zinc-400">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="flex-shrink-0 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              {children && (
                <div className="p-6">
                  {children}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  type = 'warning'
}: ConfirmDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} description={description} type={type}>
      <div className="flex gap-3 justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={handleConfirm}
          className={`px-4 py-2 rounded-lg transition-colors ${
            confirmVariant === 'danger'
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Dialog>
  );
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  type = 'error'
}: DialogProps) {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title={title} description={description} type={type}>
      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
        >
          OK
        </button>
      </div>
    </Dialog>
  );
}
