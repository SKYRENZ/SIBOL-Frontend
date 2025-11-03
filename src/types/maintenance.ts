export interface MaintenanceTicket {
  Request_Id?: number;
  request_id?: number;
  Title?: string;
  title?: string;
  Details?: string | null;
  details?: string | null;
  Priority_Id?: string | number;
  priority?: string | number;
  Status?: string | null;
  status?: string | null;
  Assigned_to?: number | null;
  assigned_to?: number | null;
  Created_by?: number;
  created_by?: number;
  Due_date?: string | null;
  due_date?: string | null;
  Request_date?: string;
  created_at?: string;
  Main_stat_id?: number;
  Remarks?: string | null;
  remarks?: string | null;
  Updated_at?: string;
  updated_at?: string;
}

export interface MaintenanceTicketPayload {
  title: string;
  details?: string;
  priority?: string;
  created_by: number;
  due_date?: string | null;
  attachment?: string | null;
}