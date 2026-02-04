import React from 'react';
import { Account } from '../../types/adminTypes';
import Table from '../common/Table';

type AdminListProps = {
  accounts: Account[];
  barangays?: { Barangay_id: number; Barangay_Name: string }[];
  roles?: { Roles_id: number; Roles: string }[]; // role lookup
  onEdit: (account: Account) => void;
  onToggleActive: (account: Account) => void;
};

const AdminList: React.FC<AdminListProps> = ({ accounts, barangays = [], roles = [], onEdit, onToggleActive }) => {
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

  const columns: any[] = [
    {
      key: 'username',
      label: 'Username',
      render: (_v: any, row: any) => (
        <span className="text-sibol-green">{getUsername(row)}</span>
      ),
    },
    {
      key: 'barangay',
      label: 'Barangay',
      render: (_v: any, row: any) => (
        <span className="text-sibol-green">{findBarangayName(getBarangayId(row))}</span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (_v: any, row: any) => (
        <span className="text-sibol-green">{findRoleName(getRoleId(row))}</span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_v: any, row: any) => (
        <div className="flex gap-3 items-center justify-start">
          <button
            onClick={(e) => { e.stopPropagation(); onEdit(row); }}
            className="px-3 py-1 bg-[#355842] text-white text-sm rounded hover:bg-[#2e4a36] disabled:opacity-50"
            aria-label="Edit user"
          >
            Edit
          </button>

          <button
            onClick={(e) => { e.stopPropagation(); onToggleActive(row); }}
            className={isActive(row)
              ? "px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50"
              : "px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50"
            }
            aria-label={isActive(row) ? "Disable user" : "Enable user"}
          >
            {isActive(row) ? 'Disable' : 'Enable'}
          </button>
        </div>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      data={accounts}
      rowKey="Account_id"
      enablePagination={false}
      emptyMessage="No accounts"
      className="w-full"
    />
  );
};

export default AdminList;