import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'green' | 'gray';
  text?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  color = 'blue',
  text 
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-5 h-5';
      case 'lg':
        return 'w-20 h-20';
      default:
        return 'w-8 h-8';
    }
  };

  const getColorClasses = () => {
    switch (color) {
      case 'green':
        return 'border-green-200 border-t-green-600';
      case 'gray':
        return 'border-gray-200 border-t-gray-600';
      default:
        return 'border-blue-200 border-t-blue-600';
    }
  };

  return (
    <div className="flex items-center justify-center">
      <div 
        className={`${getSizeClasses()} border-4 rounded-full animate-spin ${getColorClasses()}`}
      ></div>
      {text && <span className="ml-2">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;