import { useMemo, useState } from "react";
import Table from "../common/Table";
import { useRequestMaintenance } from "../../hooks/maintenance/useRequestMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";
import CancelConfirmModal from "./CancelConfirmModal";
import DeletedRequestsModal from "./DeletedRequestsModal";
import { useAppSelector } from '../../store/hooks';
import { Trash2 } from "lucide-react";

interface RequestMaintenanceProps {
  onOpenForm: (mode: 'assign', ticket: MaintenanceTicket) => void;
  onOpenCreateForm: () => void;
}

export const RequestMaintenance: React.FC<RequestMaintenanceProps> = ({
  onOpenForm,
  onOpenCreateForm,
}) => {
  const { tickets, loading, error, refetch } = useRequestMaintenance();
  const { user: reduxUser } = useAppSelector(state => state.auth);

  const [selectedTicketForDelete, setSelectedTicketForDelete] = useState<MaintenanceTicket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ NEW: deleted requests modal state
  const [isDeletedModalOpen, setIsDeletedModalOpen] = useState(false);
  const [deletedTickets, setDeletedTickets] = useState<MaintenanceTicket[]>([]);
  const [loadingDeleted, setLoadingDeleted] = useState(false);
  const [deletedError, setDeletedError] = useState<string | null>(null);

  const columns = useMemo(
    () => [
      {
        key: "Title",
        label: "Title",
        render: (_: any, row: MaintenanceTicket) => {
          const status = row.Status ?? "";
          const isCancelled = status === "Cancelled";

          return (
            <div className="flex items-center gap-2">
              <span>{row.Title}</span>
              {isCancelled && (
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-red-100 text-red-700">
                  Cancelled
                </span>
              )}
            </div>
          );
        },
      },
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
          const status = row.Status ?? "";

          const canAcceptOrAssign = status === "Requested" || status === "Cancelled";
          const canDelete = status === "Requested" || status === "Cancelled";

          return (
            <div className="flex gap-2">
              <button
                onClick={() => onOpenForm('assign', row)}
                disabled={!canAcceptOrAssign}
                className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36] disabled:opacity-50"
              >
                View & Accept
              </button>

              {canDelete && (
                <button
                  onClick={() => setSelectedTicketForDelete(row)}
                  disabled={!requestId || isDeleting}
                  className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [onOpenForm, isDeleting]
  );

  const handleConfirmDelete = async (reason?: string) => {
    if (!selectedTicketForDelete) return;

    const requestId = selectedTicketForDelete.Request_Id ?? selectedTicketForDelete.request_id;
    if (!requestId) return;

    const trimmed = (reason ?? "").trim();
    if (!trimmed) {
      alert("Reason is required.");
      return;
    }

    try {
      setIsDeleting(true);

      const actorId = reduxUser?.Account_id ?? reduxUser?.account_id;
      if (!actorId) throw new Error("actor_account_id not found");

      await maintenanceService.deleteTicket(requestId, actorId, trimmed);
      setSelectedTicketForDelete(null);
      await refetch();
    } catch (e: any) {
      alert(e?.response?.data?.message || e?.message || "Failed to delete request");
    } finally {
      setIsDeleting(false);
    }
  };

  const openDeletedModal = async () => {
    setIsDeletedModalOpen(true);
    setLoadingDeleted(true);
    setDeletedError(null);
    try {
      const rows = await maintenanceService.listDeletedTickets();
      setDeletedTickets(Array.isArray(rows) ? rows : []);
    } catch (err: any) {
      setDeletedTickets([]);
      setDeletedError(err?.response?.data?.message || err?.message || "Failed to load deleted requests");
    } finally {
      setLoadingDeleted(false);
    }
  };

  const closeDeletedModal = () => {
    setIsDeletedModalOpen(false);
  };

  // Custom toolbar with buttons
  const customToolbar = (
    <div className="flex gap-3">
      <button
        onClick={onOpenCreateForm}
        className="px-4 py-2 bg-[#355842] text-white text-sm rounded-md shadow-sm hover:bg-[#2e4a36] transition whitespace-nowrap"
      >
        New Maintenance Request
      </button>
      
      <button
        type="button"
        onClick={openDeletedModal}
        className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition"
        title="View deleted requests"
        aria-label="View deleted requests"
      >
        <Trash2 size={18} className="text-gray-700" />
      </button>
    </div>
  );

  return (
    <div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Table
        columns={columns}
        data={tickets}
        emptyMessage={loading ? "Loading..." : "No maintenance requests found"}
        filterTypes={["maintenancePriorities"]}
        customToolbar={customToolbar}
      />

      <CancelConfirmModal
        isOpen={!!selectedTicketForDelete}
        onClose={() => setSelectedTicketForDelete(null)}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        mode="delete"
      />

      <DeletedRequestsModal
        isOpen={isDeletedModalOpen}
        onClose={closeDeletedModal}
        data={deletedTickets}
        loading={loadingDeleted}
        error={deletedError}
      />
    </div>
  );
};