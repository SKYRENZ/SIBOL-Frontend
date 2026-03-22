import React, { useEffect, useState } from 'react';

interface CreditScoreGaugeProps {
  score: number | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  showScore?: boolean;
  showGauge?: boolean;
  integratedAvatar?: boolean;
  avatarSrc?: string;
  avatarAlt?: string;
}

const CreditScoreGauge: React.FC<CreditScoreGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true,
  showScore = true,
  showGauge = true,
  integratedAvatar = false,
  avatarSrc,
  avatarAlt = 'User profile',
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  const numericScore =
    score !== undefined && score !== null && !isNaN(Number(score))
      ? Math.max(0, Math.min(100, Number(score)))
      : 0;

  const getStatusInfo = (score: number) => {
    if (score >= 80) {
      return {
        status: 'Excellent',
        color: '#059669',
        gradient: 'from-emerald-400 to-emerald-600',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        ringColor: '#d1fae5',
      };
    }
    if (score >= 60) {
      return {
        status: 'Good',
        color: '#10b981',
        gradient: 'from-green-400 to-emerald-500',
        bgColor: 'bg-emerald-50',
        textColor: 'text-emerald-700',
        borderColor: 'border-emerald-200',
        ringColor: '#d1fae5',
      };
    }
    if (score >= 40) {
      return {
        status: 'Fair',
        color: '#f59e0b',
        gradient: 'from-amber-400 to-orange-500',
        bgColor: 'bg-amber-50',
        textColor: 'text-amber-700',
        borderColor: 'border-amber-200',
        ringColor: '#fef3c7',
      };
    }
    return {
      status: 'Poor',
      color: '#ef4444',
      gradient: 'from-red-400 to-red-600',
      bgColor: 'bg-red-50',
      textColor: 'text-red-700',
      borderColor: 'border-red-200',
      ringColor: '#fee2e2',
    };
  };

  const statusInfo = getStatusInfo(numericScore);

  const sizeConfig = {
    sm: {
      width: 170,
      height: 150,
      radius: 65,
      strokeWidth: 10,
      avatarDiameter: 96,
      avatarTop: 36,
      avatarWrap: 'w-24 h-24',
      avatarInner: 'w-20 h-20',
      scoreBubble: 'w-8 h-8 text-[11px]',
      scoreBubbleOffset: 16,
      scoreText: 'text-lg',
      statusSize: 'text-xs',
    },
    md: {
      width: 230,
      height: 190,
      radius: 86,
      strokeWidth: 13,
      avatarDiameter: 128,
      avatarTop: 36,
      avatarWrap: 'w-32 h-32',
      avatarInner: 'w-28 h-28',
      scoreBubble: 'w-10 h-10 text-sm',
      scoreBubbleOffset: 20,
      scoreText: 'text-3xl',
      statusSize: 'text-sm',
    },
    lg: {
      width: 300,
      height: 240,
      radius: 112,
      strokeWidth: 16,
      avatarDiameter: 160,
      avatarTop: 36,
      avatarWrap: 'w-40 h-40',
      avatarInner: 'w-36 h-36',
      scoreBubble: 'w-12 h-12 text-base',
      scoreBubbleOffset: 24,
      scoreText: 'text-5xl',
      statusSize: 'text-base',
    },
  } as const;

  const config = sizeConfig[size];

  useEffect(() => {
    setIsVisible(true);
    const duration = 1200;
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
  }, [numericScore]);

  const cx = config.width / 2;
  const isCircularGauge = integratedAvatar && showGauge;
  const gaugeRadius = isCircularGauge ? config.avatarDiameter / 2 + config.strokeWidth * 0.8 : config.radius;
  const cy = isCircularGauge ? config.avatarTop + config.avatarDiameter / 2 : config.height - config.strokeWidth;
  const startX = cx - gaugeRadius;
  const endX = cx + gaugeRadius;
  const arcPath = `M ${startX} ${cy} A ${gaugeRadius} ${gaugeRadius} 0 0 1 ${endX} ${cy}`;
  const arcLength = isCircularGauge ? 2 * Math.PI * gaugeRadius : Math.PI * gaugeRadius;
  const progressLength = arcLength * (animatedScore / 100);
  const theta = isCircularGauge
    ? Math.PI + (animatedScore / 100) * 2 * Math.PI
    : Math.PI - (animatedScore / 100) * Math.PI;
  const dotX = cx + gaugeRadius * Math.cos(theta);
  const dotY = isCircularGauge
    ? cy + gaugeRadius * Math.sin(theta)
    : cy - gaugeRadius * Math.sin(theta);

  return (
    <div
      className={`flex flex-col items-center justify-center w-full transition-all duration-700 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
      }`}
    >
      <div style={{ width: config.width, height: config.height }} className="relative">
        {showGauge && (
          <svg width={config.width} height={config.height} viewBox={`0 0 ${config.width} ${config.height}`} className="absolute inset-0">
            {isCircularGauge ? (
              <>
                <circle
                  cx={cx}
                  cy={cy}
                  r={gaugeRadius}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth={config.strokeWidth}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={gaugeRadius}
                  fill="none"
                  stroke={statusInfo.color}
                  strokeWidth={config.strokeWidth}
                  strokeDasharray={arcLength}
                  strokeDashoffset={arcLength - progressLength}
                  strokeLinecap="round"
                  transform={`rotate(-180 ${cx} ${cy})`}
                  className="transition-all duration-700 ease-out"
                />
              </>
            ) : (
              <>
                <path
                  d={arcPath}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth={config.strokeWidth}
                  strokeLinecap="round"
                />
                <path
                  d={arcPath}
                  fill="none"
                  stroke={statusInfo.color}
                  strokeWidth={config.strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={`${progressLength} ${arcLength}`}
                  className="transition-all duration-700 ease-out"
                />
              </>
            )}
            <circle
              cx={dotX}
              cy={dotY}
              r={config.strokeWidth * 0.36}
              fill="white"
              stroke={statusInfo.color}
              strokeWidth="2"
            />
          </svg>
        )}

        {integratedAvatar ? (
          <>
            <div className={`absolute left-1/2 -translate-x-1/2 top-9 ${config.avatarWrap} rounded-full bg-white shadow-md border-4`} style={{ borderColor: statusInfo.ringColor }}>
              <div className={`m-auto mt-1 ${config.avatarInner} rounded-full overflow-hidden bg-gray-100 flex items-center justify-center`}>
                {avatarSrc ? (
                  <img src={avatarSrc} alt={avatarAlt} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-gray-500 text-xs font-semibold">No image</span>
                )}
              </div>
            </div>

            {showGauge && showScore && (
              <div
                className={`absolute ${config.scoreBubble} rounded-full bg-white border-2 text-center font-bold ${statusInfo.textColor} shadow-md flex items-center justify-center`}
                style={{
                  borderColor: statusInfo.color,
                  left: dotX - config.scoreBubbleOffset,
                  top: dotY - config.scoreBubbleOffset,
                }}
              >
                {animatedScore}
              </div>
            )}
          </>
        ) : (
          showScore && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`${config.scoreText} font-bold ${statusInfo.textColor}`}>{animatedScore}</span>
            </div>
          )
        )}
      </div>

      {showLabel && (
        <div className="mt-2">
          <div
            className={`${statusInfo.bgColor} ${statusInfo.textColor} border ${statusInfo.borderColor} px-4 py-1.5 rounded-full ${config.statusSize} font-semibold`}
          >
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${statusInfo.gradient}`} />
              {statusInfo.status}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditScoreGauge;
