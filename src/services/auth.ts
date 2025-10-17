import api from './apiClient';

export async function login(username: string, password: string) {
  const res = await api.post('/api/auth/login', { username, password });
  return res.data; // { user } or { token, user }
}

export async function register(payload: any) {
  const res = await api.post('/api/auth/register', payload);
  return res.data;
}