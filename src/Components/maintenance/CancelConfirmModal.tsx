import React from 'react';

type ConfirmMode = 'cancel' | 'delete';

interface CancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;

  mode?: ConfirmMode;

  // ✅ NEW: show operator reason (for Cancel Requested)
  reason?: string | null;
}

const CancelConfirmModal: React.FC<CancelConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  mode = 'cancel',
  reason = null,
}) => {
  if (!isOpen) return null;

  const isDelete = mode === 'delete';

  const title = isDelete ? 'Delete Request?' : 'Cancel Request?';
  const description = isDelete
    ? 'Are you sure you want to delete this maintenance request? This will permanently remove the request and its remarks/attachments.'
    : 'Are you sure you want to cancel this maintenance request? This will set the status to Cancelled.';

  const confirmText = isDelete ? 'Delete' : 'Confirm';

  const trimmedReason = (reason ?? '').trim();
  const showReason = !isDelete && trimmedReason.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>

        <h3 className="text-lg font-semibold text-center mb-2">{title}</h3>
        <p className="text-gray-600 text-center mb-4 text-sm">{description}</p>

        {/* ✅ Show operator reason here (no need to bloat MaintenanceForm) */}
        {showReason && (
          <div className="mb-6 border border-red-200 bg-red-50 rounded-md p-3">
            <p className="text-xs font-semibold text-red-800 mb-1">Operator Reason</p>
            <p className="text-sm text-red-900 whitespace-pre-wrap break-words">{trimmedReason}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Close
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelConfirmModal;