import React from 'react';

type Option = { value: string; label: string };

type Props = {
  label?: string;
  name?: string;
  value?: any;
  onChange?: (e: any) => void;
  placeholder?: string;
  type?: 'text' | 'textarea' | 'select' | 'date';
  options?: Option[];
  rows?: number;
  required?: boolean;
  icon?: React.ReactNode;
  // NEW: allow transparent styling for different forms
  variant?: 'transparent';
  className?: string;
};

const FormField: React.FC<Props> = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = 'text',
  options = [],
  rows = 3,
  required,
  icon,
  variant,
  className = '',
}) => {
  // base input classes
  const base = `w-full px-3 py-2 rounded-md text-sm transition ${className}`;
  const transparentStyles =
    'bg-transparent border border-[#D8E3D8] placeholder:text-gray-400 text-gray-800';
  const defaultStyles =
    'bg-white border border-gray-300 placeholder-gray-400 text-gray-900';

  const inputClass = `${base} ${variant === 'transparent' ? transparentStyles : defaultStyles}`;

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required ? '*' : null}
        </label>
      )}

      {type === 'textarea' ? (
        <textarea
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          rows={rows}
          className={`${inputClass} resize-none`}
        />
      ) : type === 'select' ? (
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`${inputClass} appearance-none`}
        >
          <option value="">{`Select ${label || name}`}</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      ) : (
        <div className="relative">
          {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2">{icon}</div>}
          <input
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            type={type === 'date' ? 'date' : 'text'}
            className={`${icon ? 'pl-10' : ''} ${inputClass}`}
          />
        </div>
      )}
    </div>
  );
};

export default FormField;
