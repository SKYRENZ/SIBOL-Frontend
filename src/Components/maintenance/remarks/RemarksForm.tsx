import React, { useEffect, useMemo, useState, useId } from 'react';
import { Paperclip, Send, X, File as FileIcon } from 'lucide-react';

interface RemarksFormProps {
  onSubmit: (remarkText: string, files: File[]) => Promise<void>;
  disabled?: boolean;
}

const RemarksForm: React.FC<RemarksFormProps> = ({ onSubmit, disabled = false }) => {
  const [remarkText, setRemarkText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Unique id per RemarksForm instance (fixes desktop label/file-picker issue)
  const reactId = useId();
  const inputId = `remark-attachment-${reactId}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...newFiles]);
    }
    e.target.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ Build previews for images (carousel)
  const previews = useMemo(() => {
    return files.map((file) => {
      const isImage = file.type?.startsWith('image/');
      return {
        file,
        isImage,
        url: isImage ? URL.createObjectURL(file) : null,
      };
    });
  }, [files]);

  // ✅ Cleanup object URLs
  useEffect(() => {
    return () => {
      previews.forEach((p) => {
        if (p.url) URL.revokeObjectURL(p.url);
      });
    };
  }, [previews]);

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
      <label className="block text-sm font-medium text-gray-700">Add Remark</label>

      {/* ✅ Carousel-style previews (left-to-right) */}
      {files.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {previews.map((p, index) => (
            <div
              key={`${p.file.name}-${p.file.size}-${index}`}
              className="relative flex-shrink-0 w-16 h-16 border border-gray-200 rounded-md overflow-hidden bg-gray-50"
              title={p.file.name}
            >
              {p.isImage && p.url ? (
                <img src={p.url} alt={p.file.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-1">
                  <FileIcon size={18} className="text-gray-500" />
                  <span className="text-[10px] text-gray-600 text-center leading-tight line-clamp-2">
                    {p.file.name}
                  </span>
                </div>
              )}

              <button
                type="button"
                onClick={() => removeFile(index)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 hover:bg-black/75"
                disabled={disabled || isSubmitting}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="file"
          id={inputId}
          onChange={handleFileChange}
          accept="image/*,.pdf,.doc,.docx"
          multiple
          className="hidden"
          disabled={disabled || isSubmitting}
        />

        <label
          htmlFor={inputId}
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