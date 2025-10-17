import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import { Account } from '../types/Types';

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
      const res = await api.get<any>('/accounts');
      setAccounts(res.data?.rows ?? res.data ?? []);
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

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    toggleAccountActive,
  };
};