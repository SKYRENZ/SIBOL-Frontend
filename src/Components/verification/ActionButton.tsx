import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface ActionButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  children
}) => {
  const getVariantClasses = () => {
    if (disabled || loading) {
      return 'bg-gray-400 cursor-not-allowed text-white';
    }
    
    switch (variant) {
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'py-2 px-3 text-sm';
      case 'lg':
        return 'py-4 px-6 text-lg';
      default:
        return 'py-3 px-4';
    }
  };

  return (
    <button
      className={`
        ${getSizeClasses()}
        ${getVariantClasses()}
        ${fullWidth ? 'w-full' : ''}
        rounded-lg font-medium transition-colors
      `}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <LoadingSpinner size="sm" color="gray" />
          <span className="ml-2">Loading...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
};

export default ActionButton;