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

export async function createWasteInput(machineId: number | string, weight: number, accountId?: number | string) {
  const payload: any = {
    machineId: Number(machineId),
    weight: Number(Number(weight).toFixed(2)),
  };

  if (accountId !== undefined && accountId !== null && String(accountId).trim() !== '') {
    const n = Number(accountId);
    if (Number.isFinite(n)) payload.accountId = n;
  }

  const data = await fetchJson('/api/waste-inputs', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

export async function getWasteInputsByMachineId(machineId: number): Promise<WasteInputRow[]> {
  const data = await fetchJson(`/api/waste-inputs/machine/${machineId}`);
  return (data?.data ?? data ?? []) as WasteInputRow[];
}
