import { useMemo, useState } from "react";
import Table from "../common/Table";
import { useRequestMaintenance } from "../../hooks/maintenance/useRequestMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";

interface RequestMaintenanceProps {
  onOpenForm: (mode: 'assign', ticket: MaintenanceTicket) => void;
}

export const RequestMaintenance: React.FC<RequestMaintenanceProps> = ({ 
  onOpenForm 
}) => {
  const { tickets, loading, error, refetch } = useRequestMaintenance(); // ✅ include refetch
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const columns = useMemo(
    () => [
      { 
        key: "Title", 
        label: "Title"
      },
      {
        key: "Priority",
        label: "Priority",
        render: (value: any) => value ?? "—",
      },
      {
        key: "Status",
        label: "Status",
        render: (_: any, row: MaintenanceTicket) => row.Status ?? "—",
      },
      {
        key: "Request_date",
        label: "Date Created",
        render: (value: any) =>
          value ? new Date(value).toLocaleString() : "—",
      },
      {
        key: "Due_date",
        label: "Due Date",
        render: (value: any) =>
          value ? new Date(value).toLocaleDateString() : "—",
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
                onClick={async () => {
                  if (!requestId) return;

                  const ok = window.confirm(
                    `Delete this request?\n\nThis will remove the request and its remarks/attachments from the database.`
                  );
                  if (!ok) return;

                  try {
                    setDeletingId(requestId);

                    const user = localStorage.getItem("user");
                    const userData = user ? JSON.parse(user) : {};
                    const actorId = userData.Account_id ?? userData.account_id;

                    if (!actorId) throw new Error("actor_account_id not found");

                    await maintenanceService.deleteTicket(requestId, actorId);
                    await refetch();
                  } catch (e: any) {
                    alert(e?.response?.data?.message || e?.message || "Failed to delete request");
                  } finally {
                    setDeletingId(null);
                  }
                }}
                disabled={!requestId || deletingId === requestId}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deletingId === requestId ? "Deleting..." : "Delete"}
              </button>
            </div>
          );
        },
      },
    ],
    [onOpenForm, refetch, deletingId]
  );

  return (
    <div className="space-y-4 p-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Table
        columns={columns}
        data={tickets}
        emptyMessage={loading ? "Loading..." : "No maintenance requests found"}
      />
    </div>
  );
};