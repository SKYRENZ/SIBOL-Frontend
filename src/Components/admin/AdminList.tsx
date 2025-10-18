import React, { useMemo, useState } from 'react';
import { Account } from '../../types/Types';

type AdminListProps = {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onToggleActive: (account: Account) => void;
};

const AdminList: React.FC<AdminListProps> = ({ accounts, onEdit, onToggleActive }) => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return accounts;
    return accounts.filter((a) =>
      `${a.Username ?? a.FirstName ?? ''} ${a.LastName ?? ''} ${a.Area_id ?? ''} ${a.Email ?? ''}`.toLowerCase().includes(q)
    );
  }, [accounts, query]);

  return (
    <div className="bg-white rounded-md shadow-sm border border-green-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="relative w-80">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sibol-green">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="pl-10 pr-3 py-2 rounded-full border border-green-100 text-sm w-full"
            />
          </div>

          <div className="text-sm text-sibol-green">Records: {filtered.length}</div>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-green-100 text-sibol-green">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Username</th>
              <th className="text-left px-6 py-3 font-medium">Barangay</th>
              <th className="text-left px-6 py-3 font-medium">Role</th>
              <th className="text-left px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filtered.map((acct) => (
              <tr key={acct.Account_id} className="bg-white even:bg-green-50">
                <td className="px-6 py-4 text-sibol-green">
                  {acct.FirstName ? `${acct.FirstName} ${acct.LastName ?? ''}` : acct.Username}
                </td>
                <td className="px-6 py-4 text-sibol-green">{acct.Area_id ? `Brgy. ${acct.Area_id}` : '-'}</td>
                <td className="px-6 py-4 text-sibol-green">
                  {acct.Roles === 3 ? 'Admin' : acct.Roles === 2 ? 'Maintenance' : 'User'}
                </td>
                <td className="px-6 py-4">
                  <button onClick={() => onEdit(acct)} className="inline-block mr-3 px-4 py-2 rounded bg-black text-white">
                    Edit
                  </button>
                  <button
                    onClick={() => onToggleActive(acct)}
                    className={`inline-block px-4 py-2 rounded text-white ${acct.IsActive ? 'bg-red-600' : 'bg-green-600'}`}
                  >
                    {acct.IsActive ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-sm text-gray-500">
                  No accounts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminList;