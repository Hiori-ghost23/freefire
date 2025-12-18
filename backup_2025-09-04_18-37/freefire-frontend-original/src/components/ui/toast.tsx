import * as React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  type?: 'success' | 'error' | 'info';
  title?: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({ id, type = 'info', title, message, onClose }, ref) => {
    const icons = {
      success: CheckCircle,
      error: AlertCircle,
      info: AlertCircle,
    };

    const colors = {
      success: 'bg-emerald-500/10 border-emerald-400/20 text-emerald-200',
      error: 'bg-red-500/10 border-red-400/20 text-red-300',
      info: 'bg-primary/10 border-primary/20 text-primary-200',
    };

    const Icon = icons[type];

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg border px-4 py-3 text-sm flex items-center gap-3 backdrop-blur-sm shadow-lg',
          colors[type]
        )}
      >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <div className="flex-1">
          {title && <p className="font-medium">{title}</p>}
          <p className={title ? 'text-xs opacity-90' : ''}>{message}</p>
        </div>
        <button
          onClick={() => onClose(id)}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }
);
Toast.displayName = 'Toast';

// Context pour gérer les toasts
interface ToastContextType {
  toasts: Omit<ToastProps, 'onClose'>[];
  addToast: (toast: Omit<ToastProps, 'id' | 'onClose'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = React.createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = React.useState<Omit<ToastProps, 'onClose'>[]>([]);

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id' | 'onClose'>) => {
    const id = Math.random().toString(36).substring(7);
    const newToast = { ...toast, id };
    
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after duration
    const duration = toast.duration || 5000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            {...toast}
            onClose={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
