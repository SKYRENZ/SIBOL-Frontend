import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  width?: string;
  children?: React.ReactNode;
}
 
const FormModal: React.FC<FormModalProps> = ({ isOpen, onClose, title, width = '520px', children }) => {
  if (!isOpen) return null;
 
  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[200000] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative rounded-2xl shadow-2xl w-[520px] max-w-[96%] overflow-hidden"
        style={{ width, zIndex: 200001 }}
      >
        {/* Green header (matching existing waste/info modal style) */}
        <div className="px-6 py-4 bg-gradient-to-r from-[#355842] to-[#4a7c5d] text-white relative overflow-visible h-[64px] rounded-t-2xl">
          <div className="flex items-center h-full">
            <h3 className="font-semibold text-lg">{title}</h3>
          </div>

          {/* Close button: match InfoModal — white X, transparent button on top of header decorations */}
          <button
            onClick={onClose}
            aria-label="Close"
            onMouseDown={(e) => e.stopPropagation()}
            className="absolute top-4 right-4 z-30 text-white hover:bg-white/10 transition-colors rounded-full w-8 h-8 flex items-center justify-center p-1 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            <X size={16} strokeWidth={2} color="#ffffff" />
           </button>
        </div>
 
        <div className="p-6 bg-white">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};
 
export default FormModal;