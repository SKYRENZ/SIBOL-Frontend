import React, { ReactNode } from "react";

interface FormFieldProps {
  label: string;
  name: string;
  type?: "text" | "date" | "textarea" | "select" | "file";
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  rows?: number;
  accept?: string;
  icon?: ReactNode;
  className?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  rows = 3,
  accept,
  icon,
  className = ""
}) => {
  const baseInputClasses = "w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 focus:border-[#AFC8AD] transition-all duration-200 text-sm";

  const renderInput = () => {
    switch (type) {
      case "textarea":
        return (
          <textarea
            name={name}
            value={value}
            onChange={onChange}
            className={baseInputClasses}
            placeholder={placeholder}
            required={required}
            rows={rows}
          />
        );
      
      case "select":
        return (
          <select
            name={name}
            value={value}
            onChange={onChange}
            className={baseInputClasses}
            required={required}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case "file":
        return (
          <input
            type="file"
            name={name}
            onChange={onChange}
            className={baseInputClasses}
            accept={accept}
            required={required}
          />
        );
      
      default:
        return (
          <div className="relative">
            <input
              type={type}
              name={name}
              value={value}
              onChange={onChange}
              className={baseInputClasses}
              placeholder={placeholder}
              required={required}
            />
            {icon && (
              <div className="absolute right-3 top-2.5">
                {icon}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {renderInput()}
    </div>
  );
};

export default FormField;
