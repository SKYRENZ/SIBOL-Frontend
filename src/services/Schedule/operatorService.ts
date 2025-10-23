import { fetchJson } from '../apiClient';

export interface Operator {
  Account_id: number;
  Username: string;
}

export const getAllOperators = async (): Promise<Operator[]> => {
  const data = await fetchJson('/api/operators');  // Matches backend
  return data ?? [];
};