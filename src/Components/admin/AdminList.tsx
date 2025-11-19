import React from 'react';
import { Account } from '../../types/adminTypes';

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

  return (
    <div className="w-full max-w-full bg-white rounded-md shadow-sm border border-green-50">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="text-sibol-green" style={{ backgroundColor: 'rgba(175,200,173,0.61)' }}>
            <tr>
              <th className="w-1/4 text-left px-4 py-2 font-medium">Username</th>
              <th className="w-1/4 text-left px-4 py-2 font-medium">Barangay</th>
              <th className="w-1/4 text-left px-4 py-2 font-medium">Role</th>
              <th className="w-1/4 text-right px-4 py-2 pr-10 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((acct) => {
              const a = acct as any;
              const username = a.Username ?? a.username ?? '-';
              const accountId = a.Account_id ?? a.AccountId ?? username;
              const barangayId = a.Barangay_id ?? a.brg_id ?? a.brgId ?? null;
              const roleId = a.Roles ?? a.role_id ?? a.roleId ?? null;

              return (
                <tr key={accountId} style={{ backgroundColor: 'rgba(136,171,142,0.02)' }}>
                  <td className="px-4 py-1.5 text-sibol-green align-middle">{username}</td>

                  <td className="px-4 py-1.5 text-sibol-green align-middle">
                    {findBarangayName(barangayId)}
                  </td>

                  <td className="px-4 py-1.5 text-sibol-green align-middle">
                    {findRoleName(roleId)}
                  </td>

                  <td className="px-4 py-1.5 text-right align-middle pr-10">
                    <div className="flex gap-3 items-center">
                      <button
                        onClick={() => onEdit(acct)}
                        className="flex flex-col items-center text-sibol-green hover:text-sibol-green/90 focus:outline-none bg-transparent border border-transparent appearance-none"
                        aria-label="Edit user"
                      >
                        <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M3 21v-3.75L17.81 2.44a2.5 2.5 0 0 1 3.54 3.54L9 21H3z" />
                          <path d="M14 7l3 3" />
                        </svg>
                        <span className="text-xs">Edit</span>
                      </button>

                      <button
                        onClick={() => onToggleActive(acct)}
                        className={`flex flex-col items-center ${acct.IsActive === 1 ? 'text-rose-600 hover:text-rose-700' : 'text-green-600 hover:text-green-700'} focus:outline-none bg-transparent border border-transparent appearance-none`}
                        aria-label={acct.IsActive === 1 ? "Disable user" : "Enable user"}
                      >
                        <svg className="w-5 h-5 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          {acct.IsActive === 1 ? (
                            // Disable icon: circle with X
                            <>
                              <circle cx="12" cy="12" r="9" />
                              <path d="M15 9L9 15M9 9l6 6" />
                            </>
                          ) : (
                            // Enable icon: circle with checkmark
                            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          )}
                        </svg>
                        <span className="text-xs">{acct.IsActive === 1 ? 'Disable' : 'Enable'}</span>
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {accounts.length === 0 && (
              <tr><td colSpan={4} className="p-4 text-center">No accounts</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminList;