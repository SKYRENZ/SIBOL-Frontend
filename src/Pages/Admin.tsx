import { useEffect, useState } from 'react';
import api from '../services/apiClient';
import AdminList from '../Components/admin/AdminList';
import AdminForm from '../Components/admin/AdminForm';
import { Account } from '../types';
import Header from '../Components/Header';

export default function Admin() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  async function fetchAccounts() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<any>('/api/admin/accounts'); // changed path
      const data = res.data as any;
      setAccounts((data?.rows ?? data ?? []) as Account[]);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  }

  const handleCreate = async (accountData: Partial<Account>) => {
    try {
      await api.post('/admin/create', accountData);
      await fetchAccounts();
      setCreating(false);
    } catch (err: any) {
      alert(err?.message ?? 'Create failed');
    }
  };

  const handleUpdate = async (accountData: Partial<Account>) => {
    if (!editingAccount || editingAccount.Account_id == null) return;
    try {
      await api.put(`/admin/${editingAccount.Account_id}`, accountData);
      await fetchAccounts();
      setEditingAccount(null);
    } catch (err: any) {
      alert(err?.message ?? 'Update failed');
    }
  };

  const toggleActive = async (account: Account) => {
    if (!account.Account_id) return;
    try {
      await api.patch(`/admin/${account.Account_id}/active`, { isActive: !account.IsActive });
      await fetchAccounts();
    } catch (err: any) {
      alert(err?.message ?? 'Toggle active failed');
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: 24 }}>
        <h2>Admin Panel</h2>
        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <AdminList accounts={accounts} onEdit={setEditingAccount} onToggleActive={toggleActive} />
        {creating && <AdminForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />}
        {editingAccount && (
          <AdminForm
            initialData={editingAccount}
            onSubmit={handleUpdate}
            onCancel={() => setEditingAccount(null)}
          />
        )}
        <button onClick={() => setCreating(true)}>Create User</button>
      </div>
    </>
  );
}