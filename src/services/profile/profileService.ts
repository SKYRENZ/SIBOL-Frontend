import { fetchJson } from '../apiClient';

export type ProfileUpdatePayload = {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  area?: number;
  contact?: string | number;
  email?: string;

  // ✅ used to verify identity when changing username
  currentPassword?: string;
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

// Upload profile image (multipart/form-data) with optional progress callback
export async function uploadProfileImage(file: File, onProgress?: (percent: number) => void) {
  const formData = new FormData();
  formData.append('file', file);

  // Use axios instance to get upload progress events
  const api = await import('../apiClient').then(m => m.default);
  const resp = await api.post('/api/profile/me/image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (ev: ProgressEvent) => {
      if (!ev.total) return;
      const pct = Math.round((ev.loaded / ev.total) * 100);
      onProgress?.(pct);
    },
  });

  // resp.data corresponds to the JSON body from the server: { message, data }
  return resp.data;
}

// keep for legacy usage (public/schedules)
export async function getProfileByAccountId(accountId: number) {
  if (!accountId) return null;
  return fetchJson<any>(`/api/profile/${accountId}`);
}