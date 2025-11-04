const API_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:5000';

export { API_URL };

type HeadersLike = HeadersInit;

function headersToObject(h?: HeadersLike): Record<string, string> {
  const out: Record<string, string> = {};
  if (!h) return out;
  if (h instanceof Headers) {
    h.forEach((v, k) => { out[k] = v; });
    return out;
  }
  if (Array.isArray(h)) {
    for (const [k, v] of h) out[k] = v;
    return out;
  }
  return { ...(h as Record<string, string>) };
}

function mergeHeaders(defaults: Record<string,string>, provided?: HeadersLike) {
  return { ...defaults, ...headersToObject(provided) };
}

function normalizeUrl(path: string) {
  if (path.startsWith('http')) return path;
  const base = API_URL.replace(/\/+$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${base}${p}`;
}

// low-level fetch wrapper that applies credentials and headers
export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = normalizeUrl(path);
  const defaultHeaders: Record<string,string> = {};
  
  // ✅ FIXED: attach token from localStorage if present
  try {
    const token = localStorage.getItem('token');
    if (token) {
      defaultHeaders['Authorization'] = `Bearer ${token}`;
    }
  } catch {
    // ignore in non-browser env
  }

  // Only set Content-Type default if a JSON body will be sent
  const method = (opts.method || 'GET').toUpperCase();
  const hasBody = !!(opts as any).body;
  if (hasBody && method !== 'GET' && method !== 'HEAD') {
    defaultHeaders['Content-Type'] = 'application/json';
  }

  const headers = mergeHeaders(defaultHeaders, opts.headers);

  const merged: RequestInit = {
    credentials: 'include',
    ...opts,
    headers,
  };

  return fetch(url, merged);
}

// Robust JSON fetch with timeout + unified error handling
export async function fetchJson<T = any>(path: string, opts: RequestInit = {}, timeoutMs = 15000): Promise<T> {
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
      error.data = payload; // ✅ ADDED: for compatibility with error.data?.message
      throw error;
    }

    return payload as T;
  } catch (err: any) {
    if (err?.name === 'AbortError') throw new Error('Request timed out');
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

// Add axios-like convenience helpers
export async function get<T = any>(path: string, opts: RequestInit = {}) {
  const payload = await fetchJson<T>(path, { ...opts, method: 'GET' });
  return { data: payload };
}

export async function post<T = any>(path: string, data?: any, opts: RequestInit = {}) {
  const body = data == null ? undefined : (typeof data === 'string' ? data : JSON.stringify(data));
  const payload = await fetchJson<T>(path, { ...opts, method: 'POST', body });
  return { data: payload };
}

export async function put<T = any>(path: string, data?: any, opts: RequestInit = {}) {
  const body = data == null ? undefined : (typeof data === 'string' ? data : JSON.stringify(data));
  const payload = await fetchJson<T>(path, { ...opts, method: 'PUT', body });
  return { data: payload };
}

export async function patch<T = any>(path: string, data?: any, opts: RequestInit = {}) {
  const body = data == null ? undefined : (typeof data === 'string' ? data : JSON.stringify(data));
  const payload = await fetchJson<T>(path, { ...opts, method: 'PATCH', body });
  return { data: payload };
}

export async function del<T = any>(path: string, opts: RequestInit = {}) {
  const payload = await fetchJson<T>(path, { ...opts, method: 'DELETE' });
  return { data: payload };
}

// keep default export but include the helpers for existing imports
export default {
  apiFetch,
  fetchJson,
  API_URL,
  get,
  post,
  put,
  patch,
  delete: del,
};