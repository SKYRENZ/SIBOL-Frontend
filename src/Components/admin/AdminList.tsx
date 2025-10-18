import React from 'react';
import { Account } from '../../types/Types';

type AdminListProps = {
  accounts: Account[];
  onEdit: (account: Account) => void;
  onToggleActive: (account: Account) => void;
};

const AdminList: React.FC<AdminListProps> = ({ accounts, onEdit, onToggleActive }) => {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#2E523A' }}>
      <thead style={{ background: 'rgba(175,200,173,0.6)' }}>
        <tr>
          <th style={{ textAlign: 'left', padding: 8 }}>Username</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Barangay</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {accounts.map((account) => (
          <tr key={account.Account_id} style={{ background: 'rgba(136,171,142,0.08)' }}>
            <td style={{ padding: 10 }}>
              {account.FirstName ? `${account.FirstName} ${account.LastName ?? ''}` : account.Username}
            </td>
            <td style={{ padding: 10 }}>{account.Area_id ? `Brgy. ${account.Area_id}` : '-'}</td>
            <td style={{ padding: 10 }}>
              {account.Roles === 3 ? 'Admin' : account.Roles === 2 ? 'Maintenance' : 'User'}
            </td>
            <td style={{ padding: 10 }}>
              <button onClick={() => onEdit(account)}>Edit</button>
              <button
                onClick={() => onToggleActive(account)}
                style={{ marginLeft: 8, color: account.IsActive ? 'red' : 'green' }}
              >
                {account.IsActive ? 'Disable' : 'Enable'}
              </button>
            </td>
          </tr>
        ))}

        {accounts.length === 0 && (
          <tr>
            <td colSpan={4} style={{ padding: 20, textAlign: 'center' }}>
              No accounts found
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default AdminList;