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
  
  console.log('📥 Login response received:', data);
  
  // ✅ Only store user data (token is in HTTP-only cookie)
  if (data.user) {
    console.log('💾 Storing user in localStorage:', data.user);
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
    // ✅ Backend will read token from cookie
    const response = await api.get('/api/auth/verify');
    
    if (response.data?.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return true;
    }
    
    // ❌ Don't call logout() here - just clean up and return false
    localStorage.removeItem('user');
    return false;
  } catch (error) {
    console.error('Token verification failed:', error);
    // ❌ Don't call logout() here - just clean up and return false
    localStorage.removeItem('user');
    return false;
  }
}

export function logout(): void {
  // Clear local data immediately
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  // ✅ Call backend to clear cookie (fire-and-forget, non-blocking)
  api.post('/api/auth/logout').catch((e) => {
    console.warn('Backend logout failed (non-critical):', e);
  });
  
  // Redirect immediately (don't wait for backend)
  window.location.replace('/login');
}

export function getUser(): User | null {
  try {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  } catch (err) {
    console.error('Error parsing user:', err);
    return null;
  }
}

export function isAuthenticated(): boolean {
  // ✅ Check if user exists in localStorage (token is in cookie)
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
    
    // ✅ Fixed: Properly check IsFirstLogin value (number type)
    const isFirstLoginValue = user.IsFirstLogin;
    
    // Check if it's 1 (number), '1' (string), or true (boolean)
    const result = isFirstLoginValue === 1 || 
                   isFirstLoginValue === '1' || 
                   isFirstLoginValue === true;
    
    return result;
  } catch (error) {
    console.error('❌ Error in isFirstLogin:', error);
    return false;
  }
}

export async function getQueuePosition(email: string) {
  try {
    const res = await api.get(`/api/auth/queue-position?email=${encodeURIComponent(email)}`);
    return res.data;
  } catch (error: any) {
    console.error('getQueuePosition error:', error);
    throw error;
  }
}