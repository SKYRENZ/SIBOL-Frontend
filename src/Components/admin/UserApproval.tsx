import { Account } from '../../types/adminTypes';

// 1. Update the Props type to accept the new props
type Props = {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onAccept: (a: Account) => Promise<void> | void;
  onReject: (a: Account) => Promise<void> | void;
};

// 2. Update the function to receive the new props
export default function UserApproval({ accounts, loading, error, onAccept, onReject }: Props) {
  // 3. Remove the internal state. The data now comes from props.

  if (loading) {
    return <div className="p-4 text-center">Loading pending accounts...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  if (accounts.length === 0) {
    return <div className="p-4 text-center">No pending accounts to approve.</div>;
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Username
          </th>
          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Email
          </th>
          <th scope="col" className="relative px-6 py-3">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {accounts.map((account) => (
          <tr key={(account as any).Pending_id || account.Account_id}>
            <td className="px-6 py-4 whitespace-nowrap">{account.Username}</td>
            <td className="px-6 py-4 whitespace-nowrap">{account.Email}</td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button onClick={() => onAccept(account)} className="text-indigo-600 hover:text-indigo-900">
                Approve
              </button>
              <button onClick={() => onReject(account)} className="ml-4 text-red-600 hover:text-red-900">
                Reject
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}