import React, { useEffect, useState } from 'react';

interface CreditScoreGaugeProps {
  score: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showScore?: boolean; // New prop to control score display
}

const CreditScoreGauge: React.FC<CreditScoreGaugeProps> = ({ score, size = 'md', showLabel = true }) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Safely convert score to number
  const numericScore = score !== undefined && score !== null && !isNaN(Number(score)) ? Number(score) : 0;

  // Enhanced status with gradients and better colors
  const getStatusInfo = (score: number) => {
    if (score >= 80) {
      return {
        status: 'Excellent',
        color: '#059669', // emerald-600
        gradient: 'from-emerald-400 to-emerald-600',
        lightColor: '#d1fae5',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        shadowColor: 'shadow-emerald-200',
        glowColor: 'rgba(16, 185, 129, 0.3)',
      };
    }
    if (score >= 60) {
      return {
        status: 'Good',
        color: '#10b981', // emerald-500
        gradient: 'from-green-400 to-emerald-500',
        lightColor: '#d1fae5',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        shadowColor: 'shadow-emerald-200',
        glowColor: 'rgba(16, 185, 129, 0.3)',
      };
    }
    if (score >= 40) {
      return {
        status: 'Fair',
        color: '#f59e0b', // amber-500
        gradient: 'from-amber-400 to-orange-500',
        lightColor: '#fef3c7',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        shadowColor: 'shadow-amber-200',
        glowColor: 'rgba(245, 158, 11, 0.3)',
      };
    }
    return {
      status: 'Poor',
      color: '#ef4444', // red-500
      gradient: 'from-red-400 to-red-600',
      lightColor: '#fee2e2',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      shadowColor: 'shadow-red-200',
      glowColor: 'rgba(239, 68, 68, 0.3)',
    };
  };

  const statusInfo = getStatusInfo(numericScore);

  // Size configurations with better proportions
  const sizeConfig = {
    sm: { 
      width: 120, 
      height: 90, 
      fontSize: 'text-lg', 
      statusSize: 'text-xs', 
      radius: 45, 
      strokeWidth: 8,
      innerRadius: 35,
      dotSize: 4
    },
    md: { 
      width: 180, 
      height: 105, 
      fontSize: 'text-3xl', 
      statusSize: 'text-sm', 
      radius: 65, 
      strokeWidth: 12,
      innerRadius: 50,
      dotSize: 6
    },
    lg: { 
      width: 260, 
      height: 150, 
      fontSize: 'text-5xl', 
      statusSize: 'text-base', 
      radius: 95, 
      strokeWidth: 16,
      innerRadius: 75,
      dotSize: 8
    },
  };

  const config = sizeConfig[size];

  // Animation on mount
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      const duration = 1500; // 1.5 seconds animation
      const steps = 60;
      const increment = numericScore / steps;
      let current = 0;
      
      const animation = setInterval(() => {
        current += increment;
        if (current >= numericScore) {
          setAnimatedScore(numericScore);
          clearInterval(animation);
        } else {
          setAnimatedScore(Math.floor(current));
        }
      }, duration / steps);
      
      return () => clearInterval(animation);
    }, 100);
    
    return () => clearTimeout(timer);
  }, [numericScore]);

  // Calculate the arc path
  const createArcPath = (startAngle: number, endAngle: number, radius: number, innerRadius: number) => {
    const startAngleRad = (startAngle * Math.PI) / 180;
    const endAngleRad = (endAngle * Math.PI) / 180;
    
    const x1 = config.width / 2 + radius * Math.cos(startAngleRad);
    const y1 = config.height / 2 + radius * Math.sin(startAngleRad);
    const x2 = config.width / 2 + radius * Math.cos(endAngleRad);
    const y2 = config.height / 2 + radius * Math.sin(endAngleRad);
    
    const x3 = config.width / 2 + innerRadius * Math.cos(endAngleRad);
    const y3 = config.height / 2 + innerRadius * Math.sin(endAngleRad);
    const x4 = config.width / 2 + innerRadius * Math.cos(startAngleRad);
    const y4 = config.height / 2 + innerRadius * Math.sin(startAngleRad);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4} Z`;
  };

  // Background arc (full 180 degrees)
  const backgroundPath = createArcPath(-180, 0, config.radius, config.innerRadius);
  
  // Progress arc (based on score)
  const progressAngle = -180 + (animatedScore / 100) * 180;
  const progressPath = createArcPath(-180, progressAngle, config.radius, config.innerRadius);

  // Calculate dot position
  const dotAngleRad = (progressAngle * Math.PI) / 180;
  const dotX = config.width / 2 + config.radius * Math.cos(dotAngleRad);
  const dotY = config.height / 2 + config.radius * Math.sin(dotAngleRad);

  return (
    <div className={`flex flex-col items-center justify-center w-full transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
      <div style={{ width: config.width, height: config.height }} className="relative mb-3">
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-full blur-xl opacity-30"
          style={{ backgroundColor: statusInfo.glowColor }}
        />
        
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="relative drop-shadow-lg"
        >
          {/* Background track */}
          <path
            d={backgroundPath}
            fill="#f3f4f6"
            className="transition-all duration-300"
          />
          
          {/* Progress arc with gradient */}
          <defs>
            <linearGradient id={`gradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={statusInfo.color} stopOpacity="0.8" />
              <stop offset="100%" stopColor={statusInfo.color} stopOpacity="1" />
            </linearGradient>
            <filter id={`glow-${size}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge> 
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          
          <path
            d={progressPath}
            fill={`url(#gradient-${size})`}
            filter={`url(#glow-${size})`}
            className="transition-all duration-500 ease-out"
          />
          
          {/* Animated dot at the end of progress */}
          <circle
            cx={dotX}
            cy={dotY}
            r={config.dotSize}
            fill="white"
            stroke={statusInfo.color}
            strokeWidth="2"
            className="drop-shadow-md transition-all duration-300"
          />
          
          {/* Center decoration */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r="3"
            fill={statusInfo.color}
            opacity="0.3"
          />
        </svg>

        {/* Score display in center */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="flex items-baseline">
            <span className={`${config.fontSize} font-bold ${statusInfo.textColor} transition-all duration-300`}>
              {animatedScore}
            </span>
            {size !== 'sm' && (
              <span className="text-lg text-gray-400 font-medium ml-1">/100</span>
            )}
          </div>
          {size === 'lg' && (
            <span className={`text-sm ${statusInfo.textColor} opacity-70 font-medium mt-1`}>
              Credit Score
            </span>
          )}
        </div>
      </div>

      {/* Enhanced status label */}
      {showLabel && (
        <div className={`relative group`}>
          <div className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} ${size === 'sm' ? 'px-3 py-1' : 'px-4 py-1.5'} rounded-full ${config.statusSize} font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg ${statusInfo.shadowColor}`}>
            <div className="flex items-center gap-2">
              {/* Status indicator dot */}
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${statusInfo.gradient} animate-pulse`} />
              {statusInfo.status}
            </div>
          </div>
          
          {/* Tooltip on hover */}
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
            {numericScore >= 80 && 'Outstanding credit health'}
            {numericScore >= 60 && numericScore < 80 && 'Good credit standing'}
            {numericScore >= 40 && numericScore < 60 && 'Room for improvement'}
            {numericScore < 40 && 'Needs immediate attention'}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
              <div className="border-4 border-transparent border-t-gray-800"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditScoreGauge;
