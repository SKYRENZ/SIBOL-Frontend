import React, { useState } from "react";
import FormModal from "../common/FormModal";

interface ActionConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  showReason?: boolean;
  headerTone?: "default" | "danger";
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void> | void;
  loading?: boolean;
}

const AdminConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen,
  title = "Confirm",
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  showReason = false,
  headerTone = "default",
  onClose,
  onConfirm,
  loading = false,
}) => {
  const [reason, setReason] = useState("");

  const handleConfirm = async () => {
    await onConfirm(showReason ? reason || undefined : undefined);
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title={title} width="520px" headerTone={headerTone}>
      <div className="space-y-4">
        {message && <div className="text-sm text-gray-700">{message}</div>}

        {showReason && (
          <div>
            <label className="block text-xs text-gray-500 mb-1">Reason (optional)</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border rounded px-2 py-2 text-sm"
              rows={4}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            {cancelLabel}
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className={`px-3 py-1 text-white text-sm rounded ${headerTone === "danger" ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}`}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </FormModal>
  );
};

export default AdminConfirmModal;