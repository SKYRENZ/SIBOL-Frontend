import { useMemo } from "react";
import Table from "../common/Table";
import { useCompletedMaintenance } from "../../hooks/maintenance/useCompletedMaintenance";
import type { MaintenanceTicket } from "../../types/maintenance";

interface CompletedMaintenanceProps {
  onOpenForm: (mode: "completed", ticket: MaintenanceTicket) => void; // ✅ Changed from "pending" to "completed"
  searchTerm: string;
  selectedFilters: string[];
}

export const CompletedMaintenance: React.FC<CompletedMaintenanceProps> = ({
  onOpenForm,
  searchTerm,
  selectedFilters,
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
            onClick={() => onOpenForm("completed", row)} // ✅ Changed from "pending" to "completed"
            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36]"
          >
            View Details
          </button>
        ),
      },
    ],
    [onOpenForm]
  );

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
        emptyMessage={loading ? "Loading..." : "No completed maintenance found"}
      />
    </div>
  );
};