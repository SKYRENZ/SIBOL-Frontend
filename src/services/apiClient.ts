import axios from 'axios';

const API_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'http://localhost:5000';

export { API_URL };

// Axios instance with cookie support
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-client-type': 'web', // ✅ ADD THIS
  },
  withCredentials: true, // ✅ Send cookies with requests
});

// Request interceptor to handle FormData
api.interceptors.request.use((config) => {
  // ✅ ensure header is present even if someone overwrote headers downstream
  config.headers = config.headers ?? {};
  (config.headers as any)['x-client-type'] = (config.headers as any)['x-client-type'] ?? 'web';

  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData) {
    delete (config.headers as any)['Content-Type'];
    delete (config.headers as any)['content-type'];
  }
  return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const authEndpoints = ['/api/auth/login', '/api/auth/register'];
    const isAuthRequest = authEndpoints.some((path) => error.config?.url?.includes(path));
    if (isAuthRequest) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401) {
      window.location.replace('/login');
    }

    return Promise.reject(error);
  }
);

export default api;

// Helper types
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

// ✅ Low-level fetch wrapper with cookie support (no Authorization header needed)
export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = normalizeUrl(path);

  const defaultHeaders: Record<string, string> = {
    'x-client-type': 'web', // ✅ ADD THIS
  };

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

// ✅ Robust JSON fetch with timeout + unified error handling
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
      error.data = payload; // ✅ for compatibility with error.data?.message
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

// ✅ Add axios-like convenience helpers
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

// ✅ Keep all exports for backward compatibility
export {
  api,
  get as apiGet,
  post as apiPost,
  put as apiPut,
  patch as apiPatch,
  del as apiDelete,
};