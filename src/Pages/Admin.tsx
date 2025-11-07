import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import {
  fetchAdminData,
  approvePendingAccount,
  rejectPendingAccount,
  createAccount,
  updateAccount,
  toggleAccountActive,
} from '../store/slices/adminSlice';

import AdminList from '../Components/admin/AdminList';
import AdminForm from '../Components/admin/AdminForm';
import UserApproval from '../Components/admin/UserApproval';
import { Account } from '../types/adminTypes';
import Header from '../Components/Header';
import Pagination from '../Components/common/Pagination';

export default function Admin() {
  const dispatch = useDispatch<AppDispatch>();
  const {
    accounts,
    pendingAccounts,
    roles,
    modules,
    barangays,
    status,
    error,
  } = useSelector((state: RootState) => state.admin);

  // Fetch data on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAdminData());
    }
  }, [status, dispatch]);

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<'list' | 'approval'>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalPages = useMemo(
    () => Math.max(1, Math.ceil(accounts.length / pageSize) || 1),
    [accounts.length, pageSize]
  );

  const paginatedAccounts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return accounts.slice(start, start + pageSize);
  }, [accounts, currentPage, pageSize]);

  useEffect(() => setCurrentPage((prev) => Math.min(prev, totalPages)), [totalPages]);

  // UI-level slim wrappers (network handled in Redux)
  const onCreate = async (p: Partial<Account>) => {
    dispatch(createAccount(p))
      .unwrap()
      .then(() => {
        setCreating(false);
        dispatch(fetchAdminData()); // Refetch to ensure list is perfectly in sync
      })
      .catch((err: any) => alert(err?.message ?? 'Create failed'));
  };

  // Pass payload object with Account_id (useAdmin.updateAccount expects a payload)
  const onUpdate = async (p: Partial<Account>) => {
    if (!editingAccount?.Account_id) return;
    dispatch(updateAccount({ accountId: editingAccount.Account_id, updates: p }))
      .unwrap()
      .then(() => {
        setEditingAccount(null);
        dispatch(fetchAdminData()); // Refetch to ensure list is perfectly in sync
      })
      .catch((err: any) => alert(err?.message ?? 'Update failed'));
  };

  // use the hook's toggleAccountActive(accountId, isActive) signature
  const onToggleActive = async (a: Account) => {
    if (!a.Account_id) return;
    const newIsActive = a.IsActive === 1 ? false : true;
    dispatch(toggleAccountActive({ accountId: a.Account_id, isActive: newIsActive }))
      .unwrap()
      .then(() => {
        // The list will update automatically from the reducer, but a refetch is safer
        dispatch(fetchAdminData());
      })
      .catch((err: any) => alert(err?.message ?? 'Toggle active failed'));
  };

  // Accept/Approve expects an Account (or id) — keep similar but use hook properly
  const onAccept = async (a: Account) => {
    const pendingId = (a as any).Pending_id;
    if (!pendingId) return;
    if (!confirm(`Approve account for ${a.Username ?? a.Email ?? 'this user'}?`)) return;
    dispatch(approvePendingAccount(Number(pendingId)))
      .unwrap()
      .then(() => {
        alert('Account approved');
        dispatch(fetchAdminData()); // Refetch all data to update lists
      })
      .catch((err) => alert(err?.message ?? 'Approve failed'));
  };

  const onReject = async (a: Account) => {
    const pendingId = (a as any).Pending_id;
    if (!pendingId) return;
    const reason = prompt('Reason for rejection (optional)', '') ?? undefined;
    if (!confirm(`Reject account for ${a.Username ?? a.Email ?? 'this user'}?`)) return;
    dispatch(rejectPendingAccount({ pendingId: Number(pendingId), reason }))
      .unwrap()
      .then(() => alert('Account rejected'))
      .catch((err) => alert(err?.message ?? 'Reject failed'));
  };

  const pendingCount = pendingAccounts.length;
  const loading = status === 'loading';

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
                    totalItems={accounts.length} // UPDATE to use `accounts.length`
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
                <UserApproval 
                  accounts={pendingAccounts} 
                  onAccept={onAccept} 
                  onReject={onReject} 
                  loading={loading}
                  error={error}
                />
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
