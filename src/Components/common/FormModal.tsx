import React, { ReactNode } from "react";
import { X } from "lucide-react";

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  width?: string;
}

const FormModal: React.FC<FormModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  children,
  width = "600px"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-[100] p-4">
      <div 
        className="bg-white rounded-lg shadow-xl max-w-xl w-full mx-auto p-6 relative border border-gray-200"
        style={{ maxWidth: width }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-green-900 hover:text-green-700 transition-colors duration-200 focus:outline-none"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          {icon && <div className="text-green-800">{icon}</div>}
          <div>
            <h2 className="text-lg font-semibold text-green-800">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 text-sm mt-1">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        <hr className="border-gray-200 mb-4" />

        {/* Form Content */}
        <div className="space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormModal;
