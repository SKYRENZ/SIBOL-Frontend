import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { Account } from '../types/Types';
import * as adminService from '../services/adminService';

export const useAdmin = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.fetchAccounts();
      setAccounts(data);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (payload: Omit<Account, 'Account_id'>) => {
    try {
      await api.post('/admin/create', payload);
      await fetchAccounts();
    } catch (err: any) {
      throw new Error(err?.message ?? 'Create failed');
    }
  };

  const updateAccount = async (accountId: number, updates: Partial<Account>) => {
    try {
      await api.put(`/admin/${accountId}`, updates);
      await fetchAccounts();
    } catch (err: any) {
      throw new Error(err?.message ?? 'Update failed');
    }
  };

  const toggleAccountActive = async (accountId: number, isActive: boolean) => {
    try {
      await api.patch(`/admin/${accountId}/active`, { isActive });
      await fetchAccounts();
    } catch (err: any) {
      throw new Error(err?.message ?? 'Toggle active failed');
    }
  };

  const approveAccount = async (accountId: number) => {
    try {
      await adminService.approveAccount(accountId);
      await fetchAccounts();
    } catch (err: any) {
      throw new Error(err?.message ?? 'Approve failed');
    }
  };

  const rejectAccount = async (accountId: number) => {
    try {
      await adminService.rejectAccount(accountId);
      await fetchAccounts();
    } catch (err: any) {
      throw new Error(err?.message ?? 'Reject failed');
    }
  };

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    toggleAccountActive,
    approveAccount,
    rejectAccount,
    refresh: fetchAccounts,
  };
};