import React, { useEffect, useMemo, useState } from 'react';
import ConfirmationModal from '../common/ConfirmationModal';

type ConfirmMode = 'cancel' | 'delete';

interface CancelConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;

  // allow passing delete reason back
  onConfirm: (reason?: string) => Promise<void>;

  isLoading?: boolean;
  mode?: ConfirmMode;

  // show operator reason (optional display)
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
  const [deleteReason, setDeleteReason] = useState('');

  useEffect(() => {
    if (isOpen) setDeleteReason('');
  }, [isOpen]);

  const isDelete = mode === 'delete';

  const title = isDelete ? 'Delete Request?' : 'Cancel Request?';

  const description = isDelete
    ? 'Please provide a reason for deleting this maintenance request. This will hide it from the main list.'
    : 'Are you sure you want to cancel this maintenance request? This will set the status to Cancelled.';

  const confirmText = isDelete ? 'Delete' : 'Confirm';

  const deleteReasonTrimmed = useMemo(() => deleteReason.trim(), [deleteReason]);

  const confirmDisabled = isDelete ? deleteReasonTrimmed.length === 0 : false;

  const handleConfirm = async () => {
    await onConfirm(isDelete ? deleteReasonTrimmed : undefined);
  };

  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      isLoading={isLoading}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText="Close"
      variant="danger"
      confirmDisabled={confirmDisabled}
    >
      {isDelete ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
          <textarea
            value={deleteReason}
            onChange={(e) => setDeleteReason(e.target.value)}
            rows={3}
            placeholder="Type the reason for deleting..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#355842] focus:border-transparent"
            disabled={isLoading}
          />
          {deleteReasonTrimmed.length === 0 ? <p className="text-xs text-red-600 mt-1">Reason is required.</p> : null}
        </div>
      ) : reason ? (
        <div className="text-sm bg-gray-50 border border-gray-200 rounded-md p-3">
          <p className="font-medium text-gray-700 mb-1">Reason</p>
          <p className="text-gray-600 whitespace-pre-wrap">{reason}</p>
        </div>
      ) : null}
    </ConfirmationModal>
  );
};

export default CancelConfirmModal;