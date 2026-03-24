import { fetchJson } from './apiClient';

export interface Operator {
  Account_id: number;
  Username: string;
  First_name?: string;
  Last_name?: string;
  Full_name?: string;
  Profile_picture_url?: string;
}

export const getAllOperators = async (): Promise<Operator[]> => {
  const data = await fetchJson('/api/operators');  
  return data ?? [];
};

export const getOperatorsByBarangay = async (barangayId: number): Promise<Operator[]> => {
  const data = await fetchJson(`/api/operators/barangay/${barangayId}`);  
  return data ?? [];
};
