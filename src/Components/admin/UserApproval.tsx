import React, { useEffect, useState } from 'react';
import { Account } from '../../types/Types';
import { fetchPendingAccounts } from '../../services/adminService';

type Props = {
  onAccept: (a: Account) => Promise<any>;
  onReject: (a: Account) => Promise<any>;
};

export default function UserApproval({ onAccept, onReject }: Props) {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchPendingAccounts();
      setAccounts(rows);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load pending accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleAccept = async (a: Account) => {
    try {
      await onAccept(a);
      await load(); // refresh list after action
    } catch (err: any) {
      alert(err?.message ?? 'Approve failed');
    }
  };

  const handleReject = async (a: Account) => {
    try {
      await onReject(a);
      await load(); // refresh list after action
    } catch (err: any) {
      alert(err?.message ?? 'Reject failed');
    }
  };

  if (loading) return <div className="py-6 text-sm text-gray-600">Loading pending accounts...</div>;
  if (error) return <div className="py-6 text-sm text-rose-600">{error}</div>;

  if (!accounts.length) {
    return <div className="py-6 text-sm text-gray-600">No pending accounts.</div>;
  }

  return (
    <div className="py-4 space-y-3">
      {accounts.map((a) => (
        <div key={a.Account_id ?? a.Email} className="flex items-center justify-between bg-white border rounded-md p-3">
          <div>
            <div className="font-medium text-sibol-green">{a.Username ?? `${a.FirstName ?? ''} ${a.LastName ?? ''}`}</div>
            <div className="text-sm text-gray-500">{a.Email}</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleAccept(a)}
              className="btn btn-primary"
            >
              Accept
            </button>
            <button
              onClick={() => handleReject(a)}
              className="btn btn-outline"
            >
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}