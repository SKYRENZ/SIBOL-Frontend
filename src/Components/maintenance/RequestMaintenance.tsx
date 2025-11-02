import { useMemo, useState, useEffect } from "react";
import Table from "../common/Table";
import FormModal from "../common/FormModal";
import MaintenanceForm from "./MaintenanceForm";
import { useRequestMaintenance } from "../../hooks/maintenance/useRequestMaintenance";
import * as maintenanceService from "../../services/maintenanceService";
import type { MaintenanceTicketPayload, MaintenanceTicket } from "../../types/maintenance";

interface RequestMaintenanceProps {
  createdByAccountId: number;
}

const PRIORITY_OPTIONS = ["Critical", "Urgent", "Mild"];

export const RequestMaintenance: React.FC<RequestMaintenanceProps> = ({ createdByAccountId }) => {
  const { tickets, loading, error, createTicket, refetch } = useRequestMaintenance();
  const [showForm, setShowForm] = useState(false);
  const [showAcceptForm, setShowAcceptForm] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);
  const [form, setForm] = useState<MaintenanceTicketPayload>({
    title: "",
    details: "",
    priority: "",
    due_date: null,
    created_by: createdByAccountId,
  });

  // Update form when createdByAccountId changes
  useEffect(() => {
    setForm((prev) => ({ ...prev, created_by: createdByAccountId }));
  }, [createdByAccountId]);

  const columns = useMemo(
    () => [
      { 
        key: "Title", 
        label: "Title"
      },
      {
        key: "Priority_Id",
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
            onClick={() => {
              setSelectedTicket(row);
              setShowAcceptForm(true);
            }}
            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36]"
          >
            View & Accept
          </button>
        ),
      },
    ],
    []
  );

  const handleCreateSubmit = async () => {
    setFormError(null);
    if (!form.title.trim()) {
      setFormError("Title is required");
      return;
    }
    try {
      await createTicket({ ...form, created_by: createdByAccountId });
      setShowForm(false);
      setForm({
        title: "",
        details: "",
        priority: "",
        due_date: null,
        created_by: createdByAccountId,
      });
    } catch (err: any) {
      setFormError(err.message || "Failed to create request");
    }
  };

  const handleAcceptSubmit = async (formData: any) => {
    if (!selectedTicket) return;
    try {
      const assignToId = formData.assignedTo ? parseInt(formData.assignedTo, 10) : null;
      const staffId = parseInt(formData.staffAccountId, 10);
      
      console.log("Submitting:", {
        requestId: selectedTicket.Request_Id || selectedTicket.request_id,
        staffAccountId: staffId,
        assignToAccountId: assignToId
      });
      
      const requestId = selectedTicket.Request_Id || selectedTicket.request_id;
      if (!requestId) {
        throw new Error("Request ID not found");
      }
      
      await maintenanceService.acceptAndAssign(
        requestId,
        staffId,
        assignToId
      );
      setShowAcceptForm(false);
      setSelectedTicket(null);
      await refetch();
    } catch (err: any) {
      console.error("Failed to accept:", err);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
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

      {/* Create New Request Modal */}
      <FormModal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Request Maintenance"
        subtitle="Provide the details below."
      >
        <div className="space-y-3">
          {formError && <p className="text-sm text-red-600">{formError}</p>}
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Title *</label>
            <input
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#355842] focus:outline-none"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Enter request title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Details</label>
            <textarea
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#355842] focus:outline-none"
              rows={4}
              value={form.details || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, details: e.target.value }))}
              placeholder="Describe the issue"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Priority</label>
            <select
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#355842] focus:outline-none"
              value={form.priority || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, priority: e.target.value }))}
            >
              <option value="">Select priority</option>
              {PRIORITY_OPTIONS.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Due Date</label>
            <input
              type="date"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-[#355842] focus:outline-none"
              value={form.due_date || ""}
              onChange={(e) => setForm((prev) => ({ ...prev, due_date: e.target.value || null }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowForm(false)}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateSubmit}
              className="px-4 py-2 bg-[#355842] text-white text-sm rounded-md hover:bg-[#2e4a36]"
            >
              Submit Request
            </button>
          </div>
        </div>
      </FormModal>

      {/* Accept Request Modal */}
      <MaintenanceForm
        isOpen={showAcceptForm}
        onClose={() => {
          setShowAcceptForm(false);
          setSelectedTicket(null);
        }}
        onSubmit={handleAcceptSubmit}
        mode="assign"
        initialData={selectedTicket}
      />
    </div>
  );
};