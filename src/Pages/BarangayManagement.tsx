import React, { useEffect, useState } from 'react';
import SuperAdminHeader from '../Components/SuperAdminHeader';
import SnackBar from '../Components/common/SnackBar';
import ConfirmationModal from '../Components/common/ConfirmationModal';
import {
    fetchBarangays,
    fetchAvailableBarangays,
    activateBarangay,
    deactivateBarangay
} from '../services/superAdminService';
import { FaCheckCircle, FaTimesCircle, FaPlus, FaTrash } from 'react-icons/fa';

type Barangay = {
    Barangay_id: number;
    Barangay_Name: string;
    IsActive?: number;
};

type AvailableBarangay = {
    barangayId: number;
    barangayName: string;
};

const BarangayManagement: React.FC = () => {
    const [activeBarangays, setActiveBarangays] = useState<Barangay[]>([]);
    const [availableBarangays, setAvailableBarangays] = useState<AvailableBarangay[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<'active' | 'available'>('active');

    // Snackbar state
    const [snackKey, setSnackKey] = useState(0);
    const [snack, setSnack] = useState<{
        visible: boolean;
        message: string;
        type: 'error' | 'success' | 'info';
    }>({ visible: false, message: '', type: 'info' });

    // Confirmation modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        action: 'activate' | 'deactivate';
        barangayId: number;
        barangayName: string;
    }>({
        isOpen: false,
        title: '',
        description: '',
        action: 'activate',
        barangayId: 0,
        barangayName: '',
    });

    const showSnack = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
        setSnackKey((k) => k + 1);
        setSnack({ visible: true, message, type });
    };

    const dismissSnack = () => setSnack((s) => ({ ...s, visible: false }));

    const loadData = async () => {
        try {
            setLoading(true);
            const [active, available] = await Promise.all([
                fetchBarangays(),
                fetchAvailableBarangays(),
            ]);
            setActiveBarangays(active);
            setAvailableBarangays(available);
        } catch (error: any) {
            showSnack(error.message || 'Failed to load barangays', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleActivate = async (barangayId: number, barangayName: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Activate Barangay',
            description: `Are you sure you want to activate ${barangayName}? This will add it to the active barangays list.`,
            action: 'activate',
            barangayId,
            barangayName,
        });
    };

    const handleDeactivate = async (barangayId: number, barangayName: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Deactivate Barangay',
            description: `Are you sure you want to deactivate ${barangayName}? This will also deactivate all admins assigned to this barangay.`,
            action: 'deactivate',
            barangayId,
            barangayName,
        });
    };

    const executeAction = async () => {
        try {
            setActionLoading(true);
            const { action, barangayId, barangayName } = confirmModal;

            if (action === 'activate') {
                await activateBarangay(barangayId);
                showSnack(`${barangayName} activated successfully`, 'success');
            } else {
                const result = await deactivateBarangay(barangayId);
                const adminCount = result.deactivatedAdminCount || 0;
                showSnack(
                    `${barangayName} deactivated successfully. ${adminCount} admin(s) also deactivated.`,
                    'success'
                );
            }

            await loadData();
            setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (error: any) {
            showSnack(error.message || 'Action failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    const filteredActiveBarangays = activeBarangays.filter((b) =>
        b.Barangay_Name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredAvailableBarangays = availableBarangays.filter((b) =>
        b.barangayName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Limit available barangays to first 200 if no search term
    const displayedAvailableBarangays = searchTerm
        ? filteredAvailableBarangays
        : filteredAvailableBarangays.slice(0, 200);

    return (
        <>
            <SuperAdminHeader />
            <div className="w-full bg-white">
                {/* Spacer to avoid header overlap */}
                <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />

                {/* Main Content */}
                <div className="w-full bg-white mt-3">
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Page Header */}
                        <div className="mb-6">
                            <h1 className="text-2xl sm:text-3xl font-bold text-sibol-green">
                                Barangay Management
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Manage barangays by activating or deactivating them. Deactivating a barangay will also deactivate all admins assigned to it.
                            </p>
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-4 border-b border-gray-200">
                            <button
                                onClick={() => setActiveTab('active')}
                                className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${
                                    activeTab === 'active'
                                        ? 'text-sibol-green border-sibol-green'
                                        : 'text-gray-500 border-transparent hover:text-sibol-green'
                                }`}
                            >
                                Active Barangays ({activeBarangays.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('available')}
                                className={`px-4 py-2 font-medium text-sm transition-all duration-200 border-b-2 ${
                                    activeTab === 'available'
                                        ? 'text-sibol-green border-sibol-green'
                                        : 'text-gray-500 border-transparent hover:text-sibol-green'
                                }`}
                            >
                                Available Barangays ({searchTerm ? filteredAvailableBarangays.length : displayedAvailableBarangays.length}/{availableBarangays.length})
                            </button>
                        </div>

                        {/* Search Bar */}
                        <div className="relative mb-4 max-w-md">
                            <input
                                type="text"
                                placeholder="Search barangay..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border border-[#00001A4D] rounded-lg focus:outline-none focus:ring-2 focus:ring-sibol-green focus:border-transparent"
                            />
                            <svg
                                className="absolute left-3 top-3 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sibol-green"></div>
                                <p className="text-gray-600 mt-2">Loading barangays...</p>
                            </div>
                        )}

                        {/* Active Barangays Table */}
                        {!loading && activeTab === 'active' && (
                            <div className="relative w-full rounded-xl border border-[#00001A4D] bg-white shadow-sm overflow-hidden">
                                <table className="w-full text-sm">
                                    <thead className="bg-[#355E3B] text-white">
                                        <tr>
                                            <th className="px-4 py-3 text-left font-semibold">Barangay ID</th>
                                            <th className="px-4 py-3 text-left font-semibold">Barangay Name</th>
                                            <th className="px-4 py-3 text-left font-semibold">Status</th>
                                            <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#00001A4D]">
                                        {filteredActiveBarangays.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="text-center py-8 text-gray-500">
                                                    No active barangays found
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredActiveBarangays.map((barangay) => (
                                                <tr key={barangay.Barangay_id} className="hover:bg-gray-50">
                                                    <td className="px-4 py-3 text-sm text-sibol-green font-medium">
                                                        {barangay.Barangay_id}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm text-gray-900">
                                                        {barangay.Barangay_Name}
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                                                            <FaCheckCircle />
                                                            Active
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-sm">
                                                        <button
                                                            onClick={() =>
                                                                handleDeactivate(
                                                                    barangay.Barangay_id,
                                                                    barangay.Barangay_Name
                                                                )
                                                            }
                                                            disabled={actionLoading}
                                                            className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full border bg-red-600 text-white border-red-500 hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            <FaTrash size={12} />
                                                            Deactivate
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}

                        {/* Available Barangays Table */}
                        {!loading && activeTab === 'available' && (
                            <>
                                {/* Info message when not searching */}
                                {!searchTerm && displayedAvailableBarangays.length === 200 && (
                                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                                        Showing first 200 barangays. Use the search bar to find specific barangays.
                                    </div>
                                )}

                                <div className="relative w-full rounded-xl border border-[#00001A4D] bg-white shadow-sm overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-[#355E3B] text-white">
                                            <tr>
                                                <th className="px-4 py-3 text-left font-semibold">Barangay ID</th>
                                                <th className="px-4 py-3 text-left font-semibold">Barangay Name</th>
                                                <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-[#00001A4D]">
                                            {displayedAvailableBarangays.length === 0 ? (
                                                <tr>
                                                    <td colSpan={3} className="text-center py-8 text-gray-500">
                                                        {searchTerm
                                                            ? 'No matching barangays found'
                                                            : 'No available barangays. All barangays have been activated.'}
                                                    </td>
                                                </tr>
                                            ) : (
                                                displayedAvailableBarangays.map((barangay) => (
                                                    <tr key={barangay.barangayId} className="hover:bg-gray-50">
                                                        <td className="px-4 py-3 text-sm text-sibol-green font-medium">
                                                            {barangay.barangayId}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm text-gray-900">
                                                            {barangay.barangayName}
                                                        </td>
                                                        <td className="px-4 py-3 text-sm">
                                                            <button
                                                                onClick={() =>
                                                                    handleActivate(
                                                                        barangay.barangayId,
                                                                        barangay.barangayName
                                                                    )
                                                                }
                                                                disabled={actionLoading}
                                                                className="inline-flex items-center gap-1 px-3 py-1 text-sm font-semibold rounded-full border bg-sibol-green text-white border-sibol-green/70 hover:bg-sibol-green/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sibol-green/40 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                <FaPlus size={12} />
                                                                Activate
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onConfirm={executeAction}
                title={confirmModal.title}
                description={confirmModal.description}
                confirmText={confirmModal.action === 'activate' ? 'Activate' : 'Deactivate'}
                cancelText="Cancel"
                variant={confirmModal.action === 'activate' ? 'success' : 'danger'}
                isLoading={actionLoading}
            />

            {/* Snackbar */}
            <SnackBar
                key={snackKey}
                visible={snack.visible}
                message={snack.message}
                type={snack.type}
                onDismiss={dismissSnack}
            />
        </>
    );
};

export default BarangayManagement;
