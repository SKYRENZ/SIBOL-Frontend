import React, { useEffect, useState, useRef } from "react";
import FormModal from "../common/FormModal";
import * as rewardService from "../../services/rewardService";
import AttachmentsUpload from "../maintenance/attachments/AttachmentsUpload";
import AttachmentsList from "../maintenance/attachments/AttachmentsList";
import AttachmentsViewer from "../maintenance/attachments/AttachmentsViewer";
import SnackBar from "../common/SnackBar"; // ✅ add
import CustomScrollbar from "../common/CustomScrollbar"; // ✅ add

interface ClaimViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: any | null;
  onMarked?: () => void;
}

const formatDate = (v?: string) => {
  if (!v) return "-----";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
    // fallback for strings like "YYYY-MM-DD" or "YYYY-MM-DDTHH:MM:SS"
    const iso = String(v).split("T")[0];
    const parts = iso.split("-");
    if (parts.length === 3) {
      const [y, m, day] = parts.map((p) => Number(p));
      const dd = new Date(y, (m || 1) - 1, day || 1);
      if (!Number.isNaN(dd.getTime())) {
        return dd.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
      }
    }
    return String(v);
  }
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
};

const ClaimViewModal: React.FC<ClaimViewModalProps> = ({ isOpen, onClose, row, onMarked }) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [marking, setMarking] = useState(false);

  // ✅ snackbar state
  const [snackKey, setSnackKey] = useState(0);
  const [snack, setSnack] = useState<{ visible: boolean; message: string; type: "error" | "success" | "info" }>({
    visible: false,
    message: "",
    type: "info",
  });
  const showSnack = (message: string, type: "error" | "success" | "info" = "info") => {
    setSnackKey((k) => k + 1);
    setSnack({ visible: true, message, type });
  };
  const dismissSnack = () => setSnack((s) => ({ ...s, visible: false }));

  // selected files (local only, not uploaded until "Mark as Claimed")
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [viewerAttachment, setViewerAttachment] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const isClaimed = Boolean(row?.Status === "Claimed");

  useEffect(() => {
    if (isOpen && row) fetchAttachments();
    if (!isOpen) {
      setAttachments([]);
      setSelectedFiles([]);
      setViewerAttachment(null);
      setUploading(false);
      setMarking(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, row]);

  const fetchAttachments = async () => {
    if (!row) return;
    setLoadingAttachments(true);
    try {
      const list = await rewardService.listRewardAttachments(Number(row.Reward_transaction_id ?? row.Transaction_id));
      setAttachments(list || []);
    } catch (e) {
      console.error("fetch attachments", e);
      setAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  // onChange: only store selected files locally (no upload)
  const handleLocalFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const MAX = 5 * 1024 * 1024;
    const valid = files.filter((f) => /image\/(jpeg|png)/i.test(f.type) && f.size <= MAX);

    if (valid.length !== files.length) {
      showSnack("Only JPEG/PNG images up to 5MB are allowed.", "error"); // ✅ replaced alert
    }

    setSelectedFiles(valid);
    fileInputRef.current = e.currentTarget;
    e.currentTarget.value = "";
  };

  const handleRemoveLocal = (index: number) => {
    const copy = [...selectedFiles];
    copy.splice(index, 1);
    setSelectedFiles(copy);
    if (fileInputRef.current && copy.length === 0) fileInputRef.current.value = "";
  };

  const handleDownloadAttachment = (attachment: any) => {
    if (!attachment?.File_path) return;
    const a = document.createElement("a");
    a.href = attachment.File_path;
    a.download = attachment.File_name ?? "";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // upload selectedFiles, then mark transaction redeemed. If mark fails, delete uploaded attachments.
  const handleMarkAsClaimed = async () => {
    if (!row) return;
    if ((attachments?.length ?? 0) === 0 && selectedFiles.length === 0) {
      showSnack("Please add at least one attachment before marking as claimed.", "error"); // ✅ replaced alert
      return;
    }

    setMarking(true);
    setUploading(true);
    const txId = Number(row.Reward_transaction_id ?? row.Transaction_id);
    const uploadedAttachmentIds: number[] = [];

    try {
      // upload local files first (if any)
      for (const f of selectedFiles) {
        const att = await rewardService.uploadClaimedRewardAttachment(f, txId);
        if (att && att.Attachment_id) uploadedAttachmentIds.push(Number(att.Attachment_id));
      }

      // after uploads, call mark redeemed
      await rewardService.markTransactionRedeemed(txId);

      // success: notify parent, close
      onMarked?.();
      onClose();
    } catch (err: any) {
      console.error("mark redeemed error", err);

      if (uploadedAttachmentIds.length > 0) {
        try {
          await Promise.all(
            uploadedAttachmentIds.map((id) => rewardService.deleteRewardAttachment(Number(id)).catch(() => {}))
          );
        } catch {}
      }

      showSnack(err?.message || "Failed to mark as claimed", "error"); // ✅ replaced alert
    } finally {
      setUploading(false);
      setMarking(false);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      // refresh attachments to reflect current DB state
      await fetchAttachments();
    }
  };

  const handleDeleteAttachment = async (id: number) => {
    try {
      await rewardService.deleteRewardAttachment(id);
      await fetchAttachments();
    } catch (err) {
      console.error("delete attachment", err);
    }
  };

  return (
    <>
      <FormModal isOpen={!!isOpen} onClose={onClose} title="Claim Details" width="720px">
        {!row ? null : (
          <CustomScrollbar maxHeight="max-h-[calc(100vh-220px)]" className="pr-6 px-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Name", row.Fullname ?? "—"],
                  ["Email", row.Email ?? "—"],
                  ["Reward", row.Item ?? "—"],
                  ["Points Used", row.Total_points ?? 0],
                  ["Code", row.Redemption_code ?? "—"],
                  ["Status", row.Status ?? "—"],
                  ["Date Generated", formatDate(row.Created_at)],
                  ["Date Claimed", formatDate(row.Redeemed_at)],
                ].map(([label, value]) => {
                  const isStatus = String(label).toLowerCase() === "status";
                  const statusText = String(value ?? "").trim();
                   return (
                     <div key={String(label)}>
                       <div className="text-sm text-gray-700 mb-1 font-semibold">{label}</div>
                       <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 font-normal" style={{ borderRadius: "8px" }}>
                        {isStatus ? (
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${ statusText === "Claimed" ? "bg-[#D9EBD9] text-[#355842]" : "bg-gray-200 text-gray-600" }`}>
                            {statusText || "—"}
                          </span>
                        ) : (
                          value
                        )}
                       </div>
                     </div>
                   );
                 })}
              </div>

              <div>
                {isClaimed ? (
                  <div>
                    <div className="text-sm text-gray-700 mb-2 font-semibold">Uploaded Attachment</div>
                    <AttachmentsList
                      attachments={attachments}
                      onView={(att) => setViewerAttachment(att)}
                      onRemove={() => {}}
                      isReadOnly={true}
                      size="md"
                    />
                  </div>
                ) : (
                  <AttachmentsUpload
                    files={selectedFiles}
                    onChange={handleLocalFilesChange}
                    onRemove={handleRemoveLocal}
                    label="Upload attachment"
                    itemLayout="thumb"
                    accept="image/png,image/jpeg"
                    multiple={true}
                    disabled={uploading || marking}
                  />
                )}

                <div className="mt-3">
                  {loadingAttachments ? (
                    <div className="text-sm text-gray-500">Loading attachments...</div>
                  ) : attachments.length === 0 && selectedFiles.length === 0 ? (
                    <div className="text-sm text-red-600">No attachments yet. Add at least one before marking as claimed.</div>
                  ) : (
                    <>
                      {!isClaimed && attachments.length > 0 && (
                        <>
                          <AttachmentsList
                            attachments={attachments}
                            onView={(att) => setViewerAttachment(att)}
                            onRemove={(index: number) => {
                              handleDeleteAttachment(attachments[index].Attachment_id);
                            }}
                            isReadOnly={false}
                            size="md"
                          />
                          <div className="text-xs text-gray-500 mt-2">Existing attachments. Click a thumbnail to view. Use Delete to remove.</div>
                        </>
                      )}
                    </>
                  )}
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={marking || uploading}
                  >
                    Close
                  </button>

                  <button
                    onClick={handleMarkAsClaimed}
                    disabled={
                      marking ||
                      isClaimed ||
                      (attachments.length === 0 && selectedFiles.length === 0)
                    }
                    className={`px-3 py-1 text-white text-sm rounded ${
                      isClaimed || (attachments.length === 0 && selectedFiles.length === 0)
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                    }`}
                  >
                    {marking ? "Processing..." : isClaimed ? "Already Claimed" : "Mark as Claimed"}
                  </button>
                </div>
              </div>
            </div>
          </CustomScrollbar>
        )}
      </FormModal>

      <AttachmentsViewer
        attachment={viewerAttachment}
        isOpen={!!viewerAttachment}
        onClose={() => setViewerAttachment(null)}
        onDownload={() => handleDownloadAttachment(viewerAttachment)}
      />

      <SnackBar
        key={snackKey}
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={dismissSnack}
      />
    </>
  );
};

export default ClaimViewModal;