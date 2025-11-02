import { useMemo, useState } from "react";
import Table from "../common/Table";
import MaintenanceForm from "./MaintenanceForm";
import { usePendingMaintenance } from "../../hooks/maintenance/usePendingMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";

export const PendingMaintenance: React.FC = () => {
  const { tickets, loading, error, refetch } = usePendingMaintenance();
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);

  const columns = useMemo(
    () => [
      { key: "Title", label: "Title" },
      { key: "Priority_Id", label: "Priority" },
      {
        key: "Assigned_to",
        label: "Assigned Operator",
        render: (value: number | null | undefined) => value ?? "Unassigned",
      },
      {
        key: "updated_at",
        label: "Last Updated",
        render: (value: string | undefined) =>
          value ? new Date(value).toLocaleString() : "—",
      },
      {
        key: "actions",
        label: "Actions",
        render: (_, row: MaintenanceTicket) => (
          <button
            onClick={() => {
              setSelectedTicket(row);
              setShowForm(true);
            }}
            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36]"
          >
            Assign
          </button>
        ),
      },
    ],
    []
  );

  const handleFormSubmit = async (formData: any) => {
    if (!selectedTicket) return;

    try {
      await maintenanceService.acceptAndAssign(selectedTicket.request_id, formData.staffAccountId, 
        formData.assignedTo ? parseInt(formData.assignedTo) : null);
      
      setShowForm(false);
      setSelectedTicket(null);
      await refetch();
    } catch (err: any) {
      console.error("Failed to assign:", err);
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

      <MaintenanceForm
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleFormSubmit}
        mode="assign"
      />
    </div>
  );
};