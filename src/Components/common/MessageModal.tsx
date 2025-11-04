import React from 'react';
import { Check, X, AlertCircle, Info } from 'lucide-react';

interface MessageModalProps {
  open: boolean;
  onClose: () => void;
  type?: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  confirmText?: string;
}

const MessageModal: React.FC<MessageModalProps> = ({
  open,
  onClose,
  type = 'info',
  title,
  message,
  confirmText = 'OK'
}) => {
  if (!open) return null;

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check className="w-12 h-12 text-green-500" />;
      case 'error':
        return <X className="w-12 h-12 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-12 h-12 text-yellow-500" />;
      default:
        return <Info className="w-12 h-12 text-blue-500" />;
    }
  };

  const getColors = () => {
    switch (type) {
      case 'success':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' };
      case 'error':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' };
      case 'warning':
        return { bg: 'bg-yellow-50', border: 'border-yellow-200', text: 'text-yellow-800' };
      default:
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg overflow-hidden mx-4">
        <div className={`${colors.bg} ${colors.border} border-b p-6`}>
          <div className="flex flex-col items-center text-center">
            {getIcon()}
            <h3 className={`text-xl font-bold mt-4 ${colors.text}`}>{title}</h3>
          </div>
        </div>

        <div className="p-6">
          <p className="text-gray-700 text-center mb-6">{message}</p>
          
          <button
            onClick={onClose}
            className="w-full bg-sibol-green hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageModal;