const apiUrl = import.meta.env.VITE_API_URL || 'https://sibol-backend-i0i6.onrender.com';

export type User = { Account_id?: number; Username?: string; Roles?: number; [key: string]: any; };
export type AuthResponse = { token?: string; accessToken?: string; user?: User; [key: string]: any; };

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${apiUrl}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  const data = (await res.json()) as AuthResponse;
  const token = data.token ?? data.accessToken;
  if (token) localStorage.setItem('token', token); // <-- stores JWT
  if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
  return data;
}