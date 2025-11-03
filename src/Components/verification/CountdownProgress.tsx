import React from 'react';

interface CountdownProgressProps {
  countdown: number;
  total: number;
  color?: 'green' | 'blue' | 'gray';
  text?: string;
}

const CountdownProgress: React.FC<CountdownProgressProps> = ({
  countdown,
  total,
  color = 'green',
  text = 'Redirecting in'
}) => {
  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return { bg: 'bg-blue-200', fill: 'bg-blue-600', text: 'text-blue-600' };
      case 'gray':
        return { bg: 'bg-gray-200', fill: 'bg-gray-600', text: 'text-gray-600' };
      default:
        return { bg: 'bg-green-200', fill: 'bg-green-600', text: 'text-green-600' };
    }
  };

  const colors = getColorClasses();
  const progress = ((total - countdown) / total) * 100;

  return (
    <div className="space-y-2 sm:space-y-3">
      <div className="flex items-center justify-center">
        <span className={`${colors.text} font-bold text-base sm:text-lg`}>
          {text} {countdown}...
        </span>
      </div>
      <div className={`w-full ${colors.bg} rounded-full h-2 sm:h-3`}>
        <div 
          className={`${colors.fill} h-2 sm:h-3 rounded-full transition-all duration-1000 ease-linear`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default CountdownProgress;