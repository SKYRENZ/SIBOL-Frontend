export interface MaintenanceTicket {
  Request_Id?: number;
  request_id?: number;
  Title: string;
  Details: string;
  Priority_Id: number;
  Created_by: number;
  Assigned_to: number | null;
  Request_date: string;
  Due_date?: string | null;
  Main_stat_id: number;
  Attachment?: string | null;
  Remarks?: string;
  
  // Properties from JOINs
  Priority?: string;
  Status?: string;
  AssignedOperatorName?: string; // Add this new property
}

export interface MaintenanceTicketPayload {
  title: string;
  details?: string;
  priority?: string;
  created_by: number;
  due_date?: string | null;
  attachment?: string | null;
}