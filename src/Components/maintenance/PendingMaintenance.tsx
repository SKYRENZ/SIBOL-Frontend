import { useMemo, useState } from "react";
import Table from "../common/Table";
import CompletionConfirmModal from "./CompletionConfirmModal";
import CancelConfirmModal from "./CancelConfirmModal";

import { usePendingMaintenance } from "../../hooks/maintenance/usePendingMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";

import { useAppSelector } from '../../store/hooks';

interface PendingMaintenanceProps {
  onOpenForm: (mode: 'pending', ticket: MaintenanceTicket) => void;
}

export const PendingMaintenance: React.FC<PendingMaintenanceProps> = ({ onOpenForm }) => {
  const { tickets, loading, error, refetch } = usePendingMaintenance();
    const { user: reduxUser } = useAppSelector(state => state.auth);

  const [selectedTicketForCompletion, setSelectedTicketForCompletion] = useState<MaintenanceTicket | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ cancel state
  const [selectedTicketForCancel, setSelectedTicketForCancel] = useState<MaintenanceTicket | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const columns = useMemo(
    () => [
      { key: "Title", label: "Title" },
      {
        key: "Priority",
        label: "Priority",
        render: (_: any, row: MaintenanceTicket) => row.Priority ?? "—",
      },
      {
        key: "AssignedOperatorName",
        label: "Assigned Operator",
        render: (_: any, row: MaintenanceTicket) => row.AssignedOperatorName ?? "Unassigned",
      },
      {
        key: "Status",
        label: "Status",
        render: (_: any, row: MaintenanceTicket) => row.Status ?? "—",
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: unknown, row: MaintenanceTicket) => (
          <div className="flex gap-2">
            <button
              onClick={() => onOpenForm('pending', row)}
              className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36]"
            >
              View Details
            </button>

            {/* ✅ If "completed" stage (For Verification), show Complete only */}
            {row.Status === "For Verification" ? (
              <button
                onClick={() => setSelectedTicketForCompletion(row)}
                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Complete
              </button>
            ) : (
              /* ✅ Otherwise, Cancel is default (On-going, Cancel Requested) */
              <button
                onClick={() => setSelectedTicketForCancel(row)}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
              >
                Cancel
              </button>
            )}
          </div>
        ),
      },
    ],
    [onOpenForm]
  );

  const handleCompleteRequest = async () => {
    if (!selectedTicketForCompletion) return;

    const requestId = selectedTicketForCompletion.Request_Id ?? selectedTicketForCompletion.request_id;
    if (!requestId) return;

    try {
      setIsSubmitting(true);

      const staffId = reduxUser?.Account_id ?? reduxUser?.account_id;

      if (staffId) {
        await maintenanceService.verifyCompletion(requestId, staffId);
      }

      setSelectedTicketForCompletion(null);
      await refetch();
    } catch (err: any) {
      console.error("Failed to complete:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedTicketForCancel) return;

    const requestId = selectedTicketForCancel.Request_Id ?? selectedTicketForCancel.request_id;
    if (!requestId) return;

    try {
      setIsCancelling(true);

      const actorId = reduxUser?.Account_id ?? reduxUser?.account_id;
      if (!actorId) throw new Error("actor_account_id not found");

      // ✅ Staff/Admin cancels immediately (no reason required)
      await maintenanceService.cancelTicket(requestId, actorId);

      setSelectedTicketForCancel(null);
      await refetch();
    } catch (err: any) {
      console.error("Failed to cancel:", err);
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="space-y-3 p-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Table
        columns={columns}
        data={tickets}
        emptyMessage={loading ? "Loading..." : "No pending maintenance found"}
      />

      <CompletionConfirmModal
        isOpen={!!selectedTicketForCompletion}
        onClose={() => setSelectedTicketForCompletion(null)}
        onConfirm={handleCompleteRequest}
        isLoading={isSubmitting}
      />

      <CancelConfirmModal
        isOpen={!!selectedTicketForCancel}
        onClose={() => setSelectedTicketForCancel(null)}
        onConfirm={handleCancelRequest}
        isLoading={isCancelling}
        mode="cancel"
      />
    </div>
  );
};