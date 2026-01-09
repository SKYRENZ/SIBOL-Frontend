import React, { useMemo } from "react";
import type {
  MaintenanceAttachment,
  MaintenanceEvent,
  MaintenanceRemark,
} from "../../../types/maintenance";

type TimelineItem =
  | {
      kind: "event";
      key: string;
      createdAt: string;
      eventType: string;
      actorName: string;
      notes: string | null;
      event: MaintenanceEvent;
    }
  | {
      kind: "remark";
      key: string;
      createdAt: string;
      isCurrentUser: boolean;
      authorName: string;
      text: string;
      eventId?: number;
    }
  | {
      kind: "attachment";
      key: string;
      createdAt: string;
      isCurrentUser: boolean;
      authorName: string;
      attachment: MaintenanceAttachment;
      isImage: boolean;
      eventId?: number;
    };

export interface MaintenanceEventLogProps {
  events: MaintenanceEvent[];
  remarks: MaintenanceRemark[];
  attachments: MaintenanceAttachment[];
  currentUserId: number | null;
  loading?: boolean;
  emptyText?: string;
  onAttachmentClick?: (attachment: MaintenanceAttachment) => void;
}

const formatRelativeTime = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const getEventLabel = (eventType: string, actorName: string | null, notes: string | null): string => {
  const actor = actorName || "Unknown";

  switch (eventType) {
    case "REQUESTED":
      return `Requested by ${actor}`;
    case "ACCEPTED":
      return `Accepted by ${actor}${notes ? ` — ${notes}` : ""}`;
    case "REASSIGNED":
      return `Reassigned by ${actor}${notes ? ` — ${notes}` : ""}`;
    case "FOR_VERIFICATION":
      return `Marked for Verification by ${actor}`;
    case "CANCEL_REQUESTED":
      return `Cancel Requested by ${actor}${notes ? ` — Reason: ${notes}` : ""}`;
    case "CANCELLED":
      return `Cancelled by ${actor}${notes ? ` — ${notes}` : ""}`;
    case "COMPLETED":
      return `Completed by ${actor}`;
    case "DELETED":
      return `Deleted by ${actor}${notes ? ` — ${notes}` : ""}`;
    default:
      return `${eventType} by ${actor}`;
  }
};

const MaintenanceEventLog: React.FC<MaintenanceEventLogProps> = ({
  events,
  remarks,
  attachments,
  currentUserId,
  loading = false,
  emptyText = "No activity yet",
  onAttachmentClick,
}) => {
  const timelineItems: TimelineItem[] = useMemo(() => {
    const items: TimelineItem[] = [];
    const me = currentUserId ?? -1;

    // Events as bookmarks (+ nested remarks/attachments if provided by API)
    events.forEach((event) => {
      items.push({
        kind: "event",
        key: `event-${event.Event_Id}`,
        createdAt: event.Created_At,
        eventType: event.Event_type,
        actorName: event.ActorName || "Unknown",
        notes: event.Notes,
        event,
      });

      if (event.Remarks?.length) {
        event.Remarks.forEach((remark) => {
          items.push({
            kind: "remark",
            key: `remark-${remark.Remark_Id}`,
            createdAt: remark.Created_at,
            isCurrentUser: remark.Created_by === me,
            authorName: remark.CreatedByName || "Unknown",
            text: remark.Remark_text,
            eventId: event.Event_Id,
          });
        });
      }

      if (event.Attachments?.length) {
        event.Attachments.forEach((attachment) => {
          const uploadedAt = (attachment as any).Uploaded_at as string | undefined;
          const uploadedBy = (attachment as any).Uploaded_by as number | undefined;
          const uploaderName = (attachment as any).UploaderName as string | undefined;

          items.push({
            kind: "attachment",
            key: `attachment-${attachment.Attachment_Id}`,
            createdAt: uploadedAt || event.Created_At,
            isCurrentUser: uploadedBy === me,
            authorName: uploaderName || "Unknown",
            attachment,
            isImage: !!attachment.File_type?.startsWith("image/"),
            eventId: event.Event_Id,
          });
        });
      }
    });

    // Standalone remarks (if not linked to events)
    remarks.forEach((remark) => {
      const alreadyAdded = items.some(
        (it) => it.kind === "remark" && it.key === `remark-${remark.Remark_Id}`
      );
      if (alreadyAdded) return;

      items.push({
        kind: "remark",
        key: `remark-${remark.Remark_Id}`,
        createdAt: remark.Created_at,
        isCurrentUser: remark.Created_by === me,
        authorName: remark.CreatedByName || "Unknown",
        text: remark.Remark_text,
      });
    });

    // Standalone attachments (if not linked to events)
    attachments.forEach((attachment) => {
      const alreadyAdded = items.some(
        (it) => it.kind === "attachment" && it.key === `attachment-${attachment.Attachment_Id}`
      );
      if (alreadyAdded) return;

      const uploadedAt = (attachment as any).Uploaded_at as string | undefined;
      const uploadedBy = (attachment as any).Uploaded_by as number | undefined;
      const uploaderName = (attachment as any).UploaderName as string | undefined;

      items.push({
        kind: "attachment",
        key: `attachment-${attachment.Attachment_Id}`,
        createdAt: uploadedAt || new Date().toISOString(),
        isCurrentUser: uploadedBy === me,
        authorName: uploaderName || "Unknown",
        attachment,
        isImage: !!attachment.File_type?.startsWith("image/"),
      });
    });

    return items.sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
  }, [events, remarks, attachments, currentUserId]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-500">Loading history...</p>
      </div>
    );
  }

  if (timelineItems.length === 0) {
    return <p className="text-sm text-gray-500 italic text-center py-8">{emptyText}</p>;
  }

  return (
    <div className="space-y-3">
      {timelineItems.map((item) => {
        if (item.kind === "event") {
          return (
            <div key={item.key} className="flex justify-center">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-[#355842]/10 to-[#4a7c5d]/10 border border-[#355842]/20 text-xs font-medium text-[#2E523A]">
                {getEventLabel(item.eventType, item.actorName, item.notes)}
              </div>
            </div>
          );
        }

        return (
          <div
            key={item.key}
            className={`flex ${item.isCurrentUser ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                item.isCurrentUser
                  ? "bg-[#355842] text-white rounded-br-sm"
                  : "bg-gray-100 text-gray-800 rounded-bl-sm"
              }`}
            >
              <div className="flex items-baseline gap-2 mb-1">
                <span
                  className={`text-xs font-semibold ${
                    item.isCurrentUser ? "text-white" : "text-gray-900"
                  }`}
                >
                  {item.authorName}
                </span>
                <span
                  className={`text-xs ${
                    item.isCurrentUser ? "text-white/70" : "text-gray-500"
                  }`}
                >
                  {formatRelativeTime(item.createdAt)}
                </span>
              </div>

              {item.kind === "remark" ? (
                <p className="text-sm whitespace-pre-wrap break-words">{item.text}</p>
              ) : (
                <button
                  type="button"
                  onClick={() => onAttachmentClick?.(item.attachment)}
                  className="block text-left bg-transparent p-0 m-0 border-0"
                >
                  {item.isImage ? (
                    <img
                      src={item.attachment.File_path}
                      alt={item.attachment.File_name}
                      className="w-44 h-44 object-cover rounded-lg border border-black/10"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-44 h-24 rounded-lg border border-black/10 bg-transparent flex items-center justify-center">
                      <span className={`text-sm ${item.isCurrentUser ? "text-white" : "text-gray-700"}`}>
                        Attachment
                      </span>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MaintenanceEventLog;