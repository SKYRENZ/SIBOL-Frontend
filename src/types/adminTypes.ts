export interface Account {
  Account_id?: number;
  Username?: string;
  Roles?: number;
  IsActive?: 0 | 1 | boolean;
  Points?: number;
  FirstName?: string;
  LastName?: string;
  Area_id?: number;
  Email?: string;
  Contact?: string | number;
  Pending_id?: number;
  Barangay_id?: number;
  Barangay_Name?: string;
}

export interface Role {
  Roles_id: number;
  Roles: string;
}

export interface Module {
  Module_id: number;
  Module_name: string;
  Path?: string;
}

export interface Barangay {
  Barangay_id: number;
  Barangay_Name: string;
}

export interface PendingAccount {
  Pending_id: number;
  Username?: string;
  FirstName?: string;
  LastName?: string;
  Email?: string;
  Area_id?: number;
  Roles?: number;
  AttachmentUrl?: string;
  AttachmentFileName?: string;
  // ...other fields
}

export interface PendingAccountsResponse {
  success?: boolean;
  pendingAccounts?: PendingAccount[];
  data?: PendingAccount[];
  error?: string; // <-- allow error message
}

export interface AccountsResponse {
  success?: boolean;
  users?: Account[];
  data?: Account[];
  count?: number;
  error?: string; // <-- allow error message
}

export interface SinglePendingResponse {
  success?: boolean;
  pendingAccount?: PendingAccount;
  data?: PendingAccount;
  error?: string; // <-- allow error message
}

export interface ApproveRejectResponse {
  success?: boolean;
  message?: string;
  error?: string; // <-- allow error message
}

export interface GenericListResponse<T> {
  success?: boolean;
  data?: T[];
  count?: number;
  error?: string; // <-- allow error message
}