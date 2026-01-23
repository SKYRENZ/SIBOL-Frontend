import React from "react";
import type { MaintenanceTicket } from "../../types/maintenance";
import MaintenanceForm from "./MaintenanceForm";

interface DeletedTicketDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: MaintenanceTicket | null;
}

const DeletedTicketDetailsModal: React.FC<DeletedTicketDetailsModalProps> = ({
  isOpen,
  onClose,
  ticket,
}) => {
  if (!isOpen || !ticket) return null;

  return (
    <MaintenanceForm
      isOpen={isOpen}
      onClose={onClose}
      mode="completed"
      initialData={ticket}
      readOnly={true}
      submitError={null}
      onSubmit={() => {
        // no-op (readOnly)
      }}
    />
  );
};

export default DeletedTicketDetailsModal;