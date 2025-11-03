import { useMemo, useState } from "react";
import Table from "../common/Table";
import MaintenanceForm from "./MaintenanceForm";
import CompletionConfirmModal from "./CompletionConfirmModal";
import { usePendingMaintenance } from "../../hooks/maintenance/usePendingMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";

export const PendingMaintenance: React.FC = () => {
  const { tickets, loading, error, refetch } = usePendingMaintenance();
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [formMode, setFormMode] = useState<'remarks' | 'verification'>('remarks');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const columns = useMemo(
    () => [
      { key: "Title", label: "Title" },
      {
        key: "PriorityName",
        label: "Priority",
        render: (_: any, row: MaintenanceTicket) =>
          row.PriorityName ?? row.Priority ?? row.Priority_Id ?? "—",
      },
      {
        key: "Assigned_to",
        label: "Assigned Operator",
        render: (value: number | null | undefined) => value ?? "Unassigned",
      },
      {
        key: "Status",
        label: "Status",
        render: (value: string | undefined) => value ?? "—",
      },
      {
        key: "actions",
        label: "Actions",
        render: (_, row: MaintenanceTicket) => (
          <button
            onClick={() => {
              setSelectedTicket(row);
              setFormMode('remarks');
            }}
            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36]"
          >
            View Details
          </button>
        ),
      },
    ],
    []
  );

  const handleFormSubmit = async (formData: any) => {
    if (!selectedTicket) return;

    try {
      setIsSubmitting(true);

      if (formMode === 'remarks') {
        // Add remarks if provided
        if (formData.remarks.trim()) {
          await maintenanceService.addRemarks(
            selectedTicket.Request_Id || selectedTicket.request_id,
            formData.remarks
          );
        }

        // Mark for verification if status is On-going
        if (selectedTicket.Status === "On-going") {
          const user = localStorage.getItem('user');
          const userData = user ? JSON.parse(user) : {};
          const operatorId = userData.Account_id ?? userData.account_id;

          await maintenanceService.markForVerification(
            selectedTicket.Request_Id || selectedTicket.request_id,
            operatorId
          );
        }
      }

      await refetch();
      setSelectedTicket(null);
    } catch (err: any) {
      console.error("Failed to submit:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCompleteRequest = async () => {
    if (!selectedTicket) return;

    try {
      setIsSubmitting(true);
      const user = localStorage.getItem('user');
      const userData = user ? JSON.parse(user) : {};
      const staffId = userData.Account_id ?? userData.account_id;

      await maintenanceService.verifyCompletion(
        selectedTicket.Request_Id || selectedTicket.request_id,
        staffId
      );
      setShowCompletionModal(false);
      setSelectedTicket(null);
      await refetch();
    } catch (err: any) {
      console.error("Failed to complete:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Table
        columns={columns}
        data={tickets}
        emptyMessage={loading ? "Loading..." : "No pending maintenance found"}
      />

      {/* Maintenance Form Modal with Pending Mode */}
      <MaintenanceForm
        isOpen={!!selectedTicket && formMode === 'remarks'}
        onClose={() => setSelectedTicket(null)}
        onSubmit={handleFormSubmit}
        mode="pending"
        initialData={selectedTicket}
      />

      {/* Completion Confirmation Modal */}
      <CompletionConfirmModal
        isOpen={showCompletionModal}
        onClose={() => setShowCompletionModal(false)}
        onConfirm={handleCompleteRequest}
        isLoading={isSubmitting}
      />

      {/* Action Buttons Modal - For Mark for Verification and Complete */}
      {selectedTicket && formMode === 'remarks' && (
        <div className="fixed inset-0 flex items-end justify-center pb-4 pointer-events-none">
          <div className="flex gap-3 pointer-events-auto">
            {selectedTicket.Status === "On-going" && (
              <button
                onClick={() => {
                  handleFormSubmit({ remarks: '' });
                }}
                disabled={isSubmitting}
                className="px-6 py-2 text-sm text-white rounded-md hover:opacity-90 disabled:opacity-50 transition"
                style={{ backgroundColor: '#E67E22' }}
              >
                {isSubmitting ? "Processing..." : "Mark for Verification"}
              </button>
            )}

            {selectedTicket.Status === "For Verification" && (
              <button
                onClick={() => setShowCompletionModal(true)}
                className="px-6 py-2 text-sm text-white rounded-md hover:opacity-90"
                style={{ backgroundColor: '#27AE60' }}
              >
                Complete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};