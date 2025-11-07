import { useMemo, useState } from 'react';
import { Account } from '../../types/adminTypes';
import Table from '../common/Table'; // Import the Table component
import { Search } from 'lucide-react';

// 1. Update the Props type to accept the new props
type Props = {
  accounts: Account[];
  loading: boolean;
  error: string | null;
  onAccept: (a: Account) => void;
  onReject: (a: Account) => void;
};

// 2. Update the function to receive the new props
export default function UserApproval({ accounts, loading, error, onAccept, onReject }: Props) {
  const [filter, setFilter] = useState('');

  const filteredAccounts = useMemo(() => {
    if (!filter) return accounts;
    return accounts.filter(
      (acc) =>
        acc.Username?.toLowerCase().includes(filter.toLowerCase()) ||
        acc.Email?.toLowerCase().includes(filter.toLowerCase())
    );
  }, [accounts, filter]);

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
      {/* --- Filter and Search Controls --- */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by username or email..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-green-600 focus:border-green-600"
          />
        </div>
        {/* 
          Your FilterPanel can be placed here. 
          For pending approvals, there might not be roles/barangays to filter by yet,
          so a search bar is often more practical.
        */}
        {/* <FilterPanel types={['some_category']} onFilterChange={...} /> */}
      </div>

      {/* --- Reusable Table Component --- */}
      <Table
        columns={columns}
        data={filteredAccounts}
        emptyMessage="No pending accounts match your search."
        enablePagination={true} // The Table component handles its own pagination
        initialPageSize={5}
        fixedPagination={false} // Set to false so pagination appears below the table, not at the screen bottom
      />
    </div>
  );
}