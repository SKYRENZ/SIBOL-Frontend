import { useEffect, useState, useCallback } from 'react';
import api from '../../services/apiClient';

export type ClaimedTx = {
  Reward_transaction_id?: number;
  Transaction_id?: number;
  Account_id?: number;
  Reward_id?: number;
  Item?: string;
  Fullname?: string;
  Email?: string;
  Quantity?: number;
  Total_points?: number;
  Redemption_code?: string;
  Status?: string;
  Redeemed_at?: string;
  Created_at?: string;
};

export default function useClaimedReward() {
  const [data, setData] = useState<ClaimedTx[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchClaimed = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all transactions for this account (no status filter)
      const res = await api.get<ClaimedTx[]>('/api/rewards/transactions');
      setData(res.data ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load claimed rewards');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClaimed();
  }, [fetchClaimed]);

  return {
    data,
    loading,
    error,
    refresh: fetchClaimed,
  };
}