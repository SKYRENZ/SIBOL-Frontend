import React from "react";
import type { MaintenanceTicket } from "../../types/maintenance";
import { Calendar, Clock, CheckCircle, User } from "lucide-react";

interface MaintenanceCardProps {
  ticket: MaintenanceTicket;
  mode: 'request' | 'pending' | 'completed';
  onViewDetails?: (ticket: MaintenanceTicket) => void;
  onDelete?: (ticket: MaintenanceTicket) => void;
  onComplete?: (ticket: MaintenanceTicket) => void;
  onCancel?: (ticket: MaintenanceTicket) => void;
  isDeleting?: boolean;
}

export const MaintenanceCard: React.FC<MaintenanceCardProps> = ({
  ticket,
  mode,
  onViewDetails,
  onDelete,
  onComplete,
  onCancel,
  isDeleting = false,
}) => {
  const requestId = ticket.Request_Id ?? ticket.request_id;
  const status = ticket.Status ?? "";
  const isCancelled = status === "Cancelled";
  const isForVerification = status === "For Verification";

  const getPriorityColor = (priority: string | null | undefined) => {
    const p = (priority || '').toLowerCase();
    if (p === 'critical') return 'bg-red-100 text-red-700 border-red-200';
    if (p === 'urgent') return 'bg-orange-100 text-orange-700 border-orange-200';
    if (p === 'mild') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const getStatusColor = (status: string | null | undefined) => {
    const s = (status || '').toLowerCase();
    if (s === 'on-going') return 'bg-blue-100 text-blue-700 border-blue-200';
    if (s === 'for verification') return 'bg-green-100 text-green-700 border-green-200';
    if (s === 'cancel requested') return 'bg-red-100 text-red-700 border-red-200';
    return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  const canAcceptOrAssign = status === "Requested" || status === "Cancelled";
  const canDelete = status === "Requested" || status === "Cancelled";

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden">
      {/* Title with Status Badge - Header Section */}
      <div className="bg-gradient-to-r from-[#355842] to-[#4a7c5d] px-5 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
        <h3 className="font-semibold text-gray-900 text-white text-lg flex-1 min-w-0">{ticket.Title}</h3>
        
        {/* Status Badge aligned with title */}
        {mode === 'request' && isCancelled && (
          <span className="inline-block px-2 py-0.5 text-xs font-semibold rounded-full bg-red-100 text-red-700 flex-shrink-0">
            Cancelled
          </span>
        )}

        {mode === 'pending' && (
          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(ticket.Status)} flex-shrink-0`}>
            {ticket.Status ?? "Unknown"}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Priority */}
        <div className="mb-3">
          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getPriorityColor(ticket.Priority)}`}>
            {ticket.Priority ?? "No Priority"}
          </span>
        </div>

        {/* Mode-specific content */}
        {mode === 'request' && (
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span><span className="font-medium">Created:</span> {ticket.Request_date ? new Date(ticket.Request_date).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span><span className="font-medium">Due:</span> {ticket.Due_date ? new Date(ticket.Due_date).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        )}

        {mode === 'pending' && (
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400" />
              <span>
                <span className="font-medium">Assigned to:</span> {ticket.AssignedOperatorName ?? "Unassigned"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={16} className="text-gray-400" />
              <span><span className="font-medium">Due:</span> {ticket.Due_date ? new Date(ticket.Due_date).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        )}

        {mode === 'completed' && (
          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-gray-400" />
              <span><span className="font-medium">Requested:</span> {ticket.Request_date ? new Date(ticket.Request_date).toLocaleDateString() : "—"}</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green-500" />
              <span><span className="font-medium">Completed:</span> {ticket.Completed_at ? new Date(ticket.Completed_at).toLocaleDateString() : "—"}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className={`${mode === 'completed' ? '' : 'flex gap-2'} pt-3 border-t border-gray-100`}>
          {mode === 'request' && (
            <>
              <button
                onClick={() => onViewDetails?.(ticket)}
                disabled={!canAcceptOrAssign}
                className="flex-1 px-3 py-2 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36] disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                View & Accept
              </button>

              {canDelete && (
                <button
                  onClick={() => onDelete?.(ticket)}
                  disabled={!requestId || isDeleting}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Delete
                </button>
              )}
            </>
          )}

          {mode === 'pending' && (
            <>
              <button
                onClick={() => onViewDetails?.(ticket)}
                className="flex-1 px-3 py-2 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36] transition"
              >
                View Details
              </button>

              {isForVerification ? (
                <button
                  onClick={() => onComplete?.(ticket)}
                  className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                >
                  Complete
                </button>
              ) : (
                <button
                  onClick={() => onCancel?.(ticket)}
                  className="px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              )}
            </>
          )}

          {mode === 'completed' && (
            <button
              onClick={() => onViewDetails?.(ticket)}
              className="w-full px-3 py-2 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36] transition"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};