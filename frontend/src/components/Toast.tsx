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
    bg: 'from-emerald-500 to-emerald-600',
    icon: '✅',
    borderColor: 'border-emerald-400',
  },
  error: {
    bg: 'from-red-500 to-red-600',
    icon: '❌',
    borderColor: 'border-red-400',
  },
  warning: {
    bg: 'from-amber-500 to-amber-600',
    icon: '⚠️',
    borderColor: 'border-amber-400',
  },
  info: {
    bg: 'from-blue-500 to-blue-600',
    icon: 'ℹ️',
    borderColor: 'border-blue-400',
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
    <div
      className={`fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-right-10 duration-300`}
    >
      <div
        className={`bg-gradient-to-r ${config.bg} text-white px-6 py-4 rounded-xl shadow-2xl border-l-4 ${config.borderColor} flex items-center gap-3 backdrop-blur-sm`}
      >
        <span className="text-2xl">{config.icon}</span>
        <p className="font-semibold text-base">{message}</p>
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
