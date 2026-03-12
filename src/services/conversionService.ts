import { get, put } from './apiClient';

const BASE = '/api/conversion';

export async function fetchConversion(barangayId: number) {
  const { data } = await get<{ pointsPerKg: number }>(`${BASE}?barangayId=${barangayId}`);
  return data;
}

/** send remark when updating */
export async function updateConversion(pointsPerKg: number, remark: string) {
  const { data } = await put<{ pointsPerKg: number }>(BASE, { pointsPerKg, remark });
  return data;
}

// --- new helper to fetch audit history ---
export async function fetchConversionAudit(limit = 100) {
  const { data } = await get<{ entries: any[] }>(`${BASE}/audit?limit=${Number(limit)}`);
  return data?.entries ?? [];
}