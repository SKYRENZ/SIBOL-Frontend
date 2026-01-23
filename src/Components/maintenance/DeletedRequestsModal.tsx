import React, { useMemo, useState } from "react";
import Table from "../common/Table";
import type { MaintenanceTicket } from "../../types/maintenance";
import DeletedTicketDetailsModal from "./DeletedTicketDetailsModal"; // ✅ NEW

interface DeletedRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: MaintenanceTicket[];
  loading?: boolean;
  error?: string | null;
}

const DeletedRequestsModal: React.FC<DeletedRequestsModalProps> = ({
  isOpen,
  onClose,
  data,
  loading = false,
  error = null,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceTicket | null>(null);

  const columns = useMemo(
    () => [
      { key: "Title", label: "Title" },
      {
        key: "Priority",
        label: "Priority",
        render: (_: any, row: MaintenanceTicket) => row.Priority ?? "—",
      },
      {
        key: "Status",
        label: "Status",
        render: (_: any, row: MaintenanceTicket) => row.Status ?? "—",
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
        key: "CreatedByName",
        label: "Created By",
        render: (_: any, row: MaintenanceTicket) => row.CreatedByName ?? "—",
      },
      {
        key: "actions",
        label: "Actions",
        render: (_: any, row: MaintenanceTicket) => (
          <button
            onClick={() => setSelectedTicket(row)}
            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36]"
          >
            View Details
          </button>
        ),
      },
    ],
    []
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200000]" onClick={onClose}>
        <div
          className="bg-white rounded-lg shadow-xl w-full max-w-6xl mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-4 bg-gradient-to-r from-[#355842] to-[#4a7c5d] text-white flex items-center justify-between">
            <h3 className="font-semibold text-lg">Deleted Maintenance Requests</h3>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/10 transition-colors rounded-md px-3 py-1 text-sm"
            >
              Close
            </button>
          </div>

          <div className="p-4">
            {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

            <div className="max-h-[70vh] overflow-y-auto">
              <Table
                columns={columns}
                data={data}
                emptyMessage={loading ? "Loading..." : "No deleted requests found"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ✅ NEW: Details modal */}
      <DeletedTicketDetailsModal
        isOpen={!!selectedTicket}
        onClose={() => setSelectedTicket(null)}
        ticket={selectedTicket}
      />
    </>
  );
};

export default DeletedRequestsModal;