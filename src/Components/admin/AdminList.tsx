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
};

const AdminList: React.FC<AdminListProps> = ({ accounts, barangays = [], roles = [], onEdit, onToggleActive, onCreate, hasMore = false, loading = false, onLoadMore }) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<'household' | 'barangay-staff' | 'operator'>('household');

  const findBarangayName = (id?: number | null) => {
    if (!id) return '-';
    const b = barangays.find((x) => x.Barangay_id === id);
    return b?.Barangay_Name ?? '-';
  };

  const findRoleName = (roleId?: number | null) => {
    if (roleId === null || roleId === undefined) return '-';
    const r = roles.find((x) => x.Roles_id === roleId);
    return r?.Roles ?? String(roleId);
  };

  const getUsername = (row: any) => row.Username ?? row.username ?? '-';
  const getAccountId = (row: any) => row.Account_id ?? row.AccountId ?? getUsername(row);
  const getBarangayId = (row: any) => row.Barangay_id ?? row.brg_id ?? row.brgId ?? null;
  const getRoleId = (row: any) => row.Roles ?? row.role_id ?? row.roleId ?? null;
  const isActive = (row: any) => row.IsActive === 1;

  // Filter accounts based on search term and role
  const filteredAccounts = useMemo(() => {
    return accounts.filter(account => {
      const matchesSearch = searchTerm === '' || 
        getUsername(account).toLowerCase().includes(searchTerm.toLowerCase()) ||
        findBarangayName(getBarangayId(account)).toLowerCase().includes(searchTerm.toLowerCase()) ||
        findRoleName(getRoleId(account)).toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = 
        (selectedRole === 'household' && findRoleName(getRoleId(account)).toLowerCase().includes('household')) ||
        (selectedRole === 'barangay-staff' && findRoleName(getRoleId(account)).toLowerCase().includes('barangay')) ||
        (selectedRole === 'operator' && findRoleName(getRoleId(account)).toLowerCase().includes('operator'));

      return matchesSearch && matchesRole;
    });
  }, [accounts, searchTerm, selectedRole]);

  const AccountCard: React.FC<{ account: Account }> = ({ account }) => (
    <div className="bg-white border border-[#00001A4D] rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="font-semibold text-lg text-sibol-green">{getUsername(account)}</h3>
          <p className="text-sm text-gray-600">{findRoleName(getRoleId(account))}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(account); }}
            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36] disabled:opacity-50"
            aria-label="Edit user"
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onToggleActive(account); }}
            className={isActive(account)
              ? "px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              : "px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            }
            aria-label={isActive(account) ? "Disable user" : "Enable user"}
          >
            {isActive(account) ? 'Disable' : 'Enable'}
          </button>
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-sm">
          <span className="font-medium">Barangay:</span> 
          <span className="ml-2 text-sibol-green">{findBarangayName(getBarangayId(account))}</span>
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
      {/* Role Selection Tabs */}
      <div className="flex justify-center mb-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedRole('household')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedRole === 'household'
                ? 'bg-sibol-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <img src={householdIcon} alt="Household" className="w-5 h-5" />
            Household
          </button>
          <button
            onClick={() => setSelectedRole('barangay-staff')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedRole === 'barangay-staff'
                ? 'bg-sibol-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <img src={barangayStaffIcon} alt="Barangay Staff" className="w-5 h-5" />
            Barangay Staff
          </button>
          <button
            onClick={() => setSelectedRole('operator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedRole === 'operator'
                ? 'bg-sibol-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <img src={operatorIcon} alt="Operator" className="w-5 h-5" />
            Operator
          </button>
        </div>
      </div>

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
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'table'
                ? 'bg-sibol-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Table View"
          >
            <FaTable size={18} />
          </button>
          <button
            onClick={() => setViewMode('card')}
            className={`p-2 rounded-lg transition-colors ${
              viewMode === 'card'
                ? 'bg-sibol-green text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            title="Card View"
          >
            <FaThLarge size={18} />
          </button>
          {onCreate && (
            <button
              type="button"
              onClick={onCreate}
              className="px-3 py-2 rounded-lg bg-sibol-green text-white text-sm font-medium hover:bg-sibol-green/90"
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
                        <span className="text-sibol-green">{findBarangayName(getBarangayId(account))}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1A1A1A]">
                        <span className="text-sibol-green">{findRoleName(getRoleId(account))}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-[#1A1A1A]">
                        <div className="flex gap-3 items-center justify-start">
                          <button
                            onClick={(e) => { e.stopPropagation(); onEdit(account); }}
                            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36] disabled:opacity-50"
                            aria-label="Edit user"
                          >
                            Edit
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onToggleActive(account); }}
                            className={isActive(account)
                              ? "px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
                              : "px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
                            }
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
