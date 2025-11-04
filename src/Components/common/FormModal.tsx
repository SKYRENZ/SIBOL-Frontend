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
    <div
      className="flex items-center justify-center p-4"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        zIndex: 999999,
      }}
    >
      <div 
        className="relative bg-white rounded-lg shadow-2xl w-full mx-auto p-6 border border-gray-200 max-h-[90vh] overflow-y-auto"
        style={{ maxWidth: width, zIndex: 1000000 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-transparent rounded-md p-1 text-green-900 hover:text-green-700 hover:bg-transparent transition-colors duration-200 focus:outline-none"
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
        <div className="space-y-4 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormModal;