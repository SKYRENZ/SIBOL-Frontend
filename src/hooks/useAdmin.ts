import { useCallback, useEffect, useState } from 'react';
import {
  fetchAccounts,
  createAccount as svcCreateAccount,
  updateAccount as svcUpdateAccount,
  toggleAccountActive as svcToggleAccountActive,
  approvePending as svcApprovePending,
  rejectPending as svcRejectPending,
} from '../services/adminService';
import type { Account } from '../types/Types';

export default function useAdmin() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchAccounts();
      setAccounts(rows);
    } catch (err: any) {
      console.error('useAdmin refresh error:', err);
      setError(err?.message ?? 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  }, []);

  // auto refresh on mount
  useEffect(() => {
    refresh();
  }, [refresh]);

  const createAccount = useCallback(
    async (payload: Partial<Account>) => {
      setLoading(true);
      try {
        const res = await svcCreateAccount(payload);
        // refresh to pick up new account
        await refresh();
        return res;
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const updateAccount = useCallback(
    async (accountId: number, updates: Partial<Account>) => {
      setLoading(true);
      try {
        const res = await svcUpdateAccount(accountId, updates);
        await refresh();
        return res;
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const toggleAccountActive = useCallback(
    async (accountId: number, isActive: boolean) => {
      setLoading(true);
      try {
        const res = await svcToggleAccountActive(accountId, isActive);
        await refresh();
        return res;
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const approveAccount = useCallback(
    async (pendingId: number) => {
      setLoading(true);
      try {
        const res = await svcApprovePending(pendingId);
        await refresh();
        return res;
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  const rejectAccount = useCallback(
    async (pendingId: number, reason?: string) => {
      setLoading(true);
      try {
        const res = await svcRejectPending(pendingId, reason);
        await refresh();
        return res;
      } finally {
        setLoading(false);
      }
    },
    [refresh]
  );

  return {
    accounts,
    loading,
    error,
    refresh,
    createAccount,
    updateAccount,
    toggleAccountActive,
    approveAccount,
    rejectAccount,
  };
}