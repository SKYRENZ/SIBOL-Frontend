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
  Cancel_reason?: string | null;

  // ✅ NEW: cancel actor display fields (from backend joins)
  CancelRequestedByName?: string | null;
  CancelRequestedByRole?: string | null;     // e.g. "Operator"
  CancelRequestedByRoleId?: number | null;

  CancelledByName?: string | null;
  CancelledByRole?: string | null;           // e.g. "Barangay" / "Admin"
  CancelledByRoleId?: number | null;

  // (optional if you want to use timestamps for bookmark placement)
  Cancel_requested_at?: string | null;
  Cancelled_at?: string | null;
}

export interface MaintenanceTicketPayload {
  title: string;
  details?: string;
  priority?: string;
  created_by: number;
  due_date?: string | null;
}

export interface MaintenanceEvent {
  Event_Id: number;
  Request_Id: number;
  Event_type: string;           // e.g. 'FOR_VERIFICATION'
  Actor_Account_Id?: number | null;
  Notes?: string | null;
  Created_At: string;

  ActorName?: string | null;
  ActorRoleId?: number | null;
  ActorRoleName?: string | null;
}