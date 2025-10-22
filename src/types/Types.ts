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
  Pending_id?: number; // Add this for pending accounts
  Barangay_id?: number;
  Barangay_Name?: string;
}