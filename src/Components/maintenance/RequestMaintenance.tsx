import { useMemo, useState } from "react";
import Table from "../common/Table";
import { useRequestMaintenance } from "../../hooks/maintenance/useRequestMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";
import CancelConfirmModal from "./CancelConfirmModal"; // ✅ add

interface RequestMaintenanceProps {
  onOpenForm: (mode: 'assign', ticket: MaintenanceTicket) => void;
}

export const RequestMaintenance: React.FC<RequestMaintenanceProps> = ({ onOpenForm }) => {
  const { tickets, loading, error, refetch } = useRequestMaintenance();

  const [selectedTicketForDelete, setSelectedTicketForDelete] = useState<MaintenanceTicket | null>(null); // ✅ add
  const [isDeleting, setIsDeleting] = useState(false); // ✅ add

  const columns = useMemo(
    () => [
      { key: "Title", label: "Title" },
      {
        key: "Priority",
        label: "Priority",
        render: (value: any) => value ?? "—",
      },
      {
        key: "Request_date",
        label: "Date Created",
        render: (value: any) => (value ? new Date(value).toLocaleDateString() : "—"),
      },
      {
        key: "Due_date",
        label: "Due Date",
        render: (value: any) => (value ? new Date(value).toLocaleDateString() : "—"),
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: any, row: MaintenanceTicket) => {
          const requestId = row.Request_Id ?? row.request_id;

          return (
            <div className="flex gap-2">
              <button
                onClick={() => onOpenForm('assign', row)}
                className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36]"
              >
                View & Accept
              </button>

              <button
                onClick={() => setSelectedTicketForDelete(row)} // ✅ open modal
                disabled={!requestId || isDeleting}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          );
        },
      },
    ],
    [onOpenForm, isDeleting]
  );

  const handleConfirmDelete = async () => {
    if (!selectedTicketForDelete) return;

    const requestId = selectedTicketForDelete.Request_Id ?? selectedTicketForDelete.request_id;
    if (!requestId) return;

    try {
      setIsDeleting(true);

      const user = localStorage.getItem("user");
      const userData = user ? JSON.parse(user) : {};
      const actorId = userData.Account_id ?? userData.account_id;
      if (!actorId) throw new Error("actor_account_id not found");

      await maintenanceService.deleteTicket(requestId, actorId);
      setSelectedTicketForDelete(null);
      await refetch();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Failed to delete request");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4 p-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Table
        columns={columns}
        data={tickets}
        emptyMessage={loading ? "Loading..." : "No maintenance requests found"}
      />

      {/* ✅ Reused modal for delete */}
      <CancelConfirmModal
        isOpen={!!selectedTicketForDelete}
        onClose={() => setSelectedTicketForDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        mode="delete"
      />
    </div>
  );
};