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

// ✅ ADD: typed register response (matches backend registerUser + attachment additions)
export type RegisterResponse = {
  success: boolean;
  message?: string;
  pendingId?: number;
  username?: string;
  email?: string;
  isSSO?: boolean;
  emailVerified?: boolean;
  note?: string;
  attachmentUrl?: string;
  attachmentPublicId?: string;
};

let cachedUser: User | null = null; // <-- in-memory cache

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/api/auth/login', { username, password });
  const data = res.data as any;
  
  // do NOT persist to localStorage — use in-memory cache
  if (data.user) {
    cachedUser = data.user;
  }
  
  return data;
}

// ✅ CHANGE: return typed response
export async function register(payload: any): Promise<RegisterResponse> {
  const res = await api.post('/api/auth/register', payload);
  return res.data as RegisterResponse;
}

export async function verifyToken(): Promise<User | null> {
  try {
    const response = await api.get('/api/auth/verify');
    const data = response.data as { valid?: boolean; user?: User } | undefined;
    
    if (data?.user) {
      cachedUser = data.user; // populate in-memory cache from server (httpOnly cookie)
      return data.user;
    }
    
    cachedUser = null;
    return null;
  } catch (error) {
    cachedUser = null;
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  api.post('/api/auth/logout').catch(() => {
    // Silent fail - non-critical
  });
  
  // Let React Router handle navigation instead
}

export function getUser(): User | null {
  return cachedUser;
}

export function isAuthenticated(): boolean {
  return !!cachedUser;
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
    
    if (isFirstLoginValue === undefined) return false;
    
    return isFirstLoginValue === 1;
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