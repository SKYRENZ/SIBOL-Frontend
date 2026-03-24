    import { useEffect, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../store/store';
import {
    fetchSuperAdminData,
    createAdminAccount,
    updateAdminAccount,
    toggleAdminAccountActive,
} from '../store/slices/superAdminSlice';

import AdminList from '../Components/admin/AdminList';
import AdminForm from '../Components/admin/AdminForm';
import { Account } from '../types/adminTypes';
import SuperAdminHeader from '../Components/SuperAdminHeader';
import SnackBar from '../Components/common/SnackBar';

function getRoleNumber(user: any): number | null {
    const role =
        user?.Roles ??
        user?.roleId ??
        user?.role ??
        user?.Roles_id ??
        user?.RolesId ??
        null;

    const n = typeof role === 'string' ? Number(role) : role;
    return Number.isFinite(n) ? (n as number) : null;
}

export default function SuperAdmin() {
    const dispatch = useDispatch<AppDispatch>();
    const {
        accounts,
        roles,
        barangays,
        status,
        error,
    } = useSelector((state: RootState) => state.superadmin);

    const user = useSelector((state: RootState) => state.auth.user);
    const userRole = getRoleNumber(user);
    const isAdminRole = userRole === 1;

    // Fetch data on component mount (SuperAdmin only)
    useEffect(() => {
        if (isAdminRole) return;
        if (status === 'idle') {
            dispatch(fetchSuperAdminData());
        }
    }, [status, dispatch, isAdminRole]);

    const [editingAccount, setEditingAccount] = useState<Account | null>(null);
    const [creating, setCreating] = useState(false);

    // snackbar state
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
        dispatch(createAdminAccount(p))
            .unwrap()
            .then(() => {
                setCreating(false);
                dispatch(fetchSuperAdminData());
                showSnack('Admin created.', 'success');
            })
            .catch((err: any) => showSnack(err?.message ?? 'Create failed', 'error'));
    };

    const onUpdate = async (p: Partial<Account>) => {
        if (!editingAccount?.Account_id) return;
        dispatch(updateAdminAccount({ accountId: editingAccount.Account_id, updates: p }))
            .unwrap()
            .then(() => {
                setEditingAccount(null);
            dispatch(fetchSuperAdminData());
                showSnack('Admin updated.', 'success');
            })
            .catch((err: any) => showSnack(err?.message ?? 'Update failed', 'error'));
    };

    const onToggleActive = async (a: Account) => {
        if (!a.Account_id) return;
        const newIsActive = a.IsActive === 1 ? false : true;
        dispatch(toggleAdminAccountActive({ accountId: a.Account_id, isActive: newIsActive }))
            .unwrap()
            .then(() => {
                dispatch(fetchSuperAdminData());
                showSnack(`Account ${newIsActive ? 'enabled' : 'disabled'}.`, 'success');
            })
            .catch((err: any) => showSnack(err?.message ?? 'Toggle active failed', 'error'));
    };
    const loading = status === 'loading';

    const initialData = useMemo(() => (editingAccount ? editingAccount : {}), [editingAccount]);

    return (
        <>
            <SuperAdminHeader />
            <div className="w-full">
                {/* spacer to avoid header overlap */}
                <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />

                {!isAdminRole ? (
                    <>
                        {/* MAIN CONTENT */}
                        <div className="w-full mt-3">
                            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

                                {loading && <div className="text-sm text-gray-600">Loading...</div>}
                                {error && <div className="text-sm text-red-500">{error}</div>}

                                <>
                                    <div className="overflow-x-auto">
                                        <AdminList
                                            accounts={accounts}
                                            barangays={barangays}
                                            roles={roles}
                                            onEdit={(a) => setEditingAccount(a)}
                                            onToggleActive={onToggleActive}
                                            onCreate={() => setCreating(true)}
                                            adminOnly={true}
                                        />
                                    </div>
                                </>

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
                                                maxHeight: 'calc(100vh - var(--header-height, 72px) - 20px)',
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
                                                barangays={barangays}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Page snackbar */}
                        <SnackBar
                            key={snackKey}
                            visible={snack.visible}
                            message={snack.message}
                            type={snack.type}
                            onDismiss={dismissSnack}
                        />
                    </>
                ) : (
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                        <h1 className="text-2xl sm:text-3xl font-bold text-sibol-green">Admin User Management</h1>
                        <p className="mt-2 text-sm text-gray-500">This page is for super admin only.</p>
                    </div>
                )}
            </div>
        </>
    );
}
