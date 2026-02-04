import { useMemo, useState } from "react";
import Table from "../common/Table";
import { useRequestMaintenance } from "../../hooks/maintenance/useRequestMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";
import CancelConfirmModal from "./CancelConfirmModal";
import { useAppSelector } from '../../store/hooks';

interface RequestMaintenanceProps {
  onOpenForm: (mode: 'assign', ticket: MaintenanceTicket) => void;
  searchTerm: string;
  selectedFilters: string[];
}

export const RequestMaintenance: React.FC<RequestMaintenanceProps> = ({
  onOpenForm,
  searchTerm,
  selectedFilters,
}) => {
  const { tickets, loading, error, refetch } = useRequestMaintenance();
  const { user: reduxUser } = useAppSelector(state => state.auth);

  const [selectedTicketForDelete, setSelectedTicketForDelete] = useState<MaintenanceTicket | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const filteredTickets = useMemo(() => {
    let temp = [...tickets];

    if (searchTerm.trim()) {
      const lower = searchTerm.toLowerCase();
      temp = temp.filter((row) =>
        Object.values(row).some((val) =>
          String(val ?? "").toLowerCase().includes(lower)
        )
      );
    }

    if (selectedFilters.length > 0) {
      temp = temp.filter((row) =>
        selectedFilters.every((filter) =>
          Object.values(row).some((val) => String(val) === filter)
        )
      );
    }

    return temp;
  }, [tickets, searchTerm, selectedFilters]);

  return (
    <div>
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Table
        columns={columns}
        data={filteredTickets}
        emptyMessage={loading ? "Loading..." : "No maintenance requests found"}
      />

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