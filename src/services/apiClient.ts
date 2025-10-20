import axios from 'axios';

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: BASE,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('token');
  if (token) {
    cfg.headers = { ...cfg.headers, Authorization: `Bearer ${token}` };
  } else {
    // dev-only: log which requests are sent without token
    // remove or comment out in production
    console.debug('apiClient: no token found in localStorage for request', cfg.url);
  }
  return cfg;
});

export default api;