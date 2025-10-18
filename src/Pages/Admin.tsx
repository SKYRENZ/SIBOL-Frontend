import React, { useState, useEffect } from 'react';
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
  const [headerPadding, setHeaderPadding] = useState('112px');

  useEffect(() => {
    const update = () => {
      const h = (document.querySelector('.header') as HTMLElement)?.getBoundingClientRect().height ?? 96;
      setHeaderPadding(`${Math.round(h + 12)}px`);
    };
    update();
    const RO = (window as any).ResizeObserver;
    const ro = RO ? new RO(() => update()) : undefined;
    const headerEl = document.querySelector('.header');
    if (ro && headerEl) ro.observe(headerEl);
    window.addEventListener('resize', update);
    return () => {
      if (ro && headerEl) ro.unobserve(headerEl);
      window.removeEventListener('resize', update);
    };
  }, []);

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

  return (
    <>
      <Header />
      <div className="px-6" style={{ paddingTop: headerPadding }}>
        {/* Tabs / header controls (Figma style) */}
        <div className="bg-white rounded-sm border-b border-green-50 pb-4">
          <div className="max-w-screen-xl mx-auto flex items-end justify-between py-4">
            <nav className="flex items-center gap-8">
              <button
                onClick={() => setActiveTab('list')}
                className={`text-sibol-green font-semibold text-lg pb-2 ${activeTab === 'list' ? 'border-b-2 border-sibol-green' : 'opacity-90'}`}
              >
                List of Accounts
              </button>

              <button
                onClick={() => setActiveTab('approval')}
                className={`text-sibol-green font-semibold text-lg pb-2 flex items-center gap-2 ${activeTab === 'approval' ? 'border-b-2 border-sibol-green' : 'opacity-90'}`}
              >
                User Approval
                <span className="inline-flex items-center justify-center text-xs font-medium bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                  {accounts.filter((a: any) => (a?.Status === 'Pending' || a?.IsActive === 0 || a?.IsApproved === false)).length}
                </span>
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center bg-white border border-green-100 rounded-full px-3 py-1">
                <svg className="w-4 h-4 text-sibol-green mr-2" viewBox="0 0 24 24" fill="none"><path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                <input placeholder="Search" className="text-sm text-slate-600 placeholder:text-slate-400 outline-none" />
              </div>

              <button className="flex items-center gap-2 border border-green-100 rounded-md px-3 py-1 text-sm text-sibol-green bg-white">
                Filter by
                <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor"><path d="M5 8h10L10 13 5 8z"/></svg>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto mt-6">
          {loading && <div className="text-sm text-gray-600">Loading...</div>}
          {error && <div className="text-sm text-red-500">{error}</div>}

          {activeTab === 'list' && (
            <>
              <AdminList accounts={accounts} onEdit={setEditingAccount} onToggleActive={onToggleActive} />
              <div className="mt-4">
                <button onClick={() => setCreating(true)} className="px-4 py-2 rounded-md bg-black text-white">Create User</button>
              </div>
            </>
          )}

          {activeTab === 'approval' && (
            <UserApproval accounts={accounts} onAccept={onAccept} onReject={onReject} />
          )}

          {creating && <AdminForm onSubmit={onCreate} onCancel={() => setCreating(false)} />}

          {editingAccount && <AdminForm initialData={editingAccount} onSubmit={onUpdate} onCancel={() => setEditingAccount(null)} />}
        </div>
      </div>
    </>
  );
}