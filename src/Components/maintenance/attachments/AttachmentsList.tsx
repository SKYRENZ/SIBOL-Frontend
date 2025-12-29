import React from 'react';
import { File, X, Eye } from 'lucide-react';
import type { MaintenanceAttachment } from '../../../types/maintenance';

interface AttachmentsListProps {
  attachments: MaintenanceAttachment[];
  onView?: (attachment: MaintenanceAttachment) => void;
  onRemove?: (index: number) => void;
  isReadOnly?: boolean;
  size?: 'sm' | 'md';
}

const AttachmentsList: React.FC<AttachmentsListProps> = ({
  attachments,
  onView,
  onRemove,
  isReadOnly = false,
  size = 'md',
}) => {
  if (attachments.length === 0) {
    return (
      <div className="px-4 py-6 border border-dashed border-gray-200 rounded-2xl text-sm text-gray-500 bg-gray-50">
        No attachments uploaded.
      </div>
    );
  }

  const boxClass = size === 'sm' ? 'w-16 h-16 rounded-md' : 'w-24 h-24 rounded-lg';
  const iconClass = size === 'sm' ? 'w-6 h-6' : 'w-8 h-8';
  const eyeClass = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';
  const nameClass = size === 'sm' ? 'text-[10px]' : 'text-xs';

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-2">
      {attachments.map((attachment, index) => (
        <div
          key={index}
          className={`relative group flex-shrink-0 ${boxClass} border border-gray-200 overflow-hidden bg-gray-50 cursor-pointer hover:border-[#355842] transition-colors`}
          onClick={() => onView?.(attachment)}
        >
          {attachment.File_type?.startsWith('image/') ? (
            <img
              src={attachment.File_path}
              alt={attachment.File_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <File className={`${iconClass} text-gray-400`} />
            </div>
          )}

          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity flex items-center justify-center">
            <Eye className={`${eyeClass} text-white opacity-0 group-hover:opacity-100 transition-opacity`} />
          </div>

          {!isReadOnly && onRemove && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(index);
              }}
              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            >
              <X size={12} />
            </button>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1">
            <p className={`${nameClass} text-white truncate`}>{attachment.File_name}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttachmentsList;