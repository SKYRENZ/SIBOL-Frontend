import React from 'react';
import { Upload, X, Download, File } from 'lucide-react';
import type { MaintenanceAttachment } from '../../../types/maintenance';

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
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[300000]" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-gradient-to-r from-[#355842] to-[#4a7c5d] text-white flex items-center justify-between">
          <h3 className="font-semibold text-lg">{attachment.File_name}</h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/10 transition-colors rounded-full w-8 h-8 flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
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
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Close
          </button>
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
      </div>
    </div>
  );
};

interface AttachmentUploadProps {
  files: File[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: (index: number) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  accept?: string;
  multiple?: boolean;
}

const AttachmentsUpload: React.FC<AttachmentUploadProps> = ({
  files,
  onChange,
  onRemove,
  label = 'Attachments',
  required = false,
  disabled = false,
  accept = 'image/*,.pdf,.doc,.docx',
  multiple = true,
}) => {
  const inputId = `attachment-upload-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label} {required && '*'}
      </label>
      
      <div className="flex items-center gap-2">
        <input
          type="file"
          id={inputId}
          onChange={onChange}
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          className="hidden"
        />
        
        <label
          htmlFor={inputId}
          className={`flex-1 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-[#355842] hover:bg-gray-50 transition-colors ${
            disabled ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Upload size={18} />
            <span className="text-sm">
              {files.length > 0 ? `${files.length} file(s) selected` : 'Choose files to upload'}
            </span>
          </div>
        </label>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-200"
            >
              <span className="text-sm text-gray-700 truncate flex-1">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-2 text-red-500 hover:text-red-700"
                disabled={disabled}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AttachmentsUpload;
export { AttachmentsViewer };