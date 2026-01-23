import { fetchJson } from '../apiClient';

export type ProfileUpdatePayload = {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  area?: number;
  contact?: string | number;
  email?: string;
};

export async function getMyProfile() {
  return fetchJson<any>('/api/profile/me');
}

export async function updateMyProfile(payload: ProfileUpdatePayload) {
  return fetchJson<{ message: string; data: any }>('/api/profile/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

// keep for legacy usage (public/schedules)
export async function getProfileByAccountId(accountId: number) {
  if (!accountId) return null;
  return fetchJson<any>(`/api/profile/${accountId}`);
}