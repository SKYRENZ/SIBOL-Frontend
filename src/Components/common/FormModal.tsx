import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: string; // optional override for max width
  children?: React.ReactNode;
  showCloseButton?: boolean;
  hasCancelButton?: boolean;

  // ✅ NEW (minimal): allow switching header color
  headerTone?: 'default' | 'danger';
}
 
const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  width = '720px',
  children,
  showCloseButton = true,
  hasCancelButton = false,
  headerTone = 'default',
}) => {
  if (!isOpen) return null;

  const shouldShowCloseButton = showCloseButton && !hasCancelButton;

  const headerBgClass =
    headerTone === 'danger'
      ? 'bg-gradient-to-r from-red-900 to-red-700'
      : 'bg-gradient-to-r from-[#355842] to-[#4a7c5d]';

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[200000] flex items-center justify-center px-4 sm:px-6 md:px-8">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        className={`
          relative rounded-2xl shadow-2xl bg-white overflow-hidden
          w-full
        `}
        style={{
          width: width || undefined,
          maxHeight: 'calc(100% - 40px)', // 20px margin top/bottom
        }}
      >
        {/* Header */}
        <div className={`px-6 py-4 ${headerBgClass} text-white relative`}>
          <div className="flex items-center h-full">
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>

          {shouldShowCloseButton && (
            <button
              onClick={onClose}
              aria-label="Close"
              onMouseDown={(e) => e.stopPropagation()}
              className="absolute top-4 right-4 z-30 text-white hover:bg-white/10 transition-colors rounded-full w-8 h-8 flex items-center justify-center p-1 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              <X size={16} strokeWidth={2} color="#ffffff" />
            </button>
          )}
        </div>

        {/* Content */}
        <div
          className="p-6 overflow-y-auto"
          style={{ maxHeight: 'calc(100% - 64px)' }} // header height = 64px
        >
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default FormModal;
