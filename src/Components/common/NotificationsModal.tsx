import React from "react";
import FormModal from "./FormModal";
import type { NotificationItem, NotificationType } from "../../services/notificationService";

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  loading: boolean;
  selectedFilter: "all" | NotificationType;
  onFilterChange: (value: "all" | NotificationType) => void;
  onMarkRead: (id: number, type: NotificationType) => void;
  onMarkAllRead: () => void;
}

const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  loading,
  selectedFilter,
  onFilterChange,
  onMarkRead,
  onMarkAllRead,
}) => {
  const emptyLabel = selectedFilter === "all" ? "notifications" : `${selectedFilter} notifications`;

  const eventBadge = (eventType?: string | null) => {
    switch (String(eventType ?? "").toUpperCase()) {
      case "REQUESTED":
        return "text-blue-700 border-blue-600 bg-blue-50/60";
      case "ACCEPTED":
        return "text-teal-700 border-teal-600 bg-teal-50/60";
      case "REASSIGNED":
        return "text-emerald-700 border-emerald-600 bg-emerald-50/60";
      case "FOR_VERIFICATION":
        return "text-purple-700 border-purple-600 bg-purple-50/60";
      case "CANCEL_REQUESTED":
        return "text-orange-700 border-orange-600 bg-orange-50/60";
      case "CANCELLED":
        return "text-red-700 border-red-600 bg-red-50/60";
      case "COMPLETED":
        return "text-green-700 border-green-600 bg-green-50/60";
      case "WASTE_INPUT":
        return "text-emerald-700 border-emerald-600 bg-emerald-50/60";
      case "COLLECTION":
        return "text-teal-700 border-teal-600 bg-teal-50/60";
      case "REGISTERED":
        return "text-blue-700 border-blue-600 bg-blue-50/60";
      case "APPROVED":
        return "text-green-700 border-green-600 bg-green-50/60";
      case "REJECTED":
        return "text-red-700 border-red-600 bg-red-50/60";
      case "DELETED":
        return "text-gray-700 border-gray-500 bg-gray-50/60";
      default:
        return "text-[#2E523A] border-[#355842] bg-[#355842]/5";
    }
  };

  const priorityBadge = (priority?: string | null) => {
    const p = String(priority ?? "").toLowerCase();
    if (p.includes("critical")) return "text-red-700 border-red-600 bg-red-50/60";
    if (p.includes("urgent")) return "text-orange-700 border-orange-600 bg-orange-50/60";
    if (p.includes("mild")) return "text-amber-700 border-amber-600 bg-amber-50/60";
    return "text-gray-700 border-gray-500 bg-gray-50/60";
  };

  const statusBadge = (status?: string | null) => {
    const s = String(status ?? "").toLowerCase();
    if (s.includes("on-going") || s.includes("ongoing")) return "text-teal-700 border-teal-600 bg-teal-50/60";
    if (s.includes("completed")) return "text-green-700 border-green-600 bg-green-50/60";
    if (s.includes("cancel")) return "text-red-700 border-red-600 bg-red-50/60";
    if (s.includes("requested")) return "text-blue-700 border-blue-600 bg-blue-50/60";
    return "text-gray-700 border-gray-500 bg-gray-50/60";
  };

  return (
    <FormModal isOpen={isOpen} onClose={onClose} title="Notifications" width="760px">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <select
            value={selectedFilter}
            onChange={(e) => onFilterChange(e.target.value as "all" | NotificationType)}
            className="block appearance-none bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Notifications</option>
            <option value="maintenance">Maintenance</option>
            <option value="waste-input">Waste Input</option>
            <option value="collection">Collections</option>
            <option value="system">System</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
              <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={onMarkAllRead}
          className="text-sm font-semibold text-[#2E523A] hover:text-[#1F3527]"
        >
          Mark all as read
        </button>
      </div>

      <div className="mt-4 rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center p-12">
            <h3 className="text-sm font-medium text-gray-900">No notifications</h3>
            <p className="mt-1 text-sm text-gray-500">You don&apos;t have any {emptyLabel} yet.</p>
          </div>
        ) : (
          <ul className="space-y-3 max-h-[420px] overflow-y-auto">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={`rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer ${!notification.read ? "bg-blue-50" : "bg-white"}`}
                onClick={() => onMarkRead(notification.id, notification.type)}
              >
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-start">
                    <div className="ml-1 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-[#2E523A]">
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 ml-2 whitespace-nowrap">
                          {notification.timestamp}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {notification.priority && (
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${priorityBadge(notification.priority)}`}>
                            {notification.priority}
                          </span>
                        )}
                        {notification.status && (
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${statusBadge(notification.status)}`}>
                            {notification.status}
                          </span>
                        )}
                        {notification.eventType && (
                          <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] ${eventBadge(notification.eventType)}`}>
                            {notification.eventType}
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm text-gray-600">{notification.message}</p>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </FormModal>
  );
};

export default NotificationsModal;
