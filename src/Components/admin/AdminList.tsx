import React, { useState, useMemo } from 'react';
import { Account } from '../../types/adminTypes';
import EndlessScroll from '../common/EndlessScroll';
import { FaTable, FaThLarge } from 'react-icons/fa';
import householdIcon from '../../assets/images/UserRoles/9.png';
import barangayStaffIcon from '../../assets/images/UserRoles/10.png';
import operatorIcon from '../../assets/images/UserRoles/11.png';

type AdminListProps = {
  accounts: Account[];
  barangays?: { Barangay_id: number; Barangay_Name: string }[];
  roles?: { Roles_id: number; Roles: string }[]; // role lookup
  onEdit: (account: Account) => void;
  onToggleActive: (account: Account) => void;
  onCreate?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  onLoadMore?: () => void;
  adminOnly?: boolean;
};

const AdminList: React.FC<AdminListProps> = ({ accounts, barangays = [], roles = [], onEdit, onToggleActive, onCreate, hasMore = false, loading = false, onLoadMore, adminOnly = false }) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'household' | 'barangay-staff' | 'operator' | 'admin'>(adminOnly ? 'admin' : 'household');

  const findBarangayName = (account: any) => {
    // Prefer preloaded barangays lookup
    const id = getBarangayId(account);
    if (id) {
      const b = barangays.find((x) => x.Barangay_id === id);
      if (b) return b.Barangay_Name;
    }

    // Fallbacks from account row values
    const directName = account.Barangay_Name ?? account.Barangay_name ?? account.brgName ?? account.barangay;
    return directName || '-';
  };

  const findRoleName = (account: any) => {
    const roleId = getRoleId(account);
    if (roleId === null || roleId === undefined) {
      const directRole = account.Roles_name ?? account.role ?? account.RoleName;
      return directRole ? String(directRole) : '-';
    }
    const r = roles.find((x) => x.Roles_id === roleId);
    return r?.Roles ?? String(roleId);
  };

  const getUsername = (row: any) => row.Username ?? row.username ?? '-';
  const getAccountId = (row: any) => row.Account_id ?? row.AccountId ?? getUsername(row);
  const getBarangayId = (row: any) => row.Barangay_id ?? row.brg_id ?? row.brgId ?? row.BarangayId ?? row.area_id ?? row.Area_id ?? null;
  const getRoleId = (row: any) => row.Roles ?? row.role_id ?? row.roleId ?? row.roles_id ?? row.Roles_id ?? null;
  const isActive = (row: any) => row.IsActive === 1;

  const getInitials = (account: Account) => {
    const first = account.FirstName?.trim();
    const last = account.LastName?.trim();
    if (first || last) {
      const initials = `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase();
      return initials || getUsername(account).slice(0, 2).toUpperCase();
    }
    return getUsername(account).slice(0, 2).toUpperCase();
  };

  const getProfileImage = (account: Account) => {
    if (account.Profile_image_path) return account.Profile_image_path;
    const profileUrl = (account as any).profileUrl;
    if (profileUrl) return profileUrl;
    return null;
  };

  const buttonBaseClasses = 'px-3 py-1 text-sm font-semibold rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sibol-green/40 hover:shadow-md active:scale-[0.98]';

  // Filter accounts based on search term and role
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const roleName = findRoleName(account);
      const barangayName = findBarangayName(account);
      const matchesSearch = searchTerm === '' ||
        getUsername(account).toLowerCase().includes(searchTerm.toLowerCase()) ||
        barangayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        roleName.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesRole: boolean;
      if (adminOnly) {
        matchesRole = roleName.toLowerCase().includes('admin');
      } else {
        matchesRole =
          (selectedRole === 'household' && roleName.toLowerCase().includes('household')) ||
          (selectedRole === 'barangay-staff' && roleName.toLowerCase().includes('barangay')) ||
          (selectedRole === 'operator' && roleName.toLowerCase().includes('operator'));
      }

      return matchesSearch && matchesRole;
    });
  }, [accounts, searchTerm, selectedRole, adminOnly]);

  const AccountCard: React.FC<{ account: Account }> = ({ account }) => (
    <div className="bg-white border border-[#00001A4D] rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-sibol-green/10 text-sibol-green border border-sibol-green/30 flex items-center justify-center text-sm font-bold overflow-hidden">
            {getProfileImage(account) ? (
              <img src={getProfileImage(account)!} alt={`${getUsername(account)} avatar`} className="w-full h-full object-cover" />
            ) : (
              <span>{getInitials(account)}</span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-lg text-sibol-green">{getUsername(account)}</h3>
            <p className="text-sm text-gray-600">{findRoleName(account)}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(account); }}
            className={`${buttonBaseClasses} bg-[#355842] text-white border-[#2f5236] hover:bg-[#2e4a36]`}
            aria-label="Edit user"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleActive(account); }}
            className={`${buttonBaseClasses} ${isActive(account)
              ? 'bg-red-600 text-white border-red-500 hover:bg-red-700'
              : 'bg-green-600 text-white border-green-500 hover:bg-green-700'
            }`}
            aria-label={isActive(account) ? "Disable user" : "Enable user"}
          >
            {isActive(account) ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm">
          <span className="font-medium">Barangay:</span> 
          <span className="ml-2 text-sibol-green">{findBarangayName(account)}</span>
        </p>
        <p className="text-sm">
          <span className="font-medium">Status:</span> 
          <span className={`ml-2 ${isActive(account) ? 'text-green-600' : 'text-red-600'}`}>
            {isActive(account) ? 'Active' : 'Inactive'}
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <div className="w-full">
      {/* Role Selection Tabs - Hidden in admin-only mode */}
      {!adminOnly && (
        <div className="flex justify-center mb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedRole('household')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedRole === 'household'
                  ? 'bg-gradient-to-r from-sibol-green to-green-500 text-white shadow-lg border border-sibol-green/60'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-50 border border-gray-200'
              }`}
            >
              <img src={householdIcon} alt="Household" className="w-5 h-5" />
              Household
            </button>
            <button
              onClick={() => setSelectedRole('barangay-staff')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedRole === 'barangay-staff'
                  ? 'bg-gradient-to-r from-sibol-green to-green-500 text-white shadow-lg border border-sibol-green/60'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-50 border border-gray-200'
              }`}
            >
              <img src={barangayStaffIcon} alt="Barangay Staff" className="w-5 h-5" />
              Barangay Staff
            </button>
            <button
              onClick={() => setSelectedRole('operator')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedRole === 'operator'
                  ? 'bg-gradient-to-r from-sibol-green to-green-500 text-white shadow-lg border border-sibol-green/60'
                  : 'bg-gray-100 text-gray-700 hover:bg-green-50 border border-gray-200'
              }`}
            >
              <img src={operatorIcon} alt="Operator" className="w-5 h-5" />
              Operator
            </button>
          </div>
        </div>
      )}

      {/* Search Bar and Controls */}
      <div className="flex justify-between items-center mb-4 gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search by username, barangay, or role..."
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

        {/* View Mode Toggle and Create User Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('table')}
            className={`p-2 rounded-full transition-all duration-200 border ${
              viewMode === 'table'
                ? 'bg-sibol-green text-white border-sibol-green/60 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-sibol-green hover:text-sibol-green'
            }`}
            title="Table View"
          >
            <FaTable size={18} />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-full transition-all duration-200 border ${
              viewMode === 'card'
                ? 'bg-sibol-green text-white border-sibol-green/60 shadow-md'
                : 'bg-white text-gray-700 border-gray-300 hover:border-sibol-green hover:text-sibol-green'
            }`}
            title="Card View"
          >
            <FaThLarge size={18} />
          </button>
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className={`${buttonBaseClasses} bg-sibol-green text-white border-sibol-green/70 hover:bg-sibol-green/90`}
            >
              Create User
            </button>
          )}
        </div>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'table' ? (
        <EndlessScroll
          hasMore={hasMore}
          loading={loading}
          onLoadMore={onLoadMore || (() => {})}
          className="w-full"
        >
          <div className="relative w-full rounded-xl border border-[#00001A4D] bg-white shadow-sm flex flex-col">
            <table className="w-full text-sm table-fixed">
              <thead className="bg-[#355E3B] text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Username</th>
                  <th className="px-4 py-3 text-left font-semibold">Barangay</th>
                  <th className="px-4 py-3 text-left font-semibold">Role</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#00001A4D]">
                {filteredAccounts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      No accounts found
                    </td>
                  </tr>
                ) : (
                  filteredAccounts.map((account) => (
                    <tr key={account.Account_id || getUsername(account)} className="border-b border-[#00001A4D] last:border-b-0">
                      <td className="px-4 py-3 text-sm text-[#1A1A1A]">
                        <span className="text-sibol-green">{getUsername(account)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1A1A1A]">
                        <span className="text-sibol-green">{findBarangayName(account)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1A1A1A]">
                        <span className="text-sibol-green">{findRoleName(account)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1A1A1A]">
                        <div className="flex gap-3 items-center justify-start">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(account); }}
                            className={`${buttonBaseClasses} bg-[#355842] text-white border-[#2f5236] hover:bg-[#2e4a36]`}
                            aria-label="Edit user"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleActive(account); }}
                            className={`${buttonBaseClasses} ${isActive(account)
                              ? 'bg-red-600 text-white border-red-500 hover:bg-red-700'
                              : 'bg-green-600 text-white border-green-500 hover:bg-green-700'
                            }`}
                            aria-label={isActive(account) ? "Disable user" : "Enable user"}
                          >
                            {isActive(account) ? 'Disable' : 'Enable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            {loading && (
              <div className="text-center py-4 text-gray-500 border-t border-[#00001A4D]">
                Loading more accounts...
              </div>
            )}
          </div>
        </EndlessScroll>
      ) : (
        <EndlessScroll
          hasMore={hasMore}
          loading={loading}
          onLoadMore={onLoadMore || (() => {})}
          className="w-full"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.length === 0 ? (
              <div className="col-span-full text-center py-8 text-gray-500 bg-white border border-[#00001A4D] rounded-lg">
                No accounts found
              </div>
            ) : (
              filteredAccounts.map((account) => (
                <AccountCard key={account.Account_id || getUsername(account)} account={account} />
              ))
            )}
          </div>
          {loading && (
            <div className="text-center py-4 text-gray-500">
              Loading more accounts...
            </div>
          )}
        </EndlessScroll>
      )}
    </div>
  );
};

export default AdminList;
