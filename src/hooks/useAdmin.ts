import { useEffect, useState } from 'react';
import * as adminService from '../services/adminService';
import { Account } from '../types/Types';

export default function useAdmin() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await adminService.fetchAccounts();
      setAccounts(rows || []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const createAccount = async (payload: Partial<Account>) => {
    setLoading(true);
    try {
      const res = await adminService.createAccount(payload);
      await load();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const updateAccount = async (...args: any[]) => {
    // support two call styles: (id, updates) or (payload with Account_id)
    let accountId: number | undefined;
    let updates: Partial<Account> | undefined;

    if (args.length === 2) {
      accountId = Number(args[0]);
      updates = args[1];
    } else {
      const payload = args[0] as Partial<Account>;
      if (!payload || !payload.Account_id) throw new Error('Account_id required');
      accountId = Number(payload.Account_id);
      updates = payload;
    }

    setLoading(true);
    try {
      const res = await adminService.updateAccount(accountId, updates as any);
      // try to extract updated row from response
      const updated = (res && (res.user ?? (res.rows && res.rows[0]) ?? res.data ?? null)) as any;

      if (updated && updated.Account_id) {
        setAccounts((prev) => prev.map((a) => (a.Account_id === Number(updated.Account_id) ? { ...a, ...updated } : a)));
        return res;
      }

      // fallback: reload full list
      await load();
      return res;
    } finally {
      setLoading(false);
    }
  };

  const toggleAccountActive = async (account: Account) => {
    if (!account.Account_id) throw new Error('Account_id required');
    const newActive = !(account.IsActive === 1 || account.IsActive === true);
    await adminService.toggleAccountActive(Number(account.Account_id), newActive);
    // update local state immediately
    setAccounts((prev) => prev.map((a) => (a.Account_id === account.Account_id ? { ...a, IsActive: newActive ? 1 : 0 } : a)));
  };

  const approveAccount = async (pendingId: number) => {
    const res = await adminService.approvePending(pendingId);
    await load();
    return res;
  };

  const rejectAccount = async (pendingId: number, reason?: string) => {
    const res = await adminService.rejectPending(pendingId, reason);
    await load();
    return res;
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
    reload: load,
  };
}