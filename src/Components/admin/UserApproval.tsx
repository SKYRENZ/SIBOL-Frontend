import React, { useMemo, useState } from 'react';
import { Account } from '../../types/Types';

type Props = {
  accounts: Account[];
  onAccept: (a: Account) => void;
  onReject: (a: Account) => void;
};

const UserApproval: React.FC<Props> = ({ accounts, onAccept, onReject }) => {
  const [query, setQuery] = useState('');
  const pending = useMemo(
    () =>
      accounts.filter(
        (a: any) =>
          a?.Status === 'Pending' || a?.IsActive === 0 || a?.IsApproved === false
      ),
    [accounts]
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = pending.length > 0 ? pending : accounts;
    if (!q) return base;
    return base.filter((a) => `${a.Username ?? a.FirstName ?? ''} ${a.Email ?? ''}`.toLowerCase().includes(q));
  }, [accounts, pending, query]);

  return (
    <div className="bg-white rounded-md shadow-sm border border-green-50">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="relative w-80">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-sibol-green">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 21l-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="pl-10 pr-3 py-2 rounded-full border border-green-100 text-sm w-full"
            />
          </div>

          <div className="text-sm text-sibol-green">Pending: {pending.length}</div>
        </div>
      </div>

      <div className="overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-green-100 text-sibol-green">
            <tr>
              <th className="text-left px-6 py-3 font-medium">Username</th>
              <th className="text-left px-6 py-3 font-medium">Barangay</th>
              <th className="text-left px-6 py-3 font-medium">Role</th>
              <th className="text-left px-6 py-3 font-medium">Email</th>
              <th className="text-left px-6 py-3 font-medium">Status</th>
              <th className="text-left px-6 py-3 font-medium">Action</th>
            </tr>
          </thead>

          <tbody>
            {list.map((acct) => (
              <tr key={acct.Account_id} className="bg-white even:bg-green-50">
                <td className="px-6 py-4 text-sibol-green">
                  {acct.FirstName ? `${acct.FirstName} ${acct.LastName ?? ''}` : acct.Username}
                </td>
                <td className="px-6 py-4 text-sibol-green">{acct.Area_id ? `Brgy. ${acct.Area_id}` : '-'}</td>
                <td className="px-6 py-4 text-sibol-green">
                  {acct.Roles === 3 ? 'Admin' : acct.Roles === 2 ? 'Maintenance' : 'User'}
                </td>
                <td className="px-6 py-4 text-sibol-green">{acct.Email ?? '-'}</td>
                <td className="px-6 py-4 text-sibol-green">
                  {(acct as any).Status ?? (acct.IsActive ? 'Active' : 'Pending')}
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => onAccept(acct)}
                    className="mr-3 px-4 py-2 rounded-md bg-sibol-green text-white"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => onReject(acct)}
                    className="px-4 py-2 rounded-md bg-red-400 text-white"
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))}

            {list.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-sm text-gray-500">
                  No users to approve
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserApproval;