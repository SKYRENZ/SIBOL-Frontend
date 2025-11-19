import api from './apiClient';

export type User = { 
  Account_id?: number; 
  Username?: string; 
  Roles?: number; 
  roleId?: number;
  role?: number;
  IsFirstLogin?: number;
  [key: string]: any; 
};

export type AuthResponse = { 
  user?: User; 
  [key: string]: any; 
};

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/api/auth/login', { username, password });
  const data = res.data as any;
  
  if (data.user) {
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

export async function register(payload: any) {
  const res = await api.post('/api/auth/register', payload);
  return res.data;
}

export async function verifyToken(): Promise<boolean> {
  try {
    const response = await api.get('/api/auth/verify');
    
    if (response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return true;
    }
    
    localStorage.removeItem('user');
    return false;
  } catch (error) {
    localStorage.removeItem('user');
    return false;
  }
}

export function logout(): void {
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  api.post('/api/auth/logout').catch(() => {
    // Silent fail - non-critical
  });
  
  window.location.replace('/login');
}

export function getUser(): User | null {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!getUser();
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const res = await api.post('/api/auth/change-password', { currentPassword, newPassword });
  return res.data;
}

export function isFirstLogin(): boolean {
  try {
    const user = getUser();
    if (!user) return false;
    
    const isFirstLoginValue = user.IsFirstLogin;
    
    return isFirstLoginValue === 1 || 
           isFirstLoginValue === '1' || 
           isFirstLoginValue === true;
  } catch {
    return false;
  }
}

export async function getQueuePosition(email: string) {
  try {
    const res = await api.get(`/api/auth/queue-position?email=${encodeURIComponent(email)}`);
    return res.data;
  } catch (error: any) {
    throw error;
  }
}