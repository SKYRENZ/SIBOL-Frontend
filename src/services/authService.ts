import { fetchJson } from './apiClient';

export type User = { Account_id?: number; Username?: string; Roles?: number; [key: string]: any; };
export type AuthResponse = { token?: string; accessToken?: string; user?: User; [key: string]: any; };

export async function login(username: string, password: string): Promise<AuthResponse> {
  const data = await fetchJson('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  const token = data.token ?? data.accessToken;
  if (token) localStorage.setItem('token', token);
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return data as AuthResponse;
}