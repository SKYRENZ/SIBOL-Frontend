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

      {/* table uses fixed layout and each column gets equal width via w-1/4 */}
      <div className="overflow-x-auto">
        {/* smaller overall font + tighter rows */}
        <table className="w-full table-fixed text-sm">
          <thead className="text-sibol-green" style={{ backgroundColor: 'rgba(175,200,173,0.61)' }}>
            <tr>
              <th className="w-1/4 text-left px-4 py-2 font-medium">Username</th>
              <th className="w-1/4 text-left px-4 py-2 font-medium">Barangay</th>
              <th className="w-1/4 text-left px-4 py-2 font-medium">Role</th>
              {/* nudged further right with extra padding-right to match reference */}
              <th className="w-1/4 text-right px-4 py-2 pr-10 font-medium">Actions</th>
            </tr>
          </thead>

          <tbody>
            {accounts.map((acct) => (
              <tr key={acct.Account_id} style={{ backgroundColor: 'rgba(136,171,142,0.1)' }}>
                <td className="px-4 py-1.5 text-sibol-green align-middle">
                  {acct.Username || (acct.FirstName ? `${acct.FirstName} ${acct.LastName ?? ''}` : '-')}
                </td>

                <td className="px-4 py-1.5 text-sibol-green align-middle">
                  {acct.Area_id ? `Brgy. ${acct.Area_id}` : '-'}
                </td>

                <td className="px-4 py-1.5 text-sibol-green align-middle">
                  {acct.Roles === 1 ? 'Admin' : acct.Roles === 2 ? 'Barangay_staff' : acct.Roles === 3 ? 'Operator' : 'Household'}
                </td>

                {/* actions: icon (flaticon-like) above small label, vertically centered and right-aligned */}
                <td className="px-4 py-1.5 align-middle pr-10 flex items-center justify-end">
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
            ))}

            {accounts.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-3 text-center text-sm text-gray-500">
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