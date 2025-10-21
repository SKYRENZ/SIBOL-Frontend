import { apiFetch } from './apiClient';
import { normalizeModules } from './normalizeModules';

export async function fetchAllowedModules() {
  const res = await apiFetch('/api/modules/allowed');
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  const payload = await res.json();
  return normalizeModules(payload); // return normalizer object { list, get, has }
}