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