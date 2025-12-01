import React from 'react';
import ReactDOM from 'react-dom';
import { X, Info } from 'lucide-react';
import CustomScrollbar from './CustomScrollbar';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  closeButtonText?: string;
}

const InfoModal: React.FC<InfoModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  closeButtonText = 'Got it, thanks!'
}) => {
  if (!isOpen) return null;

  const modal = (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
        .animate-slideUp { animation: slideUp 0.3s ease-out; }
      `}</style>

      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
        <div className="relative w-[90%] sm:w-[80%] md:w-[60%] lg:w-[45%] max-h-[85vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-slideUp">
          {/* Header with gradient and spacing */}
          <div className="px-8 py-6 bg-gradient-to-r from-[#355842] to-[#4a7c5d] text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
            <div className="relative flex items-center gap-4">
              <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
                <Info size={32} className="text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{title}</h2>
                <p className="text-white/90 text-sm">{subtitle}</p>
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white hover:bg-white/20 transition-colors z-10 rounded-full p-2"
          >
            <X size={24} />
          </button>
          
          <CustomScrollbar className="p-6 bg-gradient-to-b from-gray-50 to-white" maxHeight="max-h-[60vh]">
            {children}
          </CustomScrollbar>

          {/* Close button at bottom */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-[#355842] to-[#4a7c5d] hover:from-[#2d4a37] hover:to-[#3d6a4d] text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
            >
              {closeButtonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );

  return ReactDOM.createPortal(modal, document.body);
};

export default InfoModal;