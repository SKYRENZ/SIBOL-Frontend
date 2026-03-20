import { get, put, post } from './apiClient';

const BASE = '/api/conversion';

export async function fetchConversion(barangayId: number) {
  const { data } = await get<{ pointsPerKg: number }>(`${BASE}?barangayId=${barangayId}`);
  return data;
}

/** send remark when updating */
export async function updateConversion(pointsPerKg: number, remark: string) {
  try {
    const { data } = await put<{ pointsPerKg: number }>(BASE, { pointsPerKg, remark });
    return data;
  } catch (err: any) {
    // If the server does not accept PUT (404), try POST as a pragmatic fallback
    if (err?.status === 404) {
      const { data } = await post<{ pointsPerKg: number }>(BASE, { pointsPerKg, remark });
      return data;
    }
    throw err;
  }
}

// --- new helper to fetch audit history ---
export async function fetchConversionAudit(limit = 100) {
  const { data } = await get<{ entries: any[] }>(`${BASE}/audit?limit=${Number(limit)}`);
  return data?.entries ?? [];
}