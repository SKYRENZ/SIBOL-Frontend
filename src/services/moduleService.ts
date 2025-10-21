import { API_URL, apiFetch } from './apiClient';

export async function fetchAllowedModules() {
  const res = await apiFetch('/api/modules/allowed');
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  return res.json();
}