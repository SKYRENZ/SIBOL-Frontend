import api from './apiClient';
import type { Account, Role, Module, Barangay } from '../types/adminTypes';

// helper to extract array from various backend shapes
function asArray(payload: any): any[] {
  if (!payload) return [];
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload.rows)) return payload.rows;
  if (Array.isArray(payload.accounts)) return payload.accounts;
  if (Array.isArray(payload.data)) return payload.data;
  if (Array.isArray(payload.users)) return payload.users;
  if (payload?.rows?.data && Array.isArray(payload.rows.data)) return payload.rows.data;
  if (Array.isArray(payload.barangays)) return payload.barangays;
  if (Array.isArray(payload.roles)) return payload.roles;
  if (Array.isArray(payload.modules)) return payload.modules;
  return [];
}

export const fetchAdmins = async (): Promise<Account[]> => {
  const res = await api.get('/api/superadmin/admins');
  const payload = res.data ?? {};
  if (payload.success === false) throw new Error(payload.error || 'Failed to fetch admins');
  return asArray(payload.users ?? payload.data ?? payload) as Account[];
};

export const createAdmin = async (accountData: Partial<Account>): Promise<Account> => {
  const res = await api.post('/api/superadmin/create-admin', accountData);
  const payload = (res.data as any) ?? {};
  return (payload.user ?? payload.data ?? payload) as Account;
};

export const updateAdmin = async (accountId: number, updates: Partial<Account>): Promise<Account> => {
  const res = await api.put(`/api/superadmin/admins/${accountId}`, updates);
  const payload = (res.data as any) ?? {};
  return (payload.user ?? payload.data ?? payload) as Account;
};

export const toggleAdminActive = async (accountId: number, isActive: boolean): Promise<Account> => {
  const res = await api.patch(`/api/superadmin/admins/${accountId}/active`, { isActive });
  const payload = (res.data as any) ?? {};
  return (payload.account ?? payload.user ?? payload.data ?? payload) as Account;
};

export const fetchUserRoles = async (): Promise<Role[]> => {
  const res = await api.get('/api/superadmin/roles');
  const payload = res.data ?? {};
  return asArray(payload.roles ?? payload.data ?? payload) as Role[];
};

export const fetchModules = async (): Promise<Module[]> => {
  const res = await api.get('/api/superadmin/modules');
  const payload = res.data ?? {};
  return asArray(payload.modules ?? payload.data ?? payload) as Module[];
};

export const fetchBarangays = async (): Promise<Barangay[]> => {
  const res = await api.get('/api/superadmin/barangays');
  const payload = res.data ?? {};
  return asArray(payload.barangays ?? payload.data ?? payload) as Barangay[];
};

export const fetchAvailableBarangays = async (): Promise<{ barangayId: number; barangayName: string }[]> => {
  const res = await api.get('/api/superadmin/barangays/available');
  const payload = res.data ?? {};
  if (payload.success === false) throw new Error(payload.error || 'Failed to fetch available barangays');
  return asArray(payload.available ?? payload.data ?? payload);
};

export const fetchInactiveBarangays = async (): Promise<Barangay[]> => {
  const res = await api.get('/api/superadmin/barangays/inactive');
  const payload = res.data ?? {};
  if (payload.success === false) throw new Error(payload.error || 'Failed to fetch inactive barangays');
  return asArray(payload.barangays ?? payload.data ?? payload) as Barangay[];
};

export const activateBarangay = async (barangayId: number): Promise<any> => {
  const res = await api.post(`/api/superadmin/barangays/${barangayId}/activate`);
  const payload = (res.data as any) ?? {};
  if (payload.success === false) throw new Error(payload.error || 'Failed to activate barangay');
  return payload.barangay ?? payload.data ?? payload;
};

export const deactivateBarangay = async (barangayId: number): Promise<any> => {
  const res = await api.patch(`/api/superadmin/barangays/${barangayId}/deactivate`);
  const payload = (res.data as any) ?? {};
  if (payload.success === false) throw new Error(payload.error || 'Failed to deactivate barangay');
  return payload;
};
