import { useCallback, useEffect, useState } from 'react';
import {
  fetchAccounts,
  createAccount as svcCreateAccount,
  updateAccount as svcUpdateAccount,
  toggleAccountActive as svcToggleAccountActive,
  approvePending as svcApprovePending,
  rejectPending as svcRejectPending,
  fetchUserRoles,
  fetchModules,
  fetchBarangays,
} from '../../services/adminService';
import type { Account } from '../../types/Types';

export default function useAdmin() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roles, setRoles] = useState<{ Roles_id: number; Roles: string }[]>([]);
  const [modules, setModules] = useState<{ Module_id: number; Module_name: string; Path?: string }[]>([]);
  const [barangays, setBarangays] = useState<{ Barangay_id: number; Barangay_Name: string }[]>([]);

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

  // Fetch roles on mount
  useEffect(() => {
    const loadRoles = async () => {
      try {
        const resp: any = await fetchUserRoles();
        const list = Array.isArray(resp) ? resp : resp?.data ?? resp?.roles ?? [];
        setRoles(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Failed to load roles:', err);
      }
    };
    loadRoles();
  }, []);

  // Fetch modules on mount
  useEffect(() => {
    const loadModules = async () => {
      try {
        const fetched: any[] = await fetchModules();
        const normalized = (fetched || []).map((m: any) => ({
          Module_id: m.Module_id ?? m.id ?? 0,
          Module_name: m.Module_name ?? m.Name ?? m.name ?? m.ModuleName ?? '',
          Path: m.Path ?? m.path ?? undefined,
        }));
        setModules(normalized);
      } catch (err) {
        console.error('Failed to load modules:', err);
      }
    };
    loadModules();
  }, []);

  // Fetch barangays on mount
  useEffect(() => {
    const loadBarangays = async () => {
      try {
        const resp: any = await fetchBarangays(); // fetchBarangays should call your API
        // support either: resp is array OR resp = { barangays: [...] } OR axios.resp -> resp.data
        const list =
          Array.isArray(resp) ? resp :
          Array.isArray(resp?.barangays) ? resp.barangays :
          Array.isArray(resp?.data) ? resp.data :
          Array.isArray(resp?.data?.barangays) ? resp.data.barangays :
          [];
        setBarangays(list);
      } catch (err) {
        console.error('loadBarangays error', err);
      }
    };
    loadBarangays();
  }, []);

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
    roles,
    modules,
    barangays,
  };
}