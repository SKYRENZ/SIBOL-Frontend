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
  try {
    const res = await api.get('/api/admin/accounts');
    const data = (res as any).data;
    // prefer `users` (new backend shape), fallback to common shapes
    if (Array.isArray(data?.users)) return data.users as Account[];
    return asArray(data) as Account[];
  } catch (err) {
    console.error('fetchAccounts failed:', err);
    return [];
  }
};

export const fetchPendingAccounts = async (): Promise<any[]> => {
  try {
    const res = await api.get('/api/admin/pending-accounts');
    const data = (res as any).data;
    // backend may return { pendingAccounts: [...] } or rows/array
    if (Array.isArray(data?.pendingAccounts)) return data.pendingAccounts;
    return asArray(data);
  } catch (err) {
    console.error('fetchPendingAccounts failed:', err);
    return [];
  }
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
  try {
    const res = await api.get('/api/admin/roles');
    const data = (res as any).data;
    const arr = asArray(data);
    // Some backends return objects not arrays
    return arr;
  } catch (err) {
    console.error('fetchUserRoles failed:', err);
    return [];
  }
};

// Fetch modules and normalize shape (handles modules_tbl.Name or Module_name)
export const fetchModules = async (): Promise<{ Module_id: number; Module_name: string; Path?: string }[]> => {
  try {
    const res = await api.get('/api/admin/modules');
    const data = (res as any).data;
    const rows = asArray(data);
    return rows.map((m: any) => ({
      Module_id: Number(m.Module_id ?? m.id ?? m.ModuleId ?? 0),
      Module_name: m.Module_name ?? m.Name ?? m.name ?? m.ModuleName ?? '',
      Path: m.Path ?? m.path ?? undefined,
    }));
  } catch (err) {
    console.error('fetchModules failed:', err);
    return [];
  }
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