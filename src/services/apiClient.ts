import axios from 'axios';

const API_BASE = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: false, // set true if using cookies
  headers: { 'Content-Type': 'application/json' },
});

// optional: attach auth token automatically
api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
  return cfg;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // centralize error mapping
    return Promise.reject(err?.response?.data ?? err);
  }
);

export default api;