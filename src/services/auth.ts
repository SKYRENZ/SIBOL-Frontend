import api from './apiClient';

export async function login(username: string, password: string) {
  const res = await api.post('/api/auth/login', { username, password });
  const data = res.data as any;
  const token = data.token ?? data.accessToken;
  if (token) localStorage.setItem('token', token);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return data; // { user } or { token, user }
}

export async function register(payload: any) {
  const res = await api.post('/api/auth/register', payload);
  return res.data;
}