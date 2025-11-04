import api from './apiClient';

export interface Reward {
  Reward_id?: number;
  Item: string;
  Description?: string;
  Points_cost: number;
  Quantity: number;
  Image_url?: string;
  IsArchived?: boolean;
  Created_at?: string;
  Updated_at?: string;
}

export interface RewardTransaction {
  Transaction_id?: number;
  User_id: number;
  Reward_id: number;
  Points_spent: number;
  Quantity_redeemed: number;
  Status: 'pending' | 'approved' | 'rejected';
  Redeemed_at?: string;
  Updated_at?: string;
  // Joined fields
  Item?: string;
  Fullname?: string;
  Email?: string;
}

export interface RedeemRewardPayload {
  Reward_id: number;
  Quantity_redeemed: number;
}

export interface RedeemRewardResponse {
  message: string;
  data: {
    transactionId: number;
    redemption_code: string;
    total_points: number;
    status: string;
  };
}

// List rewards (with optional archived filter)
export const listRewards = async (archived?: boolean): Promise<Reward[]> => {
  let url = '/api/rewards';
  if (archived === true) url += '?archived=true';
  else if (archived === false) url += '?archived=false';
  
  const response = await api.get(url);
  return response.data;
};

// Get single reward by ID
export const getRewardById = async (id: number): Promise<Reward> => {
  const response = await api.get(`/api/rewards/${id}`);
  return response.data;
};

// Create new reward (Admin only)
export const createReward = async (reward: Omit<Reward, 'Reward_id' | 'IsArchived'>): Promise<{ message: string; Reward_id: number }> => {
  const response = await api.post('/api/rewards', reward);
  return response.data;
};

// Update existing reward (Admin only)
export const updateReward = async (id: number, fields: Partial<Reward>): Promise<{ message: string }> => {
  const response = await api.put(`/api/rewards/${id}`, fields);
  return response.data;
};

// Archive reward (Admin only)
export const archiveReward = async (id: number): Promise<{ message: string }> => {
  const response = await api.patch(`/api/rewards/${id}/archive`);
  return response.data;
};

// Restore archived reward (Admin only)
export const restoreReward = async (id: number): Promise<{ message: string }> => {
  const response = await api.patch(`/api/rewards/${id}/restore`);
  return response.data;
};

// Redeem a reward (Household)
export const redeemReward = async (payload: RedeemRewardPayload): Promise<RedeemRewardResponse> => {
  const response = await api.post('/api/rewards/redeem', payload);
  return response.data;
};

// Validate redemption code
export const validateRedemptionCode = async (code: string): Promise<RewardTransaction & { Item?: string; Points_cost?: number }> => {
  const response = await api.get(`/api/rewards/code/${code}`);
  return response.data;
};

// Mark transaction as redeemed (Staff only)
export const markTransactionRedeemed = async (transactionId: number): Promise<{ message: string }> => {
  const response = await api.patch(`/api/rewards/transaction/${transactionId}/redeemed`);
  return response.data;
};