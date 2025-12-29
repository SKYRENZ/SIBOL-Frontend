import React from 'react';
import type { MaintenanceRemark } from '../../../types/maintenance';

interface RemarkItemProps {
  remark: MaintenanceRemark;
  isCurrentUser: boolean;
}

const RemarksItem: React.FC<RemarkItemProps> = ({ remark, isCurrentUser }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isCurrentUser
            ? 'bg-[#355842] text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        <div className="flex items-baseline gap-2 mb-1">
          <span className={`text-xs font-semibold ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
            {remark.CreatedByName || 'Unknown'}
          </span>
          <span className={`text-xs ${isCurrentUser ? 'text-white/70' : 'text-gray-500'}`}>
            {formatTime(remark.Created_at)}
          </span>
        </div>
        <p className="text-sm whitespace-pre-wrap break-words">{remark.Remark_text}</p>
      </div>
    </div>
  );
};

export default RemarksItem;