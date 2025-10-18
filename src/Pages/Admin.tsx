import { useState } from 'react';
import AdminList from '../Components/admin/AdminList';
import AdminForm from '../Components/admin/AdminForm';
import UserApproval from '../Components/admin/UserApproval';
import { Account } from '../types/Types';
import Header from '../Components/Header';
import { useAdmin } from '../hooks/useAdmin';
import api from '../services/apiClient';

export default function Admin() {
  const { accounts, loading, error, createAccount, updateAccount, toggleAccountActive, approveAccount, rejectAccount, refresh } = useAdmin();
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'approval'>('list');

  const handleCreate = async (accountData: Partial<Account>) => {
    try {
      await createAccount(accountData as any);
      setCreating(false);
    } catch (err: any) {
      alert(err?.message ?? 'Create failed');
    }
  };

  const handleUpdate = async (accountData: Partial<Account>) => {
    if (!editingAccount || editingAccount.Account_id == null) return;
    try {
      await updateAccount(editingAccount.Account_id, accountData);
      setEditingAccount(null);
    } catch (err: any) {
      alert(err?.message ?? 'Update failed');
    }
  };

  const toggleActive = async (account: Account) => {
    if (!account.Account_id) return;
    try {
      await toggleAccountActive(account.Account_id, !Boolean(account.IsActive));
    } catch (err: any) {
      alert(err?.message ?? 'Toggle active failed');
    }
  };

  const handleAccept = async (account: Account) => {
    if (!account.Account_id) return;
    try {
      await approveAccount(account.Account_id);
      await refresh();
    } catch (err: any) {
      alert(err?.message ?? 'Accept failed');
    }
  };

  const handleReject = async (account: Account) => {
    if (!account.Account_id) return;
    try {
      await rejectAccount(account.Account_id);
      await refresh();
    } catch (err: any) {
      alert(err?.message ?? 'Reject failed');
    }
  };

  return (
    <>
      <Header />
      <div style={{ padding: 24 }}>
        <h2>Admin Panel</h2>

        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <button
            onClick={() => setActiveTab('list')}
            style={{
              padding: '8px 14px',
              background: activeTab === 'list' ? '#2E523A' : '#f0f0f0',
              color: activeTab === 'list' ? '#fff' : '#2E523A',
              border: 'none',
              borderRadius: 6,
            }}
          >
            Account List
          </button>
          <button
            onClick={() => setActiveTab('approval')}
            style={{
              padding: '8px 14px',
              background: activeTab === 'approval' ? '#2E523A' : '#f0f0f0',
              color: activeTab === 'approval' ? '#fff' : '#2E523A',
              border: 'none',
              borderRadius: 6,
            }}
          >
            User Approval
          </button>
        </div>

        {loading && <div>Loading...</div>}
        {error && <div style={{ color: 'red' }}>{error}</div>}

        {activeTab === 'list' && (
          <>
            <AdminList accounts={accounts} onEdit={setEditingAccount} onToggleActive={toggleActive} />
            <div style={{ marginTop: 12 }}>
              <button onClick={() => setCreating(true)}>Create User</button>
            </div>
          </>
        )}

        {activeTab === 'approval' && (
          <UserApproval accounts={accounts} onAccept={handleAccept} onReject={handleReject} />
        )}

        {creating && <AdminForm onSubmit={handleCreate} onCancel={() => setCreating(false)} />}

        {editingAccount && (
          <AdminForm
            initialData={editingAccount}
            onSubmit={handleUpdate}
            onCancel={() => setEditingAccount(null)}
          />
        )}
      </div>
    </>
  );
}