import React, { useState } from 'react';

interface FormFieldProps {
  label: React.ReactNode;
  name: string;
  type: 'text' | 'email' | 'password' | 'date' | 'select' | 'textarea' | 'button-select' | 'button-grid-select';
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  selectSize?: number;
  colorMap?: Record<string, { bg: string; border: string; selectedBg: string; selectedBorder: string; gradient?: string; selectedGradient?: string }>;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  options = [],
  disabled = false,
  selectSize = 5,
  colorMap = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOptionClick = (optionValue: string) => {
    const event = {
      target: { value: optionValue, name }
    } as any;
    onChange(event);
    setIsOpen(false);
  };

  const selectedLabel = options.find(opt => opt.value === value)?.label || placeholder || 'Select an option';
  return (
    <div className="flex flex-col gap-1.5 sm:gap-2">
      <label htmlFor={name} className="text-xs sm:text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {type === 'button-grid-select' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {options.map((option) => {
            const colors = colorMap[option.value];
            const isSelected = value === option.value;
            const bgClass = colors?.gradient || colors?.bg || 'bg-white';
            const selectedBgClass = colors?.selectedGradient || colors?.selectedBg || 'bg-[#2E523A]';
            const borderClass = isSelected ? colors?.selectedBorder || 'border-[#2E523A]' : colors?.border || 'border-gray-300';
            const textClass = isSelected ? 'text-white' : 'text-gray-700';
            const finalBgClass = isSelected ? selectedBgClass : bgClass;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  const event = {
                    target: { value: option.value, name }
                  } as any;
                  onChange(event);
                }}
                disabled={disabled}
                className={`px-5 py-3 rounded-2xl font-semibold text-sm transition-all border-2 flex items-center justify-center gap-2 whitespace-nowrap shadow-md hover:shadow-lg ${finalBgClass} ${borderClass} ${textClass} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSelected && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
                <span>{option.label}</span>
              </button>
            );
          })}
        </div>
      ) : type === 'button-select' ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={`w-full px-4 py-2.5 text-sm font-medium rounded-lg border transition-all text-left flex items-center justify-between ${
              value ? 'bg-[#2E523A] text-white border-[#2E523A]' : 'bg-white text-gray-700 border-gray-300'
            } disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md`}
          >
            <span>{selectedLabel}</span>
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
              {options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleOptionClick(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-all hover:bg-gray-100 ${
                    value === option.value ? 'bg-[#2E523A] text-white' : 'text-gray-700'
                  } first:rounded-t-lg last:rounded-b-lg`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : type === 'select' ? (
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className={`w-full px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-left rounded-lg border transition-all flex items-center justify-between ${
              value ? 'bg-white text-gray-900 border-gray-300' : 'bg-white text-gray-500 border-gray-300'
            } disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 focus:border-transparent`}
          >
            <span>{selectedLabel}</span>
            <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
              {!value && <button
                type="button"
                onClick={() => {
                  const event = { target: { value: '', name } } as any;
                  onChange(event);
                  setIsOpen(false);
                }}
                className="w-full text-left px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm text-gray-500 hover:bg-gray-100 first:rounded-t-lg"
              >
                Select an option
              </button>}
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    const event = { target: { value: option.value, name } } as any;
                    onChange(event);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm transition-all hover:bg-gray-100 ${
                    value === option.value ? 'bg-gray-50 font-medium' : 'text-gray-700'
                  } ${index === options.length - 1 ? 'last:rounded-b-lg' : ''}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : type === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed resize-vertical"
          rows={4}
        />
      ) : (
        <input
          id={name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="w-full px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#AFC8AD]/40 focus:border-transparent transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
      )}
    </div>
  );
};

export default FormField;
