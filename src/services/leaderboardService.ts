import apiClient from './apiClient';

export type LBRow = {
  Account_id: number;
  Username: string;
  Total_kg: number;
  Points?: number;
  rank?: number;
};

export async function fetchLeaderboard(limit = 100): Promise<LBRow[]> {
  const res: any = await apiClient.get('/api/leaderboard', { params: { limit } });
  console.debug('fetchLeaderboard response', res);
  return res.data?.data ?? [];
}