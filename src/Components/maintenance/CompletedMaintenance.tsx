import { useMemo } from "react";
import Table from "../common/Table";
import { useCompletedMaintenance } from "../../hooks/maintenance/useCompletedMaintenance";

export const CompletedMaintenance: React.FC = () => {
  const { tickets, loading, error } = useCompletedMaintenance();

  const columns = useMemo(
    () => [
      { key: "Title", label: "Title" },
      {
        key: "PriorityName",
        label: "Priority",
        render: (_: any, row) =>
          row.PriorityName ?? row.Priority ?? row.Priority_Id ?? "—",
      },
      {
        key: "created_at",
        label: "Date Requested",
        render: (value: string | undefined) =>
          value ? new Date(value).toLocaleDateString() : "—",
      },
      {
        key: "updated_at",
        label: "Date Completed",
        render: (value: string | undefined) =>
          value ? new Date(value).toLocaleDateString() : "—",
      },
    ],
    []
  );

  return (
    <div className="space-y-3">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <Table
        columns={columns}
        data={tickets}
        emptyMessage={loading ? "Loading..." : "No completed maintenance found"}
      />
    </div>
  );
};