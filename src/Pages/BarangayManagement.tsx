import React, { useEffect, useState, useRef } from 'react';
import SuperAdminHeader from '../Components/SuperAdminHeader';
import SnackBar from '../Components/common/SnackBar';
import ConfirmationModal from '../Components/common/ConfirmationModal';
import {
    fetchBarangays,
    fetchAvailableBarangays,
    fetchInactiveBarangays,
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
    const [inactiveBarangays, setInactiveBarangays] = useState<Barangay[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedBarangay, setSelectedBarangay] = useState<Barangay | AvailableBarangay | null>(null);
    const suggestionsRef = useRef<HTMLDivElement>(null);

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
            const [active, available, inactive] = await Promise.all([
                fetchBarangays(),
                fetchAvailableBarangays(),
                fetchInactiveBarangays(),
            ]);
            setActiveBarangays(active);
            setAvailableBarangays(available);
            setInactiveBarangays(inactive);
        } catch (error: any) {
            showSnack(error.message || 'Failed to load barangays', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Handle input validation (4 digits, numbers only)
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Allow only numbers
        value = value.replace(/[^0-9]/g, '');

        // Limit to 4 digits
        if (value.length > 4) {
            value = value.slice(0, 4);
        }

        setInputValue(value);
        setShowSuggestions(value.length > 0);
    };

    const handleInputBlur = () => {
        setTimeout(() => setShowSuggestions(false), 200);
    };

    const handleInputFocus = () => {
        if (inputValue.length > 0) {
            setShowSuggestions(true);
        }
    };

    // Get filtered suggestions
    const getSuggestions = () => {
        if (!inputValue) return [];

        const inputNum = parseInt(inputValue, 10);
        const suggestions = [];

        // Check active barangays
        const activeMatch = activeBarangays.find(
            (b) => b.Barangay_id === inputNum ||
                   b.Barangay_Name.toLowerCase().includes(inputValue.toLowerCase())
        );
        if (activeMatch) {
            suggestions.push({ ...activeMatch, status: 'active' as const });
        }

        // Check inactive barangays
        const inactiveMatch = inactiveBarangays.find(
            (b) => b.Barangay_id === inputNum ||
                   b.Barangay_Name.toLowerCase().includes(inputValue.toLowerCase())
        );
        if (inactiveMatch) {
            suggestions.push({ ...inactiveMatch, status: 'inactive' as const });
        }

        // Check available barangays
        const availableMatch = availableBarangays.find(
            (b) => b.barangayId === inputNum ||
                   b.barangayName.toLowerCase().includes(inputValue.toLowerCase())
        );
        if (availableMatch) {
            suggestions.push({ ...availableMatch, status: 'available' as const });
        }

        return suggestions;
    };

    const suggestions = getSuggestions();

    const handleSelectSuggestion = (suggestion: any) => {
        const isActive = 'IsActive' in suggestion;
        setSelectedBarangay(suggestion);
        setInputValue(
            isActive
                ? String(suggestion.Barangay_id).padStart(4, '0')
                : String(suggestion.barangayId).padStart(4, '0')
        );
        setShowSuggestions(false);
    };

    const getBarangayStatus = (barangay: any) => {
        if ('IsActive' in barangay) {
            return barangay.IsActive === 1 ? 'active' : 'inactive';
        }
        return 'available';
    };

    const handleActivate = (barangayId: number, barangayName: string) => {
        setConfirmModal({
            isOpen: true,
            title: 'Activate Barangay',
            description: `Are you sure you want to activate ${barangayName}? This will also reactivate all admins previously assigned to this barangay.`,
            action: 'activate',
            barangayId,
            barangayName,
        });
    };

    const handleDeactivate = (barangayId: number, barangayName: string) => {
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
                const result = await activateBarangay(barangayId);
                const adminCount = result.reactivatedAdminCount || 0;
                if (adminCount > 0) {
                    showSnack(
                        `${barangayName} activated successfully. ${adminCount} admin(s) also reactivated.`,
                        'success'
                    );
                } else {
                    showSnack(`${barangayName} activated successfully`, 'success');
                }
            } else {
                const result = await deactivateBarangay(barangayId);
                const adminCount = result.deactivatedAdminCount || 0;
                showSnack(
                    `${barangayName} deactivated successfully. ${adminCount} admin(s) also deactivated.`,
                    'success'
                );
            }

            await loadData();
            setSelectedBarangay(null);
            setInputValue('');
            setConfirmModal({ ...confirmModal, isOpen: false });
        } catch (error: any) {
            showSnack(error.message || 'Action failed', 'error');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <>
            <SuperAdminHeader />
            <div className="w-full">
                {/* Spacer to avoid header overlap */}
                <div style={{ height: 'calc(var(--header-height, 72px) + 8px)' }} aria-hidden />

                {/* Main Content */}
                <div className="w-full mt-3">
                    <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">
                        {/* Page Header */}
                        <div className="mb-8">
                            <h1 className="text-2xl sm:text-3xl font-bold text-sibol-green">
                                Barangay Management
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                View active barangays on the left. Search and manage barangays on the right.
                            </p>
                        </div>

                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sibol-green"></div>
                                <p className="text-gray-600 mt-2">Loading barangays...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                                {/* LEFT COLUMN - Active Barangays Table */}
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Barangays ({activeBarangays.length})</h2>
                                    <div className="relative w-full rounded-lg border border-[#00001A4D] bg-white shadow-sm overflow-hidden max-h-96 overflow-y-auto">
                                        <table className="w-full text-sm">
                                            <thead className="bg-[#355E3B] text-white sticky top-0">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-semibold">Barangay ID</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Barangay Name</th>
                                                    <th className="px-4 py-3 text-left font-semibold">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[#00001A4D]">
                                                {activeBarangays.length === 0 ? (
                                                    <tr>
                                                        <td colSpan={3} className="text-center py-8 text-gray-500">
                                                            No active barangays found
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    activeBarangays.map((barangay) => (
                                                        <tr key={barangay.Barangay_id} className="hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-sm text-sibol-green font-medium">
                                                                {String(barangay.Barangay_id).padStart(4, '0')}
                                                            </td>
                                                            <td className="px-4 py-3 text-sm text-gray-900">
                                                                {barangay.Barangay_Name}
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
                                                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full border bg-red-600 text-white border-red-500 hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <FaTrash size={10} />
                                                                    Deactivate
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* RIGHT COLUMN - Search and Details */}
                                <div className="space-y-6">
                                    {/* Search Input with Suggestions */}
                                    <div>
                                        <label className="block text-lg font-semibold text-gray-900 mb-4">
                                            Search by Barangay ID or Name
                                        </label>
                                        <div className="relative">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    placeholder="Enter 4-digit barangay ID (0001-9999) or name"
                                                    value={inputValue}
                                                    onChange={handleInputChange}
                                                    onFocus={handleInputFocus}
                                                    onBlur={handleInputBlur}
                                                    maxLength={4}
                                                    className="w-full px-4 py-3 border border-[#00001A4D] rounded-lg focus:outline-none focus:ring-2 focus:ring-sibol-green focus:border-transparent text-sm"
                                                />
                                                <svg
                                                    className="absolute right-3 top-3.5 w-4 h-4 text-gray-400"
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

                                            {/* Suggestions Dropdown */}
                                            {showSuggestions && suggestions.length > 0 && (
                                                <div
                                                    ref={suggestionsRef}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#00001A4D] rounded-lg shadow-lg z-10 max-h-64 overflow-y-auto"
                                                >
                                                    {suggestions.map((suggestion, idx) => {
                                                        const id = 'Barangay_id' in suggestion ? suggestion.Barangay_id : suggestion.barangayId;
                                                        const name = 'Barangay_Name' in suggestion ? suggestion.Barangay_Name : suggestion.barangayName;
                                                        const status = 'IsActive' in suggestion ? (suggestion.IsActive === 1 ? 'active' : 'inactive') : 'available';

                                                        return (
                                                            <button
                                                                key={idx}
                                                                onClick={() => handleSelectSuggestion(suggestion)}
                                                                className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                                                            >
                                                                <div className="flex items-center justify-between">
                                                                    <div>
                                                                        <div className="font-medium text-gray-900">ID: {String(id).padStart(4, '0')}</div>
                                                                        <div className="text-sm text-gray-600">{name}</div>
                                                                    </div>
                                                                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                                                        status === 'active'
                                                                            ? 'bg-green-100 text-green-700'
                                                                            : status === 'inactive'
                                                                            ? 'bg-red-100 text-red-700'
                                                                            : 'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                        {status === 'active' && <FaCheckCircle size={10} />}
                                                                        {status === 'inactive' && <FaTimesCircle size={10} />}
                                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                                    </span>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {showSuggestions && inputValue && suggestions.length === 0 && (
                                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#00001A4D] rounded-lg shadow-lg p-4 text-center text-gray-500 text-sm">
                                                    No barangays found matching your search
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-2">
                                            ✓ Numbers only (0-9) • ✓ Maximum 4 digits
                                        </p>
                                    </div>

                                    {/* Selected Barangay Details */}
                                    {selectedBarangay && (
                                        <div className="bg-gray-50 rounded-lg border border-[#00001A4D] p-6">
                                            <div className="flex items-center justify-between mb-4">
                                                <div>
                                                    <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide">Barangay ID</p>
                                                    <p className="text-2xl font-bold text-sibol-green">
                                                        {('Barangay_id' in selectedBarangay ? selectedBarangay.Barangay_id : selectedBarangay.barangayId).toString().padStart(4, '0')}
                                                    </p>
                                                </div>
                                                <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold ${
                                                    getBarangayStatus(selectedBarangay) === 'active'
                                                        ? 'bg-green-100 text-green-700'
                                                        : getBarangayStatus(selectedBarangay) === 'inactive'
                                                        ? 'bg-red-100 text-red-700'
                                                        : 'bg-blue-100 text-blue-700'
                                                }`}>
                                                    {getBarangayStatus(selectedBarangay) === 'active' && <FaCheckCircle />}
                                                    {getBarangayStatus(selectedBarangay) === 'inactive' && <FaTimesCircle />}
                                                    {getBarangayStatus(selectedBarangay) === 'active' && 'Active'}
                                                    {getBarangayStatus(selectedBarangay) === 'inactive' && 'Inactive'}
                                                    {getBarangayStatus(selectedBarangay) === 'available' && 'Available'}
                                                </span>
                                            </div>
                                            <div className="mb-6">
                                                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wide mb-1">Name</p>
                                                <p className="text-lg text-gray-900">
                                                    {'Barangay_Name' in selectedBarangay ? selectedBarangay.Barangay_Name : selectedBarangay.barangayName}
                                                </p>
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-3">
                                                {(getBarangayStatus(selectedBarangay) === 'available' || getBarangayStatus(selectedBarangay) === 'inactive') && (
                                                    <button
                                                        onClick={() =>
                                                            handleActivate(
                                                                'barangayId' in selectedBarangay ? selectedBarangay.barangayId : selectedBarangay.Barangay_id,
                                                                'barangayName' in selectedBarangay ? selectedBarangay.barangayName : selectedBarangay.Barangay_Name
                                                            )
                                                        }
                                                        disabled={actionLoading}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-sibol-green text-white border border-sibol-green/70 hover:bg-sibol-green/90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sibol-green/40 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaPlus size={16} />
                                                        Activate
                                                    </button>
                                                )}

                                                {getBarangayStatus(selectedBarangay) === 'active' && (
                                                    <button
                                                        onClick={() =>
                                                            handleDeactivate(
                                                                'Barangay_id' in selectedBarangay ? selectedBarangay.Barangay_id : selectedBarangay.barangayId,
                                                                'Barangay_Name' in selectedBarangay ? selectedBarangay.Barangay_Name : selectedBarangay.barangayName
                                                            )
                                                        }
                                                        disabled={actionLoading}
                                                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 text-white border border-red-500 hover:bg-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-400 hover:shadow-md active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <FaTrash size={16} />
                                                        Deactivate
                                                    </button>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setSelectedBarangay(null);
                                                        setInputValue('');
                                                    }}
                                                    className="px-4 py-2 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                                                >
                                                    Clear
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
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
