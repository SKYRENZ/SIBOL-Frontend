import React, { useState } from 'react';
import { Paperclip, Send, X } from 'lucide-react';

interface RemarksFormProps {
  onSubmit: (remarkText: string, files: File[]) => Promise<void>;
  disabled?: boolean;
}

const RemarksForm: React.FC<RemarksFormProps> = ({ onSubmit, disabled = false }) => {
  const [remarkText, setRemarkText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!remarkText.trim() && files.length === 0) return;

    setIsSubmitting(true);
    try {
      await onSubmit(remarkText, files);
      setRemarkText('');
      setFiles([]);
    } catch (error) {
      console.error('Failed to submit remark:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Add Remark
      </label>

      {files.length > 0 && (
        <div className="space-y-1">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-blue-50 rounded border border-blue-200"
            >
              <span className="text-sm text-gray-700 truncate flex-1">
                {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </span>
              <button
                type="button"
                onClick={() => removeFile(index)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="file"
          id="remark-attachment"
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx"
          multiple
          className="hidden"
          disabled={disabled || isSubmitting}
        />

        <label
          htmlFor="remark-attachment"
          className={`flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer ${
            disabled || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Paperclip size={18} className="text-gray-600" />
        </label>

        <textarea
          value={remarkText}
          onChange={(e) => setRemarkText(e.target.value)}
          placeholder="Type your remark here..."
          rows={1}
          disabled={disabled || isSubmitting}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355842] focus:border-transparent resize-none"
        />

        <button
          type="button"
          onClick={handleSubmit}
          disabled={(!remarkText.trim() && files.length === 0) || disabled || isSubmitting}
          className="flex items-center justify-center px-4 py-2 bg-[#355842] text-white rounded-md hover:bg-[#2e4a36] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  );
};

export default RemarksForm;