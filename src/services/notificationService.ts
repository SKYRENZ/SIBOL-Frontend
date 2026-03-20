import { fetchJson } from "./apiClient";

export type NotificationType = "maintenance" | "waste-input" | "collection" | "system";

export type NotificationItem = {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  timestamp: string;
  read: boolean;
  priority?: string | null;
  status?: string | null;
  eventType?: string | null;
};

export async function getNotifications(params?: {
  type?: NotificationType | "all";
  limit?: number;
  offset?: number;
  unreadOnly?: boolean;
}): Promise<NotificationItem[]> {
  const qs = new URLSearchParams();
  if (params?.type) qs.set("type", params.type);
  if (params?.limit !== undefined) qs.set("limit", String(params.limit));
  if (params?.offset !== undefined) qs.set("offset", String(params.offset));
  if (params?.unreadOnly) qs.set("unreadOnly", "true");

  const url = `/api/notifications${qs.toString() ? `?${qs.toString()}` : ""}`;
  try {
    const res = await fetchJson(url);
    return res?.data ?? [];
  } catch (error: any) {
    if (error?.message === "Request timed out") {
      console.warn("Notifications request timed out; continuing without notifications.");
      return [];
    }
    throw error;
  }
}

export async function markNotificationRead(id: number, type: NotificationType = "maintenance") {
  return fetchJson("/api/notifications/read", {
    method: "POST",
    body: JSON.stringify({ id, type }),
  });
}

export async function markAllNotificationsRead(type: NotificationType = "maintenance") {
  return fetchJson("/api/notifications/read-all", {
    method: "POST",
    body: JSON.stringify({ type }),
  });
}
