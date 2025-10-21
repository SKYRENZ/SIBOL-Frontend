import axios from 'axios';

export const API_URL =
  import.meta.env.VITE_API_URL ??
  import.meta.env.VITE_API_BASE_URL ??
  'https://sibol-backend-i0i6.onrender.com';

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = path.startsWith('/') ? `${API_URL}${path}` : `${API_URL}/${path}`;
  const token = localStorage.getItem('token');
  const headers: Record<string,string> = {
    'Content-Type': 'application/json',
    ...(opts.headers as Record<string,string> || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(url, {
    credentials: 'include',
    headers,
    ...opts,
  });
  return res;
}

const axiosBase = API_URL; // use same resolved URL

const api = axios.create({
  baseURL: axiosBase,
  headers: { 'Content-Type': 'application/json' },
});

// attach token automatically for axios requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

export default api;
export { api as axiosApi };