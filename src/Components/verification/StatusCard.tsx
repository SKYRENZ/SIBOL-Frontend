import React from 'react';

interface StatusCardProps {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  icon?: string;
  children?: React.ReactNode;
}

const StatusCard: React.FC<StatusCardProps> = ({ 
  type, 
  title, 
  message, 
  icon, 
  children 
}) => {
  const getCardStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-700';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-700';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-700';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-700';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const getTitleColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`border rounded-lg p-6 mb-6 ${getCardStyles()}`}>
      <div className="text-center">
        {icon && <div className="text-4xl mb-4">{icon}</div>}
        <h3 className={`text-lg font-semibold mb-3 ${getTitleColor()}`}>
          {title}
        </h3>
        {message && <p className="text-sm mb-4">{message}</p>}
        {children}
      </div>
    </div>
  );
};

export default StatusCard;