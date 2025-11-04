import { useMemo } from "react";
import Table from "../common/Table";
import { useRequestMaintenance } from "../../hooks/maintenance/useRequestMaintenance";
import type { MaintenanceTicket } from "../../types/maintenance";

interface RequestMaintenanceProps {
  onOpenForm: (mode: 'assign', ticket: MaintenanceTicket) => void;
}

export const RequestMaintenance: React.FC<RequestMaintenanceProps> = ({ 
  onOpenForm 
}) => {
  const { tickets, loading, error } = useRequestMaintenance();

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
        render: (_: any, row: MaintenanceTicket) => (
          <button
            onClick={() => onOpenForm('assign', row)}
            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36]"
          >
            View & Accept
          </button>
        ),
      },
    ],
    [onOpenForm]
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