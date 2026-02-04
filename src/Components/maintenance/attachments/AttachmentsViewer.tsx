import React from 'react';
import { Download, File } from 'lucide-react';
import type { MaintenanceAttachment } from '../../../types/maintenance';
import FormModal from '../../common/FormModal';

interface AttachmentViewerProps {
  attachment: MaintenanceAttachment | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: () => void;
}

const AttachmentsViewer: React.FC<AttachmentViewerProps> = ({
  attachment,
  isOpen,
  onClose,
  onDownload,
}) => {
  if (!isOpen || !attachment) return null;

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title={attachment.File_name} width="720px">
      <div className="p-6 overflow-y-auto max-h-[60vh]">
        {attachment.File_type?.startsWith('image/') ? (
          <img
            src={attachment.File_path}
            alt={attachment.File_name}
            className="max-w-full h-auto mx-auto rounded"
          />
        ) : (
          <div className="text-center py-12">
            <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-2">{attachment.File_name}</p>
            <p className="text-sm text-gray-500">
              {attachment.File_size ? `${(attachment.File_size / 1024).toFixed(2)} KB` : 'File preview not available'}
            </p>
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
        {onDownload && (
          <button
            onClick={onDownload}
            className="px-4 py-2 text-sm text-white rounded-md hover:opacity-90 flex items-center gap-2"
            style={{ backgroundColor: '#355842' }}
          >
            <Download size={16} />
            Download
          </button>
        )}
      </div>
    </FormModal>
  );
};

export default AttachmentsViewer;