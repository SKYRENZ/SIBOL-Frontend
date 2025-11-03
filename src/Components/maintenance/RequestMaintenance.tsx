import { useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import Table from "../common/Table";
import MaintenanceForm from "./MaintenanceForm";
import { useRequestMaintenance } from "../../hooks/maintenance/useRequestMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicket } from "../../types/maintenance";

interface RequestMaintenanceProps {
  createdByAccountId: number;
}

export const RequestMaintenance: React.FC<RequestMaintenanceProps> = ({ createdByAccountId }) => {
  const { tickets, loading, error, createTicket, refetch } = useRequestMaintenance();
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "assign" | "pending">("create");
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [tablePage, setTablePage] = useState(1);
  const [assignError, setAssignError] = useState(false);

  const columns = useMemo(
    () => [
      { 
        key: "Title", 
        label: "Title"
      },
      {
        key: "PriorityName",
        label: "Priority",
        render: (_: any, row: MaintenanceTicket) =>
          row.PriorityName ?? row.Priority ?? row.Priority_Id ?? "—",
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
            onClick={() => handleOpenAssign(row)}
            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36]"
          >
            View & Accept
          </button>
        ),
      },
    ],
    []
  );

  const handleCreateClick = () => {
    setFormMode('create');
    setSelectedTicket(null);
    setShowForm(true);
  };

  const handleOpenAssign = (ticket: MaintenanceTicket) => {
    setSelectedTicket(ticket);
    setFormMode("assign");
    setShowForm(true);
    setAssignError(false);
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      if (formMode === 'create') {
        const attachmentFolder = formData.file ? `maintenance/${createdByAccountId}` : undefined;

        await createTicket({
          title: formData.title,
          details: formData.issue,
          priority: formData.priority,
          created_by: createdByAccountId,
          due_date: formData.dueDate || null,
          attachment_folder: attachmentFolder,
        }, {
          attachment: formData.file,
          attachmentFolder,
        });
      } else if (formMode === "assign" && selectedTicket) {
        if (!formData.assignedTo) {
          setAssignError(true);
          toast.error("Please select an operator before accepting.");
          return;
        }
        setAssignError(false);
        const assignToId = formData.assignedTo ? parseInt(formData.assignedTo, 10) : null;
        const staffId = parseInt(formData.staffAccountId, 10);
        const requestId = selectedTicket.Request_Id || selectedTicket.request_id;
        
        if (!requestId) throw new Error("Request ID not found");
        
        await maintenanceService.acceptAndAssign(requestId, staffId, assignToId);
      }
      
      setShowForm(false);
      setSelectedTicket(null);
      await refetch();
    } catch (err: any) {
      console.error("Form error:", err);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedTicket(null);
    setAssignError(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={handleCreateClick}
          className="px-4 py-2 bg-[#355842] text-white text-sm rounded-md shadow-sm hover:bg-[#2e4a36] transition"
        >
          New Maintenance Request
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Table
        columns={columns}
        data={tickets}
        emptyMessage={loading ? "Loading..." : "No maintenance requests found"}
      />

      <MaintenanceForm
        isOpen={showForm}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        mode={formMode}
        initialData={selectedTicket}
        highlightAssigned={assignError}
        onAssignedChange={() => setAssignError(false)}
      />
    </div>
  );
};