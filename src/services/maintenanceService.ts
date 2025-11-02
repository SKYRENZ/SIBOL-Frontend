import apiClient from "./apiClient";
import type { MaintenanceTicket, MaintenanceTicketPayload } from "../types/maintenance";

const BASE_URL = "/api/maintenance";

export async function listTickets(params?: {
  status?: string;
  assigned_to?: number;
  created_by?: number;
}): Promise<MaintenanceTicket[]> {
  const query = new URLSearchParams();
  if (params?.status) query.set("status", params.status);
  if (typeof params?.assigned_to === "number") query.set("assigned_to", String(params.assigned_to));
  if (typeof params?.created_by === "number") query.set("created_by", String(params.created_by));

  const url = query.toString() ? `${BASE_URL}?${query.toString()}` : BASE_URL;
  const response = await apiClient.get<MaintenanceTicket[]>(url);
  return response.data;
}

export async function getTicket(id: number): Promise<MaintenanceTicket> {
  const response = await apiClient.get<MaintenanceTicket>(`${BASE_URL}/${id}`);
  return response.data;
}

export async function createTicket(payload: MaintenanceTicketPayload): Promise<MaintenanceTicket> {
  const response = await apiClient.post<MaintenanceTicket>(BASE_URL, payload);
  return response.data;
}

export async function acceptAndAssign(
  requestId: number,
  staffAccountId: number,
  assignToAccountId: number | null
): Promise<any> {
  const body = {
    staff_account_id: staffAccountId,
    assign_to: assignToAccountId,
  };
  
  console.log("Sending body:", body); // Debug
  
  const res = await fetch(`/api/maintenance/${requestId}/accept`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status}: ${text}`);
  }
  return res.json();
}

export async function markOnGoing(requestId: number, operator_account_id: number) {
  const response = await apiClient.put<MaintenanceTicket>(`${BASE_URL}/${requestId}/ongoing`, { operator_account_id });
  return response.data;
}

export async function markForVerification(requestId: number, operator_account_id: number) {
  const response = await apiClient.put<MaintenanceTicket>(`${BASE_URL}/${requestId}/for-verification`, { operator_account_id });
  return response.data;
}

export async function verifyCompletion(requestId: number, staff_account_id: number) {
  const response = await apiClient.put<MaintenanceTicket>(`${BASE_URL}/${requestId}/verify`, { staff_account_id });
  return response.data;
}

export async function cancelTicket(requestId: number, actor_account_id: number) {
  const response = await apiClient.put<MaintenanceTicket>(`${BASE_URL}/${requestId}/cancel`, { actor_account_id });
  return response.data;
}