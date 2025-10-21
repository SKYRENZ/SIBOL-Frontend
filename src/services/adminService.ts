import api, { fetchJson } from './apiClient';
import { Account } from '../types/Types';

export const fetchAccounts = async (): Promise<Account[]> => {
  const res = await api.get('/api/admin/accounts');
  const data = res.data as any;
  return data.rows ?? data;
};

export const fetchPendingAccounts = async (): Promise<any[]> => {
  const res = await api.get('/api/admin/pending-accounts');
  const data = res.data as any;
  return data.pendingAccounts ?? data;
};

export const fetchPendingById = async (pendingId: number) => {
  const res = await api.get(`/api/admin/pending-accounts/${pendingId}`);
  return (res.data as any);
};

export const approvePending = async (pendingId: number) => {
  const res = await api.post(`/api/admin/pending-accounts/${pendingId}/approve`);
  return (res.data as any);
};

export const rejectPending = async (pendingId: number, reason?: string) => {
  const res = await api.post(`/api/admin/pending-accounts/${pendingId}/reject`, { reason });
  return (res.data as any);
};

export const createAccount = async (accountData: Partial<Account>) => {
  const res = await api.post('/api/admin/create', accountData);
  return (res.data as any);
};

export const updateAccount = async (accountId: number, updates: Partial<Account>) => {
  const res = await api.put(`/api/admin/${accountId}`, updates);
  return (res.data as any);
};

export const toggleAccountActive = async (accountId: number, isActive: boolean) => {
  const res = await api.patch(`/api/admin/${accountId}/active`, { isActive });
  return (res.data as any);
};

// new: fetch roles used by AdminControls
export const fetchUserRoles = async (): Promise<{ Roles_id: number; Roles: string }[]> => {
  const res = await api.get('/api/admin/roles');
  const data = res.data as any;
  // backend may return rows or an array directly
  return data.rows ?? data;
};

// NEW: Fetch all modules for access checklist
export const fetchModules = async (): Promise<{ Module_id: number; Module_name: string }[]> => {
  const res = await api.get('/api/modules');
  const data = res.data as any;
  // Assume backend returns an array directly or in a 'rows' key
  return data.rows ?? data;
};

export async function approvePendingAccount(pendingId: number): Promise<any> {
  // use centralized fetchJson (will include auth header if token is present)
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