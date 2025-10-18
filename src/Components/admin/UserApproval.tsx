import React from 'react';
import { Account } from '../../types/Types';

type Props = {
  accounts: Account[];
  onAccept: (a: Account) => void;
  onReject: (a: Account) => void;
};

const UserApproval: React.FC<Props> = ({ accounts, onAccept, onReject }) => {
  const pending = accounts.filter(
    (a: any) =>
      a?.Status === 'Pending' ||
      a?.status === 'pending' ||
      a?.IsApproved === false ||
      a?.IsActive === 0 ||
      a?.IsActive === false
  );
  const list = pending.length > 0 ? pending : accounts;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', color: '#2E523A' }}>
      <thead style={{ background: 'rgba(175,200,173,0.6)' }}>
        <tr>
          <th style={{ textAlign: 'left', padding: 8 }}>Username</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Barangay</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Role</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Email</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Status</th>
          <th style={{ textAlign: 'left', padding: 8 }}>Action</th>
        </tr>
      </thead>
      <tbody>
        {list.map((account) => (
          <tr key={account.Account_id} style={{ background: 'rgba(136,171,142,0.04)' }}>
            <td style={{ padding: 10 }}>
              {account.FirstName ? `${account.FirstName} ${account.LastName ?? ''}` : account.Username}
            </td>
            <td style={{ padding: 10 }}>{account.Area_id ? `Brgy. ${account.Area_id}` : '-'}</td>
            <td style={{ padding: 10 }}>
              {account.Roles === 3 ? 'Admin' : account.Roles === 2 ? 'Maintenance' : 'User'}
            </td>
            <td style={{ padding: 10 }}>{account.Email ?? '-'}</td>
            <td style={{ padding: 10 }}>{(account as any).Status ?? (account.IsActive ? 'Active' : 'Pending')}</td>
            <td style={{ padding: 10 }}>
              <button
                onClick={() => onAccept(account)}
                style={{ background: '#2E523A', color: '#fff', padding: '6px 10px', border: 'none', borderRadius: 6 }}
              >
                Accept
              </button>
              <button
                onClick={() => onReject(account)}
                style={{ marginLeft: 8, background: '#c75', color: '#fff', padding: '6px 10px', border: 'none', borderRadius: 6 }}
              >
                Reject
              </button>
            </td>
          </tr>
        ))}

        {list.length === 0 && (
          <tr>
            <td colSpan={6} style={{ padding: 20, textAlign: 'center' }}>
              No users to approve
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

export default UserApproval;