import React, { useEffect, useState, useMemo } from "react";
import FormModal from "../common/FormModal";
import * as adminService from "../../services/adminService";
import type { Account } from "../../types/adminTypes";
import AttachmentsList from "../maintenance/attachments/AttachmentsList";
import AttachmentsViewer from "../maintenance/attachments/AttachmentsViewer";

interface Props {
  pendingId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (a: Account) => void;
  onReject: (a: Account, reason?: string) => void;
}

const PendingAccountModal: React.FC<Props> = ({ pendingId, isOpen, onClose, onApprove, onReject }) => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewerAttachment, setViewerAttachment] = useState<any | null>(null);

  useEffect(() => {
    if (!isOpen || !pendingId) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await adminService.fetchPendingById(Number(pendingId));
        if (!mounted) return;
        setAccount(res?.pendingAccount ?? res?.data ?? res);
      } catch (err: any) {
        setError(err?.message ?? "Failed to load pending account");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [isOpen, pendingId]);

  const attachments = useMemo(() => {
    if (!account) return [];
    // map pending account attachment fields into the MaintenanceAttachment shape expected by AttachmentsList
    const list: any[] = [];
    if (account.AttachmentUrl || account.AttachmentFileName) {
      list.push({
        Attachment_id: account.Attachment_id ?? null,
        File_path: account.AttachmentUrl ?? null,
        File_name: account.AttachmentFileName ?? account.AttachmentFileName ?? "attachment",
        File_type: account.AttachmentFileType ?? account.AttachmentFileType ?? undefined,
        File_size: account.AttachmentFileSize ?? undefined,
      });
    }
    return list;
  }, [account]);

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

  const handleApprove = async () => {
    if (!account) return;
    try {
      await onApprove(account);
      onClose();
    } catch (err: any) {
      alert(err?.message || "Approve failed");
    }
  };

  const handleReject = async () => {
    if (!account) return;
    const reason = prompt("Reason for rejection (optional)", "") ?? undefined;
    if (!confirm("Confirm rejection?")) return;
    try {
      await onReject(account, reason);
      onClose();
    } catch (err: any) {
      alert(err?.message || "Reject failed");
    }
  };

  return (
    <>
      <FormModal isOpen={isOpen} onClose={onClose} title="Pending Account Details" width="720px">
        {loading ? (
          <div className="p-4 text-sm text-gray-600">Loading...</div>
        ) : error ? (
          <div className="p-4 text-sm text-red-600">Error: {error}</div>
        ) : !account ? (
          <div className="p-4 text-sm text-gray-600">No data</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Name</div>
                <div className="font-medium">{`${account.FirstName ?? ""} ${account.LastName ?? ""}`.trim() || "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Email</div>
                <div className="font-medium">{account.Email ?? "-"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Username</div>
                <div className="font-medium">{account.Username ?? "-"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Barangay / Area</div>
                <div className="font-medium">{account.Barangay_Name ?? account.Area_Name ?? "-"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Role</div>
                <div className="font-medium">{account.RoleName ?? account.Roles ?? "-"}</div>
              </div>

              <div>
                <div className="text-xs text-gray-500">Created</div>
                <div className="font-medium">{account.Created_at ? String(account.Created_at).split("T")[0] : "-"}</div>
              </div>
            </div>

            {account.AttachmentUrl || account.AttachmentFileName ? (
              <div>
                <div className="text-xs text-gray-500">Attachment</div>
                <div className="mt-2">
                  <AttachmentsList
                    attachments={attachments}
                    onView={(att) => setViewerAttachment(att)}
                    isReadOnly={true}
                    size="md"
                  />
                </div>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
                Close
              </button>

              <button onClick={handleReject} className="px-3 py-1 text-white text-sm rounded bg-red-600 hover:bg-red-700">
                Reject
              </button>

              <button onClick={handleApprove} className="px-3 py-1 text-white text-sm rounded bg-green-600 hover:bg-green-700">
                Approve
              </button>
            </div>
          </div>
        )}
      </FormModal>

      <AttachmentsViewer
        attachment={viewerAttachment}
        isOpen={!!viewerAttachment}
        onClose={() => setViewerAttachment(null)}
      />
    </>
  );
};

export default PendingAccountModal;