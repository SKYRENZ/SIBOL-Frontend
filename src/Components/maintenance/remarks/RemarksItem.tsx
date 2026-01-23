import React from 'react';
import type { MaintenanceRemark } from '../../../types/maintenance';

interface RemarkItemProps {
  remark: MaintenanceRemark;
  isCurrentUser: boolean;
}

const normalizeRoleName = (role: string | null | undefined) => {
  if (!role) return '';
  return role.replace(/_staff/gi, '').trim();
};

const formatNameWithRole = (name: string | null | undefined, role: string | null | undefined) => {
  const safeName = (name || 'Unknown').trim();
  const safeRole = normalizeRoleName(role);
  return safeRole ? `${safeName} (${safeRole})` : safeName;
};

const formatDateTime = (timestamp: string) => {
  const d = new Date(timestamp);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleString(undefined, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const RemarksItem: React.FC<RemarkItemProps> = ({ remark, isCurrentUser }) => {
  const role =
    (remark as any).User_role ??
    (remark as any).user_role ??
    (remark as any).CreatedByRoleName ??
    (remark as any).CreatedByRole ??
    null;

  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2 ${
          isCurrentUser
            ? 'bg-[#355842] text-white rounded-br-sm'
            : 'bg-gray-100 text-gray-800 rounded-bl-sm'
        }`}
      >
        {/* ✅ Name + Role only */}
        <div className="mb-1">
          <span className={`text-xs font-semibold ${isCurrentUser ? 'text-white' : 'text-gray-900'}`}>
            {formatNameWithRole(remark.CreatedByName, role)}
          </span>
        </div>

        <p className="text-sm whitespace-pre-wrap break-words">{remark.Remark_text}</p>

        {/* ✅ Date/time below message */}
        <div className={`mt-1 text-[11px] ${isCurrentUser ? 'text-white/70' : 'text-gray-500'}`}>
          {formatDateTime(remark.Created_at)}
        </div>
      </div>
    </div>
  );
};

export default RemarksItem;