import React, { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast, onClose]);

  const bgColor = {
    success: 'bg-green-50 border-green-200',
    error: 'bg-red-50 border-red-200',
    info: 'bg-blue-50 border-blue-200'
  };

  const textColorIcon = {
    success: 'text-green-600',
    error: 'text-red-600',
    info: 'text-blue-600'
  };

  const Icon = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  }[toast.type];

  return (
    <div className={`flex items-center gap-3 border rounded-lg px-4 py-3 shadow-md ${bgColor[toast.type]}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${textColorIcon[toast.type]}`} />
      <p className={`text-sm font-medium ${textColorIcon[toast.type]}`}>{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className={`ml-auto flex-shrink-0 ${textColorIcon[toast.type]} hover:opacity-70`}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
