import React, { useMemo, useRef, useEffect } from "react";
import { X, File as FileIcon } from "lucide-react";
import type { MaintenanceAttachment, MaintenanceEvent, MaintenanceRemark } from "../../../types/maintenance";
import MaintenanceEventLog from "../eventLog/MaintenanceEventLog";
import RemarksForm from "./RemarksForm";

interface RemarksMaxModalProps {
  isOpen: boolean;
  onClose: () => void;

  title?: string;

  events: MaintenanceEvent[];
  remarks: MaintenanceRemark[];
  attachments: MaintenanceAttachment[];

  loading?: boolean;
  currentUserId?: number | null;

  canAddRemarks?: boolean;
  onSubmitRemark?: (remarkText: string, files: File[]) => Promise<void>;

  onAttachmentClick?: (attachment: MaintenanceAttachment) => void;
}

const RemarksMaxModal: React.FC<RemarksMaxModalProps> = ({
  isOpen,
  onClose,
  title = "Remarks",
  events,
  remarks,
  attachments,
  loading = false,
  currentUserId = null,
  canAddRemarks = false,
  onSubmitRemark,
  onAttachmentClick,
}) => {
  const count = useMemo(() => attachments?.length ?? 0, [attachments]);

  // ✅ NEW: scroll container ref (for auto-scroll to bottom)
  const timelineRef = useRef<HTMLDivElement | null>(null);

  // ✅ NEW: when opened (or when new items arrive), scroll to bottom
  useEffect(() => {
    if (!isOpen) return;
    const el = timelineRef.current;
    if (!el) return;

    requestAnimationFrame(() => {
      el.scrollTop = el.scrollHeight;
    });
  }, [isOpen, events.length, remarks.length, attachments.length]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[400000] bg-black/50 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-[92vw] max-w-3xl h-[86vh] rounded-xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (bigger + custom X styling) */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="
              group w-9 h-9 rounded-full bg-transparent
              flex items-center justify-center
              hover:bg-red-700 transition-colors
              outline-none focus:outline-none focus:ring-0 focus:ring-offset-0
              focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0
            "
          >
            <X size={18} className="text-black group-hover:text-white" />
          </button>
        </div>

        {/* Attachments strip (slightly larger text) */}
        <div className="px-4 pt-3 pb-2 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <p className="text-base font-semibold text-gray-700">Attachments</p>
            <p className="text-sm text-gray-400">{count > 0 ? count : ""}</p>
          </div>

          {count === 0 ? (
            <p className="text-sm text-gray-400">No attachments</p>
          ) : (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {attachments.map((att) => {
                const isImage = !!att.File_type?.startsWith("image/");
                return (
                  <button
                    key={`att_strip_${att.Attachment_Id}`}
                    type="button"
                    onClick={() => onAttachmentClick?.(att)}
                    className="w-16 h-16 rounded-md border border-gray-200 bg-gray-50 overflow-hidden flex-shrink-0 hover:border-[#355842] transition-colors"
                    title={att.File_name}
                  >
                    {isImage ? (
                      <img
                        src={att.File_path}
                        alt={att.File_name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center">
                        <FileIcon className="text-gray-400" size={20} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Timeline */}
        <div ref={timelineRef} className="flex-1 min-h-0 overflow-y-auto p-4">
          <MaintenanceEventLog
            events={events}
            remarks={remarks}
            attachments={attachments}
            currentUserId={currentUserId}
            loading={loading}
            onAttachmentClick={onAttachmentClick}
            uiSize="large" // ✅ NEW
          />
        </div>

        {/* Input area (bottom) */}
        {canAddRemarks && onSubmitRemark && (
          <div className="border-t border-gray-200 p-4 bg-white">
            <RemarksForm onSubmit={onSubmitRemark} disabled={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default RemarksMaxModal;