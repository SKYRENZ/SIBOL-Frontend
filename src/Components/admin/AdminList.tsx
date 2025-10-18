import React, { useMemo, useState } from 'react';
import { Account } from '../../types/Types';

type AdminListProps = {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onToggleActive: (account: Account) => void;
};

const AdminList: React.FC<AdminListProps> = ({ accounts, onEdit, onToggleActive }) => {
  return (
    <div className="w-full max-w-full bg-white rounded-md shadow-sm border border-green-50">
      <div className="px-6 py-3 flex items-center justify-between">
        <div /> {/* left spacer (search moved to AdminControls) */}
        <div className="text-sm text-sibol-green">Records: {accounts.length}</div>
      </div>

      {/* allow horizontal expansion and scrolling if viewport is narrower than table */}
      <div className="overflow-x-auto">
        <table className="min-w-[1400px] w-full">
          <thead className="text-sibol-green" style={{ backgroundColor: 'rgba(175,200,173,0.61)' }}>
            <tr>
              <th className="text-left px-6 py-3 font-medium">Username</th>
              <th className="text-left px-6 py-3 font-medium">Barangay</th>
              <th className="text-left px-6 py-3 font-medium">Role</th>
              <th className="text-right px-6 py-3 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((acct) => (
              <tr
                key={acct.Account_id}
                style={{ backgroundColor: 'rgba(136,171,142,0.1)' }}
              >
                <td className="px-6 py-4 text-sibol-green">
                  {acct.FirstName ? `${acct.FirstName} ${acct.LastName ?? ''}` : acct.Username}
                </td>
                <td className="px-6 py-4 text-sibol-green">{acct.Area_id ? `Brgy. ${acct.Area_id}` : '-'}</td>
                <td className="px-6 py-4 text-sibol-green">
                  {acct.Roles === 3 ? 'Admin' : acct.Roles === 2 ? 'Maintenance' : 'User'}
                </td>
                <td className="px-6 py-4 align-middle text-right">
                  <div className="inline-flex items-center justify-end gap-3">
                    <button
                      onClick={() => onEdit(acct)}
                      className="inline-flex items-center gap-2 mr-3 px-4 py-2 rounded bg-black text-white hover:bg-gray-800"
                    >
                      {/* pencil icon (clear stroke, matches reference) */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M3 21v-3.75L17.81 2.44a2.5 2.5 0 0 1 3.54 3.54L9 21H3z" />
                        <path d="M14 7l3 3" />
                      </svg>
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => onToggleActive(acct)}
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded text-white ${acct.IsActive ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'}`}
                    >
                      {/* circle-x icon */}
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M15 9L9 15M9 9l6 6" />
                      </svg>
                      <span>{acct.IsActive ? 'Disable' : 'Disable'}</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {accounts.length === 0 && (
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