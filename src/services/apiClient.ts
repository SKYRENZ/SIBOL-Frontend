import axios from 'axios';

export const API_URL = import.meta.env.VITE_API_URL || 'https://sibol-backend-i0i6.onrender.com';

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const url = `${API_URL}${path.startsWith('/') ? path : '/' + path}`;
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
    ...opts,
  });
  return res;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
});

// attach token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (err) => Promise.reject(err));

export default api;