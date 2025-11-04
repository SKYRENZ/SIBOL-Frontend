import { useState, useEffect, useCallback } from 'react';
import * as rewardService from '../../services/rewardService';
import type { Reward, RedeemRewardPayload } from '../../services/rewardService';

export const useRewards = (showArchived: boolean = false) => {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRewards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await rewardService.listRewards(showArchived);
      setRewards(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || 'Failed to fetch rewards');
      console.error('Error fetching rewards:', err);
    } finally {
      setLoading(false);
    }
  }, [showArchived]);

  useEffect(() => {
    fetchRewards();
  }, [fetchRewards]);

  return {
    rewards,
    loading,
    error,
    refetch: fetchRewards,
  };
};

export const useCreateReward = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createReward = async (reward: Omit<Reward, 'Reward_id' | 'IsArchived'>) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await rewardService.createReward(reward);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to create reward';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    createReward,
    loading,
    error,
    success,
  };
};

export const useUpdateReward = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const updateReward = async (id: number, fields: Partial<Reward>) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await rewardService.updateReward(id, fields);
      setSuccess(true);
      return response;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to update reward';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    updateReward,
    loading,
    error,
    success,
  };
};

export const useArchiveReward = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const archiveReward = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await rewardService.archiveReward(id);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to archive reward';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const restoreReward = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await rewardService.restoreReward(id);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to restore reward';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    archiveReward,
    restoreReward,
    loading,
    error,
  };
};

export const useRedeemReward = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [redemptionData, setRedemptionData] = useState<{
    transactionId: number;
    redemption_code: string;
    total_points: number;
    status: string;
  } | null>(null);

  const redeemReward = async (payload: RedeemRewardPayload) => {
    setLoading(true);
    setError(null);
    setRedemptionData(null);
    try {
      const response = await rewardService.redeemReward(payload);
      setRedemptionData(response.data);
      return response;
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message || 'Failed to redeem reward';
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return {
    redeemReward,
    loading,
    error,
    redemptionData,
  };
};