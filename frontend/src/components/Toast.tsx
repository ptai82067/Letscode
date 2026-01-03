import { useEffect, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  duration?: number;
  onClose?: () => void;
}

const toastConfig = {
  success: {
    bg: 'from-emerald-500 to-teal-600',
    icon: '✅',
    borderColor: 'border-emerald-300',
    lightBg: 'bg-emerald-50',
    textColor: 'text-emerald-900',
  },
  error: {
    bg: 'from-red-500 to-rose-600',
    icon: '❌',
    borderColor: 'border-red-300',
    lightBg: 'bg-red-50',
    textColor: 'text-red-900',
  },
  warning: {
    bg: 'from-amber-500 to-orange-600',
    icon: '⚠️',
    borderColor: 'border-amber-300',
    lightBg: 'bg-amber-50',
    textColor: 'text-amber-900',
  },
  info: {
    bg: 'from-blue-500 to-cyan-600',
    icon: 'ℹ️',
    borderColor: 'border-blue-300',
    lightBg: 'bg-blue-50',
    textColor: 'text-blue-900',
  },
};

export function Toast({ message, type, duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);
  const config = toastConfig[type];

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-right-10 duration-300">
      <div
        className={`bg-gradient-to-r ${config.bg} text-white px-6 py-4 rounded-xl shadow-2xl border-l-4 ${config.borderColor} flex items-center gap-4 backdrop-blur-md min-w-80 max-w-md`}
      >
        <span className="text-3xl flex-shrink-0">{config.icon}</span>
        <div className="flex-1">
          <p className="font-bold text-base leading-tight">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Toast Manager for multiple toasts
interface ToastManager {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastManager[]>([]);

  const showToast = (message: string, type: ToastType = 'info', duration = 3000) => {
    const id = Date.now().toString();
    const newToast: ToastManager = { id, message, type, duration };
    setToasts((prev) => [...prev, newToast]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const success = (message: string, duration?: number) =>
    showToast(message, 'success', duration);
  const error = (message: string, duration?: number) =>
    showToast(message, 'error', duration);
  const warning = (message: string, duration?: number) =>
    showToast(message, 'warning', duration);
  const info = (message: string, duration?: number) =>
    showToast(message, 'info', duration);

  const ToastContainer = () => (
    <div className="fixed bottom-6 right-6 z-50 space-y-3 pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto animate-in fade-in slide-in-from-right-10 duration-300"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  );

  return { showToast, success, error, warning, info, toasts, ToastContainer };
}
