import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Check, AlertCircle, Sparkles, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

interface ToastProps {
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
}

export default function Toast({ toasts, removeToast }: ToastProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const Icon = toast.type === 'success' 
            ? Check 
            : toast.type === 'error' 
              ? AlertCircle 
              : Sparkles;
          
          const iconBg = toast.type === 'success' 
            ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
            : toast.type === 'error' 
              ? 'bg-rose-50 text-rose-600 border-rose-100' 
              : 'bg-blue-50 text-blue-600 border-blue-100';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              className="bg-white border border-[#EAEAEA] rounded-2xl p-4 shadow-xl pointer-events-auto flex items-start gap-3.5 relative overflow-hidden"
            >
              <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 text-left">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block font-semibold">
                  {toast.type === 'success' ? 'Vault Success' : toast.type === 'error' ? 'Security Notice' : 'Notification'}
                </span>
                <p className="text-xs text-[#111111] font-sans font-medium mt-0.5 leading-relaxed pr-6">
                  {toast.message}
                </p>
              </div>

              <button
                onClick={() => removeToast(toast.id)}
                className="absolute top-3.5 right-3.5 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
