import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
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
import SuperAdminHeader from '../Components/SuperAdminHeader';
import SnackBar from '../Components/common/SnackBar';

export default function Admin() {
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();
  const {
    accounts,
    pendingAccounts,
    roles,
    barangays,
    status,
    error,
  } = useSelector((state: RootState) => state.admin);
  const { user } = useSelector((state: RootState) => state.auth);

  // Fetch data on component mount
  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAdminData(user?.Barangay_id));
    }
  }, [status, dispatch, user?.Barangay_id]);

  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [creating, setCreating] = useState(false);

  // Get tab from query parameter or default to 'list'
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'list' | 'approval'>(() => {
    if (tabParam === 'list' || tabParam === 'approval') {
      return tabParam;
    }
    return 'list';
  });

  // Update activeTab when query parameter changes
  useEffect(() => {
    if (tabParam === 'list' || tabParam === 'approval') {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Initialize allAccounts with fetched accounts
  useEffect(() => {
    if (accounts.length > 0) {
      setAllAccounts(accounts);
    }
  }, [accounts]);

  // Update hasMore based on whether we have more accounts to show
  useEffect(() => {
    const totalShown = Math.min(currentPage * pageSize, allAccounts.length);
    setHasMore(totalShown < allAccounts.length);
  }, [currentPage, allAccounts.length]);

  const loadMoreAccounts = async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    
    // Simulate loading delay
    setTimeout(() => {
      setCurrentPage(prev => prev + 1);
      setLoadingMore(false);
    }, 1000);
  };

  // Get the accounts to display (paginated for infinite scroll)
  const displayedAccounts = allAccounts.slice(0, currentPage * pageSize);

  // ✅ snackbar state (page-level, so it persists even when modals close)
  const [snackKey, setSnackKey] = useState(0);
  const [snack, setSnack] = useState<{
    visible: boolean;
    message: string;
    type: 'error' | 'success' | 'info';
  }>({ visible: false, message: '', type: 'info' });

  const showSnack = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    setSnackKey((k) => k + 1);
    setSnack({ visible: true, message, type });
  };

  const dismissSnack = () => setSnack((s) => ({ ...s, visible: false }));

  // UI-level slim wrappers (network handled in Redux)
  const onCreate = async (p: Partial<Account>) => {
    dispatch(createAccount(p))
      .unwrap()
      .then(() => {
        setCreating(false);
        dispatch(fetchAdminData(user?.Barangay_id));
        showSnack('User created.', 'success'); // ✅
      })
      .catch((err: any) => showSnack(err?.message ?? 'Create failed', 'error')); // ✅ (removed alert)
  };

  const onUpdate = async (p: Partial<Account>) => {
    if (!editingAccount?.Account_id) return;
    dispatch(updateAccount({ accountId: editingAccount.Account_id, updates: p }))
      .unwrap()
      .then(() => {
        setEditingAccount(null);
        dispatch(fetchAdminData(user?.Barangay_id));
        showSnack('Admin updated.', 'success'); // ✅
      })
      .catch((err: any) => showSnack(err?.message ?? 'Update failed', 'error')); // ✅
  };

  // use the hook's toggleAccountActive(accountId, isActive) signature
  const onToggleActive = async (a: Account) => {
    if (!a.Account_id) return;
    const newIsActive = a.IsActive === 1 ? false : true;
    dispatch(toggleAccountActive({ accountId: a.Account_id, isActive: newIsActive }))
      .unwrap()
      .then(() => {
        dispatch(fetchAdminData(user?.Barangay_id));
        showSnack(`Account ${newIsActive ? 'enabled' : 'disabled'}.`, 'success'); // ✅
      })
      .catch((err: any) => showSnack(err?.message ?? 'Toggle active failed', 'error')); // ✅
  };

  // Accept/Approve expects an Account (or id) — keep similar but use hook properly
  const onAccept = async (a: Account) => {
    const pendingId = (a as any).Pending_id;
    if (!pendingId) return;
    dispatch(approvePendingAccount(Number(pendingId)))
      .unwrap()
      .then(() => {
        dispatch(fetchAdminData(user?.Barangay_id));
        showSnack('Account approved.', 'success'); // ✅ (removed alert)
      })
      .catch((err) => showSnack(err?.message ?? 'Approve failed', 'error')); // ✅
  };

  const onReject = async (a: Account, reason?: string) => {
    const pendingId = (a as any).Pending_id;
    if (!pendingId) return;
    dispatch(rejectPendingAccount({ pendingId: Number(pendingId), reason }))
      .unwrap()
      .then(() => {
        dispatch(fetchAdminData(user?.Barangay_id));
        showSnack('Account rejected.', 'success'); // ✅ (removed alert)
      })
      .catch((err) => showSnack(err?.message ?? 'Reject failed', 'error')); // ✅
  };

  const pendingCount = pendingAccounts.length;
  const loading = status === 'loading';
  const adminBarangayId = user?.Barangay_id ? Number(user.Barangay_id) : undefined;
  const createRoles = useMemo(() => {
    const picked = roles.filter((r) => {
      const name = String(r.Roles || '').toLowerCase();
      return (
        name.includes('operator') ||
        (name.includes('barangay') && (name.includes('staff') || name.includes('official')))
      );
    });
    return picked.length > 0 ? picked : roles.filter((r) => Number(r.Roles_id) === 2 || Number(r.Roles_id) === 3);
  }, [roles]);

  // In the Admin component
  const initialData = useMemo(() => (editingAccount ? editingAccount : {}), [editingAccount]); // Stable for create/edit mode

  return (
    <>
      <SuperAdminHeader />
      <div className="w-full bg-white">
        {/* spacer to avoid header overlap */}
        <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />

        {/* MAIN CONTENT */}
        <div className="w-full bg-white mt-3">
          <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

            {loading && <div className="text-sm text-gray-600">Loading...</div>}
            {error && <div className="text-sm text-red-500">{error}</div>}

            {activeTab === 'list' && (
              <>
                <div className="overflow-x-auto">
                  <AdminList
                    accounts={displayedAccounts}
                    barangays={barangays}
                    roles={roles}
                    onEdit={(a) => setEditingAccount(a)}
                    onToggleActive={onToggleActive}
                    onCreate={() => setCreating(true)}
                    hasMore={hasMore}
                    loading={loadingMore}
                    onLoadMore={loadMoreAccounts}
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
                    roles={creating ? createRoles : roles}
                    barangays={barangays}
                    lockedBarangayId={creating ? adminBarangayId : undefined}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Page snackbar (removes all browser alerts) */}
      <SnackBar
        key={snackKey}
        visible={snack.visible}
        message={snack.message}
        type={snack.type}
        onDismiss={dismissSnack}
      />
    </>
  );
}
