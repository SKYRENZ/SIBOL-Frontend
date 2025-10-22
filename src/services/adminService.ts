import api, { fetchJson } from './apiClient';
import { Account } from '../types/Types';

// helper to extract array from various backend shapes
function asArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.accounts)) return payload.accounts;
  if (Array.isArray(payload.data)) return payload.data;
  if (payload?.rows?.data && Array.isArray(payload.rows.data)) return payload.rows.data;
  return [];
}

export const fetchAccounts = async (): Promise<Account[]> => {
  const res = await api.get('/api/admin/accounts');  // Added /api
  if (!res.data.success) throw new Error(res.data.error || 'Failed to fetch accounts');
  return res.data.users || [];
};

export const fetchPendingAccounts = async (): Promise<any[]> => {
  const res = await api.get('/api/admin/pending-accounts');  // Added /api
  return res.data || [];
};

export const fetchPendingById = async (pendingId: number) => {
  const res = await api.get(`/api/admin/pending-accounts/${pendingId}`);  // Added /api
  return res.data;
};

export const approvePending = async (pendingId: number) => {
  const res = await api.post(`/api/admin/pending-accounts/${pendingId}/approve`);  // Added /api
  return res.data;
};

export const rejectPending = async (pendingId: number, reason?: string) => {
  const res = await api.post(`/api/admin/pending-accounts/${pendingId}/reject`, { reason });  // Added /api
  return res.data;
};

export const createAccount = async (accountData: Partial<Account>) => {
  const res = await api.post('/api/admin/create', accountData);  // Added /api
  return res.data;
};

export const updateAccount = async (accountId: number, updates: Partial<Account>) => {
  const res = await api.put(`/api/admin/${accountId}`, updates);  // Added /api
  return res.data;
};

export const toggleAccountActive = async (accountId: number, isActive: boolean) => {
  const res = await api.patch(`/api/admin/${accountId}/active`, { isActive });  // Added /api
  return res.data;
};

// new: fetch roles used by AdminControls
export const fetchUserRoles = async (): Promise<{ Roles_id: number; Roles: string }[]> => {
  const res = await api.get('/api/admin/roles');  // Added /api
  return res.data || [];
};

// Fetch modules and normalize shape (handles modules_tbl.Name or Module_name)
export const fetchModules = async (): Promise<any[]> => {
  const res = await api.get('/api/admin/modules');  // Added /api
  return res.data || [];
};

export async function approvePendingAccount(pendingId: number): Promise<any> {
  return fetchJson(`/api/admin/pending-accounts/${pendingId}/approve`, {
    method: 'POST',
  });
}
export async function rejectPendingAccount(pendingId: number, reason?: string): Promise<any> {
  return fetchJson(`/api/admin/pending-accounts/${pendingId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

// NEW: Add fetchBarangays
export const fetchBarangays = async () => {
  const res = await api.get('/api/admin/barangays');  // Added /api
  return res.data;
};