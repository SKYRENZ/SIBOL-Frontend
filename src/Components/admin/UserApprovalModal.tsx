import React, { useEffect, useState, useMemo } from "react";
import FormModal from "../common/FormModal";
import AdminConfirmModal from "./AdminConfirmModal";
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

// small date formatter used in this file (same style as ClaimViewModal)
const formatDate = (v?: string) => {
  if (!v) return "-";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) {
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

const PendingAccountModal: React.FC<Props> = ({ pendingId, isOpen, onClose, onApprove, onReject }) => {
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [viewerAttachment, setViewerAttachment] = useState<any | null>(null);

  // confirm modal states
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [rejectReason, setRejectReason] = useState<string>("");
  const [actionLoading, setActionLoading] = useState(false);

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
        // reset reason when loading a pending account
        setRejectReason("");
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
  // prepare labeled fields for display (apply same style as ClaimViewModal)
  const fields: [string, any][] = account
    ? [
        ["Name", `${account.FirstName ?? ""} ${account.LastName ?? ""}`.trim() || "-"],
        ["Email", account.Email ?? "-"],
        ["Username", account.Username ?? "-"],
        ["Barangay / Area", account.Barangay_Name ?? account.Area_Name ?? "-"],
        ["Role", account.RoleName ?? account.Roles ?? "-"],
        ["Created", account.Created_at ? formatDate?.(account.Created_at) ?? String(account.Created_at).split("T")[0] : "-"],
      ]
    : [];

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

  const handleApprove = () => {
    if (!account) return;
    setShowApproveConfirm(true);
  };

  const confirmApprove = async () => {
    if (!account) return;
    try {
      setActionLoading(true);
      await onApprove(account);
      setShowApproveConfirm(false);
      setActionLoading(false);
      onClose();
    } catch (err: any) {
      // minimal UI feedback (modal remains open for retry)
      console.error("approve failed", err);
      alert(err?.message || "Approve failed");
      setActionLoading(false);
    }
  };

  // Reject directly from the main modal — reason must be provided
  const confirmReject = async () => {
    if (!account) return;
    if (!rejectReason || !rejectReason.trim()) {
      return alert("Please provide a reason to reject the account.");
    }
    try {
      setActionLoading(true);
      await onReject(account, rejectReason.trim());
      setActionLoading(false);
      setRejectReason("");
      onClose();
    } catch (err: any) {
      console.error("reject failed", err);
      alert(err?.message || "Reject failed");
      setActionLoading(false);
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
              {fields.map(([label, value]) => (
                <div key={label}>
                  <div className="text-sm text-gray-700 mb-1 font-semibold">{label}</div>
                  <div className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 font-normal" style={{ borderRadius: "8px" }}>
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-sm text-gray-700 mb-1 font-semibold">Attachments</div>
              <div className="rounded-xl border border-gray-200 bg-white px-3 py-3">
                <div className="text-sm text-gray-800 font-normal">
                  <AttachmentsList
                    attachments={attachments}
                    onView={(att) => setViewerAttachment(att)}
                    isReadOnly={true}
                    size="md"
                  />
                </div>
              </div>
            </div>

            {/* Reject reason input (required to enable Reject) */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Rejection Reason (required to reject)</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full border rounded px-2 py-2 text-sm"
                rows={3}
                placeholder="Provide reason for rejecting this account..."
                disabled={actionLoading}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button onClick={onClose} className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
                Close
              </button>

              <button
                onClick={() => setShowRejectConfirm(true)}
                className="px-3 py-1 text-white text-sm rounded bg-red-600 hover:bg-red-700 disabled:opacity-60"
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading ? "Processing..." : "Reject"}
              </button>

              <button
                onClick={handleApprove}
                className="px-3 py-1 text-white text-sm rounded bg-green-600 hover:bg-green-700"
                disabled={actionLoading}
              >
                Approve
              </button>
            </div>
          </div>
        )}
      </FormModal>

      {/* Approve confirmation modal */}
      <AdminConfirmModal
        isOpen={showApproveConfirm}
        onClose={() => setShowApproveConfirm(false)}
        title="Confirm Approval"
        onConfirm={confirmApprove}
        message={
          <div className="space-y-4">
            <div>
              Approve account for{" "}
              <strong>{account ? account.Username ?? account.Email : "this user"}</strong>?
            </div>
          </div>
        }
        loading={actionLoading}
      />

      {/* Reject confirmation modal (requires reason entered in main modal) */}
      <AdminConfirmModal
        isOpen={showRejectConfirm}
        onClose={() => setShowRejectConfirm(false)}
        title="Confirm Rejection"
        onConfirm={async () => {
          // call the same confirmReject handler which validates reason and performs the reject
          await confirmReject();
          setShowRejectConfirm(false);
        }}
        message={
          <div className="space-y-4">
            <div>
              Reject account for{" "}
              <strong>{account ? account.Username ?? account.Email : "this user"}</strong>?
            </div>
            <div className="text-sm text-gray-600">
              Reason: <em>{rejectReason}</em>
            </div>
          </div>
        }
        loading={actionLoading}
      />

      <AttachmentsViewer
        attachment={viewerAttachment}
        isOpen={!!viewerAttachment}
        onClose={() => setViewerAttachment(null)}
      />
    </>
  );
};

export default PendingAccountModal;