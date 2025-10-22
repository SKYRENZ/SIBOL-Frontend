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
  // some responses use pendingAccounts / barangays / roles / modules keys
  if (Array.isArray(payload.pendingAccounts)) return payload.pendingAccounts;
  if (Array.isArray(payload.barangays)) return payload.barangays;
  if (Array.isArray(payload.roles)) return payload.roles;
  if (Array.isArray(payload.modules)) return payload.modules;
  return [];
}

export const fetchAccounts = async (): Promise<Account[]> => {
  const res = await api.get('/api/admin/accounts');  // Added /api
  if (!res.data?.success) throw new Error(res.data?.error || 'Failed to fetch accounts');
  // normalize various shapes (res.data.users | res.data.data | res.data)
  return asArray(res.data.users ?? res.data);
};

export const fetchPendingAccounts = async (): Promise<any[]> => {
  const tries = ['/api/admin/pending-accounts', '/admin/pending-accounts', '/api/pending-accounts', '/pending-accounts'];
  for (const path of tries) {
    try {
      const res = await api.get(path);
      return asArray(res.data.pendingAccounts ?? res.data);
    } catch (err) {
      // try next
    }
  }
  console.warn('fetchPendingAccounts: no endpoint responded, returning []');
  return [];
};

export const fetchPendingById = async (pendingId: number) => {
  const res = await api.get(`/api/admin/pending-accounts/${pendingId}`);  // Added /api
  return res.data;
};

export const approvePending = async (pendingId: number) => {
  const tries = [
    `/api/admin/pending-accounts/${pendingId}/approve`,
    `/admin/pending-accounts/${pendingId}/approve`,
    `/api/pending-accounts/${pendingId}/approve`,
    `/pending-accounts/${pendingId}/approve`,
  ];
  for (const path of tries) {
    try {
      const res = await api.post(path);
      return res.data;
    } catch (err) {
      // try next
    }
  }
  throw new Error(`approvePending: no endpoint available for pendingId=${pendingId}`);
};

export const rejectPending = async (pendingId: number, reason?: string) => {
  const tries = [
    `/api/admin/pending-accounts/${pendingId}/reject`,
    `/admin/pending-accounts/${pendingId}/reject`,
    `/api/pending-accounts/${pendingId}/reject`,
    `/pending-accounts/${pendingId}/reject`,
  ];
  for (const path of tries) {
    try {
      const res = await api.post(path, { reason });
      return res.data;
    } catch (err) {
      // try next
    }
  }
  throw new Error(`rejectPending: no endpoint available for pendingId=${pendingId}`);
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
  return asArray(res.data.roles ?? res.data) as { Roles_id: number; Roles: string }[];
};

// Fetch modules and normalize shape (handles modules_tbl.Name or Module_name)
export const fetchModules = async (): Promise<any[]> => {
  const res = await api.get('/api/admin/modules');  // Added /api
  return asArray(res.data.modules ?? res.data);
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
  const tries = ['/api/admin/barangays', '/admin/barangays', '/api/barangays', '/barangays'];
  for (const path of tries) {
    try {
      const res = await api.get(path);
      return asArray(res.data.barangays ?? res.data);
    } catch (err) {
      // try next
    }
  }
  console.warn('fetchBarangays: no endpoint responded, returning []');
  return [];
};