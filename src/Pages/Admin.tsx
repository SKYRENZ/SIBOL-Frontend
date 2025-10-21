import { useMemo, useState } from 'react';
import useAdmin from '../hooks/useAdmin';
import AdminList from '../Components/admin/AdminList';
import AdminForm from '../Components/admin/AdminForm';
import UserApproval from '../Components/admin/UserApproval';
import AdminControls from '../Components/admin/AdminControls';
import { Account } from '../types/Types';
import Header from '../Components/Header';

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

  // Global UI controls
  const [globalQuery, setGlobalQuery] = useState('');
  // roleFilter now stores role id (from user_roles_tbl) or 'all'
  const [roleFilter, setRoleFilter] = useState<number | 'all'>('all');

  const filteredAccounts = useMemo(() => {
    const q = globalQuery.trim().toLowerCase();
    return accounts.filter((a: any) => {
      if (roleFilter !== 'all') {
        if (a.Roles !== roleFilter) return false;
      }
      if (!q) return true;
      return `${a.Username ?? a.FirstName ?? ''} ${a.LastName ?? ''} ${a.Email ?? ''}`.toLowerCase().includes(q);
    });
  }, [accounts, globalQuery, roleFilter]);

  // UI-level slim wrappers (network handled in hook)
  const onCreate = async (p: Partial<Account>) => {
    try {
      await createAccount(p as any);
      setCreating(false);
    } catch (err: any) {
      alert(err?.message ?? 'Create failed');
    }
  };

  // Pass payload object with Account_id (useAdmin.updateAccount expects a payload)
  const onUpdate = async (p: Partial<Account>) => {
    if (!editingAccount?.Account_id) return;
    try {
      // prefer updateAccount(id, updates) if the hook uses that signature
      if ((updateAccount as any).length === 2) {
        await updateAccount(editingAccount.Account_id, p);
      } else {
        // fallback: pass payload object if hook expects that
        await updateAccount({ ...p, Account_id: editingAccount.Account_id } as any);
      }

      // temporary: ensure UI reflects backend by reloading accounts — replace with proper refetch in the hook
      // quick-and-dirty: reload the page so list shows DB state immediately
      window.location.reload();

      // setEditingAccount(null); // not needed because we reload
    } catch (err: any) {
      alert(err?.message ?? 'Update failed');
    }
  };

  // use the hook's toggleAccountActive(account) signature (pass whole account)
  const onToggleActive = async (a: Account) => {
    if (!a.Account_id) return;
    try {
      await toggleAccountActive(a);
    } catch (err: any) {
      alert(err?.message ?? 'Toggle active failed');
    }
  };

  // Accept/Approve expects an Account (or id) — keep similar but use hook properly
  const onAccept = async (a: Account) => {
    if (!a.Account_id) return;
    if (!confirm(`Approve account for ${a.Username ?? a.Email ?? 'this user'}?`)) return;
    try {
      await approveAccount(Number(a.Account_id));
      alert('Account approved');
    } catch (err: any) {
      alert(err?.message ?? 'Approve failed');
    }
  };

  // onReject must accept the Account object (not a reason string)
  const onReject = async (a: Account) => {
    if (!a.Account_id) return;
    const reason = prompt('Reason for rejection (optional)', '') ?? undefined;
    if (!confirm(`Reject account for ${a.Username ?? a.Email ?? 'this user'}?`)) return;
    try {
      await rejectAccount(Number(a.Account_id), reason);
      alert('Account rejected');
    } catch (err: any) {
      alert(err?.message ?? 'Reject failed');
    }
  };

  const pendingCount = accounts.filter(
    (a: any) => a?.Status === 'Pending' || a?.IsActive === 0 || a?.IsApproved === false
  ).length;

  // In the Admin component
  const initialData = useMemo(() => (editingAccount ? editingAccount : {}), [editingAccount]); // Stable for create mode

  return (
    <>
      <Header />
      {/* make white background touch the header by using a full-bleed white wrapper
          and a spacer equal to the header height so content stays below the fixed header */}
      <div className="w-full bg-white">
        <div style={{ height: 'var(--header-h,96px)' }} aria-hidden />
        {/* subheader with more visible separator (tabs centered vertically, slightly shifted left) */}
        <div className="subheader sticky top-[var(--header-h,96px)] z-30 w-full border-b border-sibol-green/10 bg-white">
          {/* tighter subheader */}
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between py-0.5 px-3">
            {/* tabs slightly more compact (moved up slightly) */}
            <nav className="flex items-center gap-5 -ml-2 -mt-1" role="tablist" aria-label="Admin tabs">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'list'}
                onClick={() => setActiveTab('list')}
                className={`text-xl px-4 py-2 font-medium bg-transparent appearance-none focus:outline-none focus:ring-0 shadow-none transition-transform duration-150 transform -translate-y-4 hover:scale-105
                  ${activeTab === 'list'
                    ? 'text-sibol-green font-semibold underline underline-offset-4'
                    : 'text-sibol-green/70 hover:font-semibold hover:text-sibol-green'}`}
              >
                List of Accounts
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'approval'}
                onClick={() => setActiveTab('approval')}
                className={`flex items-center gap-2 text-xl px-4 py-2 font-medium bg-transparent appearance-none focus:outline-none focus:ring-0 shadow-none transition-transform duration-150 transform -translate-y-4 hover:scale-105
                  ${activeTab === 'approval'
                    ? 'text-sibol-green font-semibold underline underline-offset-4'
                    : 'text-sibol-green/70 hover:font-semibold hover:text-sibol-green'}`}
              >
                User Approval
                <span className="chip chip-rose ml-1 text-xs">{pendingCount}</span>
              </button>
            </nav>
            <div aria-hidden />
          </div>
        </div>

        <div className="w-full bg-white mt-3">
          <div className="max-w-screen-2xl mx-auto px-6">
            {/* controls (search + role filter) placed below subheader and above lists */}
            <AdminControls
              globalQuery={globalQuery}
              setGlobalQuery={setGlobalQuery}
              roleFilter={roleFilter}
              setRoleFilter={setRoleFilter}
              onReset={() => { /* nothing extra for now */ }}
              onCreate={() => setCreating(true)}
            />
            {loading && <div className="text-sm text-gray-600">Loading...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}

            {activeTab === 'list' && (
              <AdminList accounts={filteredAccounts} onEdit={setEditingAccount} onToggleActive={onToggleActive} />
            )}

            {activeTab === 'approval' && (
              <UserApproval onAccept={onAccept} onReject={onReject} />
            )}

            {/* Modal popup for Create / Edit */}
            {(creating || editingAccount) && (
              <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* backdrop: click to close */}
                <div
                  className="absolute inset-0 bg-black/40"
                  onClick={() => {
                    if (creating) setCreating(false);
                    if (editingAccount) setEditingAccount(null);
                  }}
                />

                {/* modal panel */}
                <div className="relative w-full max-w-3xl mx-4 bg-white rounded-lg shadow-lg p-6 text-sm text-[#3D5341]">
                  <AdminForm
                    initialData={initialData}
                    mode={creating ? 'create' : 'edit'}  // Fixed: Now based on creating vs. editingAccount
                    onSubmit={creating ? onCreate : onUpdate}
                    onCancel={() => {
                      if (creating) setCreating(false);
                      else setEditingAccount(null);
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-2 flex items-center justify-between text-sm text-gray-600 bg-white border-t border-green-50">
        <div>
          Records per page: <span className="font-medium">10</span>
          <svg className="inline w-3 h-3 ml-1" viewBox="0 0 20 20" fill="currentColor"><path d="M5 8h10L10 13 5 8z" /></svg>
        </div>
        <div>
          1-10 of {filteredAccounts.length}
          <button className="mx-2 text-sibol-green hover:underline">&lt;&lt;</button>
          <button className="mx-1 text-sibol-green hover:underline">&lt;</button>
          <button className="mx-1 text-sibol-green hover:underline">&gt;</button>
          <button className="mx-1 text-sibol-green hover:underline">&gt;&gt;</button>
        </div>
      </div>
    </>
  );
}