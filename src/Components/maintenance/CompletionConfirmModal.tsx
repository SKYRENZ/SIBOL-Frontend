import React from 'react';
import ConfirmationModal from '../common/ConfirmationModal';

interface CompletionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

const CompletionConfirmModal: React.FC<CompletionConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      isLoading={isLoading}
      title="Mark as Complete?"
      description="Are you sure you want to mark this maintenance request as completed? This action cannot be undone."
      confirmText="Confirm"
      cancelText="Cancel"
      variant="success"
    />
  );
};

export default CompletionConfirmModal;