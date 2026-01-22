import React, { useEffect, useState, useRef } from "react";
import FormModal from "../common/FormModal";
import * as rewardService from "../../services/rewardService";
import AttachmentsUpload from "../maintenance/attachments/AttachmentsUpload";
import AttachmentsList from "../maintenance/attachments/AttachmentsList";
import AttachmentsViewer from "../maintenance/attachments/AttachmentsViewer";

interface ClaimViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  row: any | null;
  onMarked?: () => void;
}

const formatDate = (v?: string) => (v ? String(v).split("T")[0] : "-----");

const ClaimViewModal: React.FC<ClaimViewModalProps> = ({ isOpen, onClose, row, onMarked }) => {
  const [attachments, setAttachments] = useState<any[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [marking, setMarking] = useState(false);

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
    setSelectedFiles(files);
    // keep input ref so parent can clear it later
    fileInputRef.current = e.currentTarget;
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
      alert("Please add at least one attachment before marking as claimed.");
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

      // rollback uploaded attachments if any
      if (uploadedAttachmentIds.length > 0) {
        try {
          await Promise.all(
            uploadedAttachmentIds.map((id) => rewardService.deleteRewardAttachment(Number(id)).catch(() => {}))
          );
        } catch (ignore) {}
      }

      alert(err?.message || "Failed to mark as claimed");
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
    <FormModal isOpen={!!isOpen} onClose={onClose} title="Claim Details" width="520px">
      {!row ? null : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-xs text-gray-500">Name</div>
              <div className="font-medium">{row.Fullname ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Email</div>
              <div className="font-medium">{row.Email ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Reward</div>
              <div className="font-medium">{row.Item ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Points Used</div>
              <div className="font-medium">{row.Total_points ?? 0}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Code</div>
              <div className="font-medium">{row.Redemption_code ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Status</div>
              <div className="font-medium">{row.Status ?? "—"}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Date Generated</div>
              <div className="font-medium">{formatDate(row.Created_at)}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500">Date Claimed</div>
              <div className="font-medium">{formatDate(row.Redeemed_at)}</div>
            </div>
          </div>

          <div>
            <div className="text-xs text-gray-500 mb-2">Attachments</div>

            {isClaimed ? (
              <div>
                <div className="text-sm text-gray-700 mb-2 font-medium">Uploaded Attachments</div>
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
                label="Upload attachments"
                itemLayout="thumb"
                accept="image/*,.pdf,.doc,.docx"
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
                  {/* show existing attachments (from DB) - only when NOT already shown for claimed */}
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

                  {/* removed manual selectedFiles thumbnail rendering to avoid duplicate previews.
                       AttachmentsUpload already displays selected thumbnails. */}
                </>
              )}
            </div>
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
      )}
    </FormModal>

    <AttachmentsViewer
      attachment={viewerAttachment}
      isOpen={!!viewerAttachment}
      onClose={() => setViewerAttachment(null)}
      onDownload={() => handleDownloadAttachment(viewerAttachment)}
    />
    </>
  );
};

export default ClaimViewModal;