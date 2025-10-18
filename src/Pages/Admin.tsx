import React, { useState } from 'react';
import AdminList from '../Components/admin/AdminList';
import AdminForm from '../Components/admin/AdminForm';
import UserApproval from '../Components/admin/UserApproval';
import { Account } from '../types/Types';
import Header from '../Components/Header';
import { useAdmin } from '../hooks/useAdmin';

export default function Admin() {
  const {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    toggleAccountActive,
    approveAccount,
    rejectAccount,
  } = useAdmin();

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'approval'>('list');

  // UI-level slim wrappers (network handled in hook)
  const onCreate = async (p: Partial<Account>) => {
    try {
      await createAccount(p as any);
      setCreating(false);
    } catch (err: any) {
      alert(err?.message ?? 'Create failed');
    }
  };
  const onUpdate = async (p: Partial<Account>) => {
    if (!editingAccount?.Account_id) return;
    try {
      await updateAccount(editingAccount.Account_id, p);
      setEditingAccount(null);
    } catch (err: any) {
      alert(err?.message ?? 'Update failed');
    }
  };
  const onToggleActive = async (a: Account) => {
    if (!a.Account_id) return;
    try {
      await toggleAccountActive(a.Account_id, !Boolean(a.IsActive));
    } catch (err: any) {
      alert(err?.message ?? 'Toggle active failed');
    }
  };
  const onAccept = async (a: Account) => { if (!a.Account_id) return await approveAccount(a.Account_id); };
  const onReject = async (a: Account) => { if (!a.Account_id) return await rejectAccount(a.Account_id); };

  const pendingCount = accounts.filter(
    (a: any) => a?.Status === 'Pending' || a?.IsActive === 0 || a?.IsApproved === false
  ).length;

  return (
    <>
      <Header />
      {/* Create a safe spacing under the header; fallback height 96px */}
      <div className="px-6 pt-[calc(var(--header-h,96px)+12px)]">

        {/* Sticky sub-header: copies the "header button" aesthetics via shared classes */}
        <div className="subheader sticky top-[var(--header-h,96px)] z-30">
          <div className="max-w-screen-xl mx-auto flex items-end justify-between py-4">
            {/* Tabs */}
            <nav className="flex items-center gap-0 bg-sibol-green rounded-none" role="tablist" aria-label="Admin tabs">
              <button
                role="tab"
                aria-selected={activeTab === 'list'}
                onClick={() => setActiveTab('list')}
                className={`tab ${activeTab === 'list' ? 'tab-active' : ''}`}
                style={{ borderRadius: 0 }}
              >
                List of Accounts
              </button>
              <button
                role="tab"
                aria-selected={activeTab === 'approval'}
                onClick={() => setActiveTab('approval')}
                className={`tab flex items-center gap-2 ${activeTab === 'approval' ? 'tab-active' : ''}`}
                style={{ borderRadius: 0 }}
              >
                User Approval
                <span className="chip chip-rose">{pendingCount}</span>
              </button>
            </nav>

            {/* Right controls: search + filter */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-white border border-green-100 rounded-full px-3 py-1">
                <svg className="w-4 h-4 text-sibol-green mr-2" viewBox="0 0 24 24" fill="none">
                  <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  placeholder="Search"
                  className="text-sm text-slate-600 placeholder:text-slate-400 outline-none bg-transparent"
                />
              </div>

              <button className="btn btn-outline">
                Filter by
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 8h10L10 13 5 8z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-screen-xl mx-auto mt-6">
          {loading && <div className="text-sm text-gray-600">Loading...</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}

          {activeTab === 'list' && (
            <>
              <AdminList accounts={accounts} onEdit={setEditingAccount} onToggleActive={onToggleActive} />
              <div className="mt-4">
                <button onClick={() => setCreating(true)} className="btn btn-primary">
                  Create User
                </button>
              </div>
            </>
          )}

          {activeTab === 'approval' && (
            <UserApproval accounts={accounts} onAccept={onAccept} onReject={onReject} />
          )}

          {creating && <AdminForm onSubmit={onCreate} onCancel={() => setCreating(false)} />}

          {editingAccount && (
            <AdminForm
              initialData={editingAccount}
              onSubmit={onUpdate}
              onCancel={() => setEditingAccount(null)}
            />
          )}
        </div>
      </div>
      <div className="px-6 py-2 flex items-center justify-between text-sm text-gray-600 bg-white border-t border-green-50">
        <div>
          Records per page: <span className="font-medium">10</span>
          <svg className="inline w-3 h-3 ml-1" viewBox="0 0 20 20" fill="currentColor"><path d="M5 8h10L10 13 5 8z" /></svg>
        </div>
        <div>
          1-10 of 10
          <button className="mx-2 text-sibol-green hover:underline">&lt;&lt;</button>
          <button className="mx-1 text-sibol-green hover:underline">&lt;</button>
          <button className="mx-1 text-sibol-green hover:underline">&gt;</button>
          <button className="mx-1 text-sibol-green hover:underline">&gt;&gt;</button>
        </div>
      </div>
    </>
  );
}