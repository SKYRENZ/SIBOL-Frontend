import { useEffect, useMemo, useState } from 'react';
import useAdmin from '../hooks/admin/useAdmin';
import AdminList from '../Components/admin/AdminList';
import AdminForm from '../Components/admin/AdminForm';
import UserApproval from '../Components/admin/UserApproval';
import AdminControls from '../Components/admin/AdminControls';
import { Account } from '../types/Types';
import Header from '../Components/Header';
import { fetchPendingAccounts } from '../services/adminService'; // adjust path if needed
import Pagination from '../Components/common/Pagination';

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
    // pass hook data to components
    roles,
    modules,
    barangays,
  } = useAdmin();

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'approval'>('list');

  // Global UI controls
  const [globalQuery, setGlobalQuery] = useState('');
  // roleFilter now stores role id (from user_roles_tbl) or 'all'
  const [roleFilter, setRoleFilter] = useState<number | 'all'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

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

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredAccounts.length / pageSize) || 1),
    [filteredAccounts.length, pageSize],
  );

  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [globalQuery, roleFilter]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

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
      // The hook's updateAccount expects (accountId: number, updates: Partial<Account>)
      await updateAccount(editingAccount.Account_id, p);

      // temporary: ensure UI reflects backend by reloading accounts — replace with proper refetch in the hook
      // quick-and-dirty: reload the page so list shows DB state immediately
      window.location.reload();

      // setEditingAccount(null); // not needed because we reload
    } catch (err: any) {
      alert(err?.message ?? 'Update failed');
    }
  };

  // use the hook's toggleAccountActive(accountId, isActive) signature
  const onToggleActive = async (a: Account) => {
    if (!a.Account_id) return;
    try {
      // Pass accountId and the new isActive state (toggle from current) as boolean
      await toggleAccountActive(a.Account_id, a.IsActive === 1 ? false : true);
    } catch (err: any) {
      alert(err?.message ?? 'Toggle active failed');
    }
  };

  // Accept/Approve expects an Account (or id) — keep similar but use hook properly
  const onAccept = async (a: Account) => {
    const pendingId = (a as any).Pending_id;
    if (!pendingId) return;
    if (!confirm(`Approve account for ${a.Username ?? a.Email ?? 'this user'}?`)) return;
    try {
      await approveAccount(Number(pendingId));
      // keep badge in sync immediately (pessimistic update)
      setPendingCount((c) => Math.max(0, c - 1));
      alert('Account approved');
    } catch (err: any) {
      alert(err?.message ?? 'Approve failed');
    }
  };

  const onReject = async (a: Account) => {
    const pendingId = (a as any).Pending_id;
    if (!pendingId) return;
    const reason = prompt('Reason for rejection (optional)', '') ?? undefined;
    if (!confirm(`Reject account for ${a.Username ?? a.Email ?? 'this user'}?`)) return;
    try {
      await rejectAccount(Number(pendingId), reason);
      // decrement badge locally
      setPendingCount((c) => Math.max(0, c - 1));
      alert('Account rejected');
    } catch (err: any) {
      alert(err?.message ?? 'Reject failed');
    }
  };

  const [pendingCount, setPendingCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const pending = await fetchPendingAccounts();
        if (!mounted) return;
        setPendingCount(Array.isArray(pending) ? pending.length : 0);
      } catch {
        if (!mounted) return;
        setPendingCount(0);
      }
    })();
    return () => { mounted = false; };
  }, []);

  // In the Admin component
  const initialData = useMemo(() => (editingAccount ? editingAccount : {}), [editingAccount]); // Stable for create mode

  return (
    <>
      <Header />
      {/* make white background touch the header by using a full-bleed white wrapper
          and a spacer equal to the header height so content stays below the fixed header */}
      <div className="w-full bg-white">
        <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />
        <div
          className="subheader sticky top-[60px] z-30 w-full bg-white px-6 py-4 shadow-sm"
          style={{ top: 'calc(var(--header-height, 72px) + 8px)' }}
        >
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <nav className="flex items-center gap-5" role="tablist" aria-label="Admin tabs">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'list'}
                onClick={() => setActiveTab('list')}
                className={`text-xl px-4 py-2 font-medium bg-transparent appearance-none focus:outline-none focus:ring-0 shadow-none transition-colors duration-150
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
                className={`flex items-center gap-2 text-xl px-4 py-2 font-medium bg-transparent appearance-none focus:outline-none focus:ring-0 shadow-none transition-colors duration-150
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
              <>
                <AdminList
                  accounts={paginatedAccounts}
                  barangays={barangays}
                  roles={roles}
                  onEdit={(a) => setEditingAccount(a)}
                  onToggleActive={onToggleActive}
                />
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  pageSize={pageSize}
                  totalItems={filteredAccounts.length}
                  onPageSizeChange={(newSize) => {
                    setPageSize(newSize);
                    setCurrentPage(1);
                  }}
                  fixed={false}
                />
              </>
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
                    mode={creating ? 'create' : 'edit'}
                    onSubmit={creating ? onCreate : onUpdate}
                    onCancel={() => {
                      if (creating) setCreating(false);
                      else setEditingAccount(null);
                    }}
                    roles={roles}
                    modules={modules}
                    barangays={barangays}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}