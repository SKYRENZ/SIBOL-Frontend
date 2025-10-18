import api from './apiClient';
import { Account } from '../types/Types';

export const fetchAccounts = async (): Promise<Account[]> => {
  const res = await api.get<any>('/api/admin/accounts'); // <-- uses apiClient with JWT
  const data = res.data as any;
  return (data?.rows ?? data ?? []) as Account[];
};

export const createAccount = async (accountData: Partial<Account>): Promise<any> => {
  const response = await api.post('/admin/create', accountData);
  return response.data;
};

export const updateAccount = async (accountId: number, updates: Partial<Account>): Promise<any> => {
  const response = await api.put(`/admin/${accountId}`, updates);
  return response.data;
};

export const toggleAccountActive = async (accountId: number, isActive: boolean): Promise<any> => {
  const response = await api.patch(`/admin/${accountId}/active`, { isActive });
  return response.data;
};

export const approveAccount = async (accountId: number): Promise<any> => {
  const res = await api.post(`/api/admin/${accountId}/approve`);
  return res.data;
};

export const rejectAccount = async (accountId: number): Promise<any> => {
  const res = await api.post(`/api/admin/${accountId}/reject`);
  return res.data;
};