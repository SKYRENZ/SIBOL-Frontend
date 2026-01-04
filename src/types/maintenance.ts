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

  // ✅ NEW
  Public_id?: string | null;
}

export interface MaintenanceRemark {
  Remark_Id: number;
  Request_Id: number;
  Remark_text: string;
  Created_by: number;
  User_role?: string;
  Created_at: string;
  CreatedByName?: string;
  CreatedByRoleName?: string;
}

export interface MaintenanceTicket {
  Request_Id?: number;
  request_id?: number;
  Title: string;
  Details?: string;
  Priority?: string;
  Priority_Id?: number;
  Status?: string;
  Main_stat_id?: number;
  Created_by: number;
  Assigned_to?: number;
  Due_date?: string;
  Request_date?: string;
  Completed_at?: string;
  Remarks?: string; // Legacy field
  AssignedOperatorName?: string;
  CreatedByName?: string;
  CreatorRole?: number;
  AttachmentCount?: number;
  Attachments?: MaintenanceAttachment[];
  RemarksHistory?: MaintenanceRemark[]; // ✅ NEW: Array of remarks
  Cancel_reason?: string | null; // ✅ add
}

export interface MaintenanceTicketPayload {
  title: string;
  details?: string;
  priority?: string;
  created_by: number;
  due_date?: string | null;
}