import apiClient from "./apiClient";
import type { MaintenanceTicket, MaintenanceTicketPayload, MaintenanceAttachment, MaintenanceRemark } from "../types/maintenance";

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
  console.log("Creating ticket with payload:", payload);
  const response = await apiClient.post<MaintenanceTicket>(BASE_URL, payload);
  return response.data;
}

// NEW: Upload file to Cloudinary, then save attachment metadata
export async function uploadAttachment(
  requestId: number,
  uploadedBy: number,
  file: File
): Promise<MaintenanceAttachment> {
  const formData = new FormData();
  formData.append('file', file);

  const uploadResponse = await apiClient.post<{ filepath: string; publicId: string }>(
    '/api/upload',
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  const body = {
    uploaded_by: uploadedBy,
    filepath: uploadResponse.data.filepath,
    filename: file.name,
    filetype: file.type,
    filesize: file.size,
    public_id: uploadResponse.data.publicId, // ✅ add
  };

  const response = await apiClient.post<MaintenanceAttachment>(
    `${BASE_URL}/${requestId}/attachments`,
    body
  );
  return response.data;
}

// NEW: Get all attachments for a ticket
export async function getAttachments(requestId: number): Promise<MaintenanceAttachment[]> {
  const response = await apiClient.get<MaintenanceAttachment[]>(
    `${BASE_URL}/${requestId}/attachments`
  );
  return response.data;
}

// NEW: Get ticket attachments (alternative function name)
export async function getTicketAttachments(requestId: number): Promise<MaintenanceAttachment[]> {
  const response = await apiClient.get<MaintenanceAttachment[]>(`${BASE_URL}/${requestId}/attachments`);
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
  
  console.log("Accept & Assign - Request ID:", requestId, "Body:", body);
  const response = await apiClient.put(`${BASE_URL}/${requestId}/accept`, body);
  return response.data;
}

export async function markOnGoing(requestId: number, operator_account_id: number) {
  const response = await apiClient.put<MaintenanceTicket>(`${BASE_URL}/${requestId}/ongoing`, { operator_account_id });
  return response.data;
}

// ✅ NEW: Add a remark to a ticket
export async function addRemark(
  requestId: number,
  remarkText: string,
  createdBy: number,
  userRole: string
): Promise<MaintenanceRemark> {
  const response = await apiClient.post<MaintenanceRemark>(`/api/maintenance/${requestId}/remarks`, {
    remark_text: remarkText,
    created_by: createdBy,
    user_role: userRole,
  });
  return response.data;
}

// ✅ NEW: Get all remarks for a ticket
export async function getTicketRemarks(requestId: number): Promise<MaintenanceRemark[]> {
  const response = await apiClient.get<MaintenanceRemark[]>(`/api/maintenance/${requestId}/remarks`);
  return response.data;
}

// ✅ Keep the old addRemarks function for backward compatibility if needed
export async function addRemarks(
  requestId: number,
  remarks: string
): Promise<any> {
  console.log("Adding remarks to request:", requestId, "Remarks:", remarks);
  const response = await apiClient.put(`${BASE_URL}/${requestId}/remarks`, { remarks });
  return response.data;
}

export async function markForVerification(
  requestId: number,
  operator_account_id: number
): Promise<any> {
  console.log("Marking for verification:", requestId, "Operator:", operator_account_id);
  const response = await apiClient.put(`${BASE_URL}/${requestId}/mark-for-verification`, { operator_account_id });
  return response.data;
}

export async function verifyCompletion(
  requestId: number,
  staff_account_id: number
): Promise<any> {
  console.log("Verifying completion:", requestId, "Staff:", staff_account_id);
  const response = await apiClient.put(`${BASE_URL}/${requestId}/verify-completion`, { staff_account_id });
  return response.data;
}

export async function cancelTicket(requestId: number, actor_account_id: number) {
  const response = await apiClient.put<MaintenanceTicket>(`${BASE_URL}/${requestId}/cancel`, { actor_account_id });
  return response.data;
}

// NEW: Get all priorities
export async function getPriorities(): Promise<Array<{ Priority_Id: number; Priority: string }>> {
  const response = await apiClient.get<Array<{ Priority_Id: number; Priority: string }>>('/api/maintenance/priorities');
  return response.data;
}

// NEW: Delete a ticket
export async function deleteTicket(
  requestId: number,
  actor_account_id: number
): Promise<{ deleted: boolean }> {
  const response = await apiClient.delete<{ deleted: boolean }>(`${BASE_URL}/${requestId}`, {
    params: { actor_account_id }, // ✅ use query param (no DELETE body typing issues)
  });
  return response.data;
}

// ✅ NEW: List all soft-deleted tickets (backend: GET /api/maintenance/deleted)
export async function listDeletedTickets(): Promise<MaintenanceTicket[]> {
  const response = await apiClient.get<MaintenanceTicket[]>(`${BASE_URL}/deleted`);
  return response.data;
}