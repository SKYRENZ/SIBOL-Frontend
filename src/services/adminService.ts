import api, { fetchJson } from './apiClient';
import {
  Account,
  PendingAccountsResponse,
  PendingAccount,
  AccountsResponse,
  SinglePendingResponse,
  ApproveRejectResponse,
  GenericListResponse,
} from '../types/adminTypes';

// helper to extract array from various backend shapes
function asArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.accounts)) return payload.accounts;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload?.rows?.data && Array.isArray(payload.rows.data)) return payload.rows.data;
  // some responses use pendingAccounts / barangays / roles / modules keys
  if (Array.isArray(payload.pendingAccounts)) return payload.pendingAccounts;
  if (Array.isArray(payload.barangays)) return payload.barangays;
  if (Array.isArray(payload.roles)) return payload.roles;
  if (Array.isArray(payload.modules)) return payload.modules;
  return [];
}

export const fetchAccounts = async (): Promise<Account[]> => {
  const res = await api.get<AccountsResponse>('/api/admin/accounts');
  const payload = res.data ?? {};
  if (payload.success === false) throw new Error(payload.error || 'Failed to fetch accounts');
  return asArray(payload.users ?? payload.data ?? payload) as Account[];
};

export const fetchPendingAccounts = async (): Promise<PendingAccount[]> => {
  const res = await api.get<PendingAccountsResponse>('/api/admin/pending-accounts');
  const payload = res.data ?? {};
  if (payload.success === false) throw new Error(payload.error || 'Failed to fetch pending accounts');
  return asArray(payload.pendingAccounts ?? payload.data ?? payload) as PendingAccount[];
};

export const fetchPendingById = async (pendingId: number): Promise<SinglePendingResponse> => {
  const res = await api.get<SinglePendingResponse>(`/api/admin/pending-accounts/${pendingId}`);
  return res.data ?? {};
};

export const approvePending = async (pendingId: number): Promise<ApproveRejectResponse> => {
  const tries = [
    `/api/admin/pending-accounts/${pendingId}/approve`,
    `/admin/pending-accounts/${pendingId}/approve`,
    `/api/pending-accounts/${pendingId}/approve`,
    `/pending-accounts/${pendingId}/approve`,
  ];
  for (const path of tries) {
    try {
      const res = await api.post<ApproveRejectResponse>(path);
      return res.data ?? {};
    } catch (err) {
      // try next
    }
  }
  throw new Error(`approvePending: no endpoint available for pendingId=${pendingId}`);
};

export const rejectPending = async (pendingId: number, reason?: string): Promise<ApproveRejectResponse> => {
  const tries = [
    `/api/admin/pending-accounts/${pendingId}/reject`,
    `/admin/pending-accounts/${pendingId}/reject`,
    `/api/pending-accounts/${pendingId}/reject`,
    `/pending-accounts/${pendingId}/reject`,
  ];
  for (const path of tries) {
    try {
      const res = await api.post<ApproveRejectResponse>(path, { reason });
      return res.data ?? {};
    } catch (err) {
      // try next
    }
  }
  throw new Error(`rejectPending: no endpoint available for pendingId=${pendingId}`);
};

export const createAccount = async (accountData: Partial<Account>): Promise<Account> => {
  const res = await api.post<GenericListResponse<Account> | { data?: Account } | Account>('/api/admin/create', accountData);
  const payload = (res.data as any) ?? {};
  // support shapes: { data: Account } | { user: Account } | Account
  return (payload.data ?? payload.user ?? payload) as Account;
};

export const updateAccount = async (accountId: number, updates: Partial<Account>): Promise<Account> => {
  const res = await api.put<GenericListResponse<Account> | { data?: Account } | Account>(`/api/admin/${accountId}`, updates);
  const payload = (res.data as any) ?? {};
  return (payload.data ?? payload.user ?? payload) as Account;
};

export const toggleAccountActive = async (accountId: number, isActive: boolean): Promise<Account> => {
  const res = await api.patch<GenericListResponse<Account> | { data?: Account } | Account>(`/api/admin/${accountId}/active`, { isActive });
  const payload = (res.data as any) ?? {};
  return (payload.data ?? payload.user ?? payload) as Account;
};

// new: fetch roles used by AdminControls
export const fetchUserRoles = async (): Promise<{ Roles_id: number; Roles: string }[]> => {
  const res = await api.get<GenericListResponse<{ Roles_id: number; Roles: string }>>('/api/admin/roles');
  const payload = res.data ?? {};
  return asArray(payload.data ?? payload) as { Roles_id: number; Roles: string }[];
};

// Fetch modules and normalize shape (handles modules_tbl.Name or Module_name)
export const fetchModules = async (): Promise<any[]> => {
  const res = await api.get<GenericListResponse<any>>('/api/admin/modules');
  const payload = res.data ?? {};
  return asArray(payload.data ?? payload) as any[];
};

// fetchJson usage with generics (fetchJson<T>)
export async function approvePendingAccount(pendingId: number): Promise<ApproveRejectResponse> {
  return fetchJson<ApproveRejectResponse>(`/api/admin/pending-accounts/${pendingId}/approve`, {
    method: 'POST',
  });
}
export async function rejectPendingAccount(pendingId: number, reason?: string): Promise<ApproveRejectResponse> {
  return fetchJson<ApproveRejectResponse>(`/api/admin/pending-accounts/${pendingId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// NEW: Add fetchBarangays
export const fetchBarangays = async () => {
  const tries = ['/api/admin/barangays', '/admin/barangays', '/api/barangays', '/barangays'];
  for (const path of tries) {
    try {
      const res = await api.get<GenericListResponse<{ Barangay_id: number; Barangay_Name: string }>>(path);
      const payload = res.data ?? {};
      return asArray(payload.data ?? payload) as { Barangay_id: number; Barangay_Name: string }[];
    } catch (err) {
      // try next
    }
  }
  console.warn('fetchBarangays: no endpoint responded, returning []');
  return [];
};