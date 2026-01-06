import React, { useMemo } from "react";
import Table from "../common/Table";
import type { MaintenanceTicket } from "../../types/maintenance";

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
    ],
    []
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[200000]" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-5xl mx-4 overflow-hidden"
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
  );
};

export default DeletedRequestsModal;