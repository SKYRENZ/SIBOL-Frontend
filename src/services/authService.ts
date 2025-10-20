import api from './apiClient';

export type User = { Account_id?: number; Username?: string; Roles?: number; [key: string]: any; };
export type AuthResponse = { token?: string; accessToken?: string; user?: User; [key: string]: any; };

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await api.post<AuthResponse>('/api/auth/login', { username, password });
  const data = res.data as AuthResponse;
  const token = data.token ?? data.accessToken;
  if (token) localStorage.setItem('token', token); // <-- stores JWT
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}