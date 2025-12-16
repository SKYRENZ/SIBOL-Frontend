export interface MaintenanceAttachment {
  Attachment_Id: number;
  Request_Id: number;
  File_path: string;
  File_name: string;
  File_type?: string;
  File_size?: number;
  Uploaded_by: number;
  Uploaded_at: string;
  UploaderName?: string;
  UploaderRole?: number;
}

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
  Remarks?: string;
  Completed_at?: string; // Add this for completed tickets
  
  // Properties from JOINs
  Priority?: string;
  Status?: string;
  AssignedOperatorName?: string;
  AttachmentCount?: number; // For list view
  Attachments?: MaintenanceAttachment[]; // For detail view - CHANGED from single Attachment
}

export interface MaintenanceTicketPayload {
  title: string;
  details?: string;
  priority?: string;
  created_by: number;
  due_date?: string | null;
  // Remove attachment from here - will be uploaded separately
}