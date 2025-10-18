import React from 'react';
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

      {/* table uses fixed layout and each column gets equal width via w-1/4 */}
      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="text-sibol-green" style={{ backgroundColor: 'rgba(175,200,173,0.61)' }}>
            <tr>
              <th className="w-1/4 text-left px-6 py-3 font-medium">Username</th>
              <th className="w-1/4 text-left px-6 py-3 font-medium">Barangay</th>
              <th className="w-1/4 text-left px-6 py-3 font-medium">Role</th>
              {/* nudged further right with extra padding-right to match reference */}
              <th className="w-1/4 text-right px-6 py-3 pr-12 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((acct) => (
              <tr key={acct.Account_id} style={{ backgroundColor: 'rgba(136,171,142,0.1)' }}>
                <td className="px-6 py-4 text-sibol-green align-middle">
                  {acct.FirstName ? `${acct.FirstName} ${acct.LastName ?? ''}` : acct.Username}
                </td>

                <td className="px-6 py-4 text-sibol-green align-middle">
                  {acct.Area_id ? `Brgy. ${acct.Area_id}` : '-'}
                </td>

                <td className="px-6 py-4 text-sibol-green align-middle">
                  {acct.Roles === 3 ? 'Admin' : acct.Roles === 2 ? 'Maintenance' : 'User'}
                </td>

                {/* actions: icon (flaticon-like) above small label, vertically centered and right-aligned */}
                <td className="px-6 py-4 align-middle pr-12 flex items-center justify-end">
                  <div className="flex gap-6 items-center">
                    <button
                      onClick={() => onEdit(acct)}
                      className="flex flex-col items-center text-sibol-green hover:text-sibol-green/90 focus:outline-none bg-transparent border border-transparent appearance-none"
                      aria-label="Edit user"
                    >
                      <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <path d="M3 21v-3.75L17.81 2.44a2.5 2.5 0 0 1 3.54 3.54L9 21H3z" />
                        <path d="M14 7l3 3" />
                      </svg>
                      <span className="text-sm">Edit</span>
                    </button>

                    <button
                      onClick={() => onToggleActive(acct)}
                      className="flex flex-col items-center text-rose-600 hover:text-rose-700 focus:outline-none bg-transparent border border-transparent appearance-none"
                      aria-label="Disable user"
                    >
                      <svg className="w-6 h-6 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M15 9L9 15M9 9l6 6" />
                      </svg>
                      <span className="text-sm">Disable</span>
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