import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: string;
  children?: React.ReactNode;
  showCloseButton?: boolean;

  headerTone?: 'default' | 'danger';

  // ✅ NEW: allow disabling backdrop click close (needed for first-login modals)
  closeOnBackdrop?: boolean;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  width = '720px',
  children,
  showCloseButton = true,
  headerTone = 'default',
  closeOnBackdrop = true, // ✅ default
}) => {
  if (!isOpen) return null;

  const headerBgClass =
    headerTone === 'danger'
      ? 'bg-gradient-to-r from-red-900 to-red-700'
      : 'bg-gradient-to-r from-[#355842] to-[#4a7c5d]';

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[200000] flex items-center justify-center px-4 sm:px-6 md:px-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined} // ✅ changed
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative rounded-2xl shadow-2xl bg-white overflow-hidden w-full"
        style={{
          width: width || undefined,
          maxHeight: 'calc(100% - 40px)',
        }}
      >
        {/* Header */}
        <div className={`px-6 py-4 ${headerBgClass} text-white relative`}>
          <div className="flex items-center h-full">
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>

          {showCloseButton && (
            <button
              onClick={onClose}
              aria-label="Close"
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute top-4 right-4 z-30 text-white bg-red-600 hover:bg-red-700 transition-colors rounded-full w-8 h-8 flex items-center justify-center p-1 focus:outline-none"
            >
              <X size={16} strokeWidth={3} color="#ffffff" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(100% - 64px)' }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FormModal;
