const API_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'https://sibol-backend-i0i6.onrender.com';

export { API_URL };

// low-level fetch wrapper that applies credentials and headers
export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = path.startsWith('http') ? path : (path.startsWith('/') ? `${API_URL}${path}` : `${API_URL}/${path}`);
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string, string> || {}),
  };

  // attach token from localStorage if present
  try {
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  } catch {
    // in SSR or non-browser env localStorage may be unavailable — ignore safely
  }

  const merged: RequestInit = {
    credentials: 'include',
    ...opts,
    headers,
  };

  return fetch(url, merged);
}

// Robust JSON fetch with timeout + unified error handling
export async function fetchJson(path: string, opts: RequestInit = {}, timeoutMs = 15000) {
  const controller = new AbortController();
  const signal = opts.signal ?? controller.signal;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await apiFetch(path, { ...opts, signal });
    const text = await res.text().catch(() => '');
    let payload: any = null;
    try {
      payload = text ? JSON.parse(text) : null;
    } catch {
      payload = { raw: text };
    }

    if (!res.ok) {
      const msg = payload?.message || payload?.error || text || `HTTP ${res.status}`;
      const error: any = new Error(msg);
      error.status = res.status;
      error.payload = payload;
      throw error;
    }

    return payload;
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export default {
  apiFetch,
  fetchJson,
  API_URL,
};