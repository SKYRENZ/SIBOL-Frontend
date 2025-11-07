import { Account } from '../../types/adminTypes';
import Table from '../common/Table'; // Import the Table component

type Props = {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onAccept: (a: Account) => void;
  onReject: (a: Account) => void;
};

export default function UserApproval({ accounts, loading, error, onAccept, onReject }: Props) {
  const columns = [
    {
      key: 'Username',
      label: 'Username',
    },
    {
      key: 'Email',
      label: 'Email',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (_: any, row: Account) => (
        <div className="flex justify-end gap-2">
          <button
            onClick={() => onAccept(row)}
            className="px-3 py-1 text-xs font-semibold text-white bg-green-600 rounded-md hover:bg-green-700 transition"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(row)}
            className="px-3 py-1 text-xs font-semibold text-white bg-red-600 rounded-md hover:bg-red-700 transition"
          >
            Reject
          </button>
        </div>
      ),
    },
  ];

  if (loading) {
    return <div className="p-4 text-center">Loading pending accounts...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-4">
      {/* --- Reusable Table Component --- */}
      <Table
        columns={columns}
        data={accounts}
        emptyMessage="No pending accounts to approve."
        enablePagination={true}
        initialPageSize={5}
        fixedPagination={false}
      />
    </div>
  );
}