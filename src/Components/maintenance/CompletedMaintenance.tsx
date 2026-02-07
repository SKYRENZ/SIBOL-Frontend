import { useMemo } from "react";
import Table from "../common/Table";
import { useCompletedMaintenance } from "../../hooks/maintenance/useCompletedMaintenance";
import type { MaintenanceTicket } from "../../types/maintenance";

interface CompletedMaintenanceProps {
  onOpenForm: (mode: "completed", ticket: MaintenanceTicket) => void;
}

export const CompletedMaintenance: React.FC<CompletedMaintenanceProps> = ({
  onOpenForm,
}) => {
  const { tickets, loading, error } = useCompletedMaintenance();

  const columns = useMemo(
    () => [
      { key: "Title", label: "Title" },
      {
        key: "Priority",
        label: "Priority",
        render: (_: any, row: MaintenanceTicket) => row.Priority ?? "—",
      },
      {
        key: "Request_date",
        label: "Date Requested",
        render: (value: string | undefined) =>
          value ? new Date(value).toLocaleDateString() : "—",
      },
      {
        key: "Completed_at",
        label: "Date Completed",
        render: (value: string | undefined) =>
          value ? new Date(value).toLocaleDateString() : "—",
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: any, row: MaintenanceTicket) => (
          <button
            onClick={() => onOpenForm("completed", row)}
            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36]"
          >
            View Details
          </button>
        ),
      },
    ],
    [onOpenForm]
  );

  return (
    <div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Table
        columns={columns}
        data={tickets}
        emptyMessage={loading ? "Loading..." : "No completed maintenance found"}
        filterTypes={["maintenancePriorities"]}
      />
    </div>
  );
};