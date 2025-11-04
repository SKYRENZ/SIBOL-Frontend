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
      if (roleFilter !== 'all' && a.Roles !== roleFilter) return false;
      if (!q) return true;
      return `${a.Username ?? a.FirstName ?? ''} ${a.LastName ?? ''} ${a.Email ?? ''}`
        .toLowerCase()
        .includes(q);
    });
  }, [accounts, globalQuery, roleFilter]);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(filteredAccounts.length / pageSize) || 1),
    [filteredAccounts.length, pageSize]
  );

  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredAccounts.slice(start, start + pageSize);
  }, [filteredAccounts, currentPage, pageSize]);

  useEffect(() => setCurrentPage(1), [globalQuery, roleFilter]);
  useEffect(() => setCurrentPage((prev) => Math.min(prev, totalPages)), [totalPages]);

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
      <div className="w-full bg-white">
        {/* spacer to avoid header overlap */}
        <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />

        {/* SUBHEADER */}
        <div
          className="subheader sticky z-30 w-full bg-white px-4 sm:px-6 py-3 sm:py-4 shadow-sm"
          style={{ top: 'calc(var(--header-height, 72px) + 8px)' }}
        >
          <div className="max-w-screen-2xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            {/* Tabs */}
            <nav
              className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-5"
              role="tablist"
              aria-label="Admin tabs"
            >
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'list'}
                onClick={() => setActiveTab('list')}
                className={`text-lg sm:text-xl px-3 sm:px-4 py-2 font-medium bg-transparent transition-colors duration-150
                ${
                  activeTab === 'list'
                    ? 'text-sibol-green font-semibold underline underline-offset-4'
                    : 'text-sibol-green/70 hover:font-semibold hover:text-sibol-green'
                }`}
              >
                List of Accounts
              </button>

              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'approval'}
                onClick={() => setActiveTab('approval')}
                className={`flex items-center gap-2 text-lg sm:text-xl px-3 sm:px-4 py-2 font-medium bg-transparent transition-colors duration-150
                ${
                  activeTab === 'approval'
                    ? 'text-sibol-green font-semibold underline underline-offset-4'
                    : 'text-sibol-green/70 hover:font-semibold hover:text-sibol-green'
                }`}
              >
                User Approval
                <span className="chip chip-rose ml-1 text-xs">{pendingCount}</span>
              </button>
            </nav>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="w-full bg-white mt-3">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Controls (Search + Filter) */}
            <div className="mb-4">
              <AdminControls
                globalQuery={globalQuery}
                setGlobalQuery={setGlobalQuery}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                onReset={() => { /* nothing extra for now */ }}                
                onCreate={() => setCreating(true)}
              />
            </div>

            {loading && <div className="text-sm text-gray-600">Loading...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}

            {activeTab === 'list' && (
              <>
                <div className="overflow-x-auto">
                  <AdminList
                    accounts={paginatedAccounts}
                    barangays={barangays}
                    roles={roles}
                    onEdit={(a) => setEditingAccount(a)}
                    onToggleActive={onToggleActive}
                  />
                </div>

                <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
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
                </div>
              </>
            )}

            {activeTab === 'approval' && (
              <div className="overflow-x-auto">
                <UserApproval onAccept={onAccept} onReject={onReject} />
              </div>
            )}

            {/* Modal (Create/Edit) */}
            {(creating || editingAccount) && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 sm:px-6">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/40"
                onClick={() => {
                  if (creating) setCreating(false);
                  if (editingAccount) setEditingAccount(null);
                }}
              />

              {/* Panel */}
              <div
                className="relative w-full max-w-md sm:max-w-2xl bg-white rounded-2xl shadow-xl 
                p-5 sm:p-8 text-sm text-[#3D5341] overflow-y-auto"
                style={{
                  maxHeight: 'calc(100vh - var(--header-height, 72px) - 20px)', // prevents overlapping header
                  marginTop: 'calc(var(--header-height, 72px) + 10px)',
                  marginBottom: '10px',
                }}
              >
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
