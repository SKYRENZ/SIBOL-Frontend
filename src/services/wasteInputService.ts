import { fetchJson } from './apiClient';

export type WasteInputRow = {
  Input_id?: number;
  input_id?: number;
  Machine_id?: number;
  machine_id?: number;
  Weight?: number;
  weight?: number;
  Input_datetime?: string;
  input_datetime?: string;
  Created_at?: string;
  created_at?: string;
  Username?: string;
  username?: string;
  Account_id?: number;
  account_id?: number;
  [k: string]: any;
};

export async function getWasteInputsByMachineId(machineId: number): Promise<WasteInputRow[]> {
  const data = await fetchJson(`/api/waste-inputs/machine/${machineId}`);
  return (data?.data ?? data ?? []) as WasteInputRow[];
}
