import api from './apiClient';

export type User = { 
  Account_id?: number; 
  Username?: string; 
  Roles?: number; 
  roleId?: number;
  role?: number;
  [key: string]: any; 
};

export type AuthResponse = { 
  token?: string; 
  accessToken?: string; 
  user?: User; 
  [key: string]: any; 
};

export async function login(username: string, password: string): Promise<AuthResponse> {
  const res = await api.post('/api/auth/login', { username, password });
  const data = res.data as any;
  
  console.log('📥 Login response received:', data); // ✅ ADD THIS
  
  const token = data.token ?? data.accessToken;
  if (token) localStorage.setItem('token', token);
  
  if (data.user) {
    console.log('💾 Storing user in localStorage:', data.user); // ✅ ADD THIS
    localStorage.setItem('user', JSON.stringify(data.user));
  }
  
  return data;
}

export async function register(payload: any) {
  const res = await api.post('/api/auth/register', payload);
  return res.data;
}

export async function verifyToken(): Promise<boolean> {
  const token = getToken();
  
  if (!token) return false;

  try {
    // First check if token is expired client-side (quick check)
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    
    if (isExpired) {
      logout();
      return false;
    }

    // Then verify with backend (secure check)
    const response = await api.get('/api/auth/verify');
    
    if (response.data?.valid) {
      // Optionally update user data from backend
      if (response.data?.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return true;
    }
    
    logout();
    return false;
  } catch (error) {
    console.error('Token verification failed:', error);
    logout();
    return false;
  }
}

export async function logout() {
  try {
    // Clear local storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear session storage as well
    sessionStorage.clear();
    
    // Call backend logout if using sessions (non-blocking)
    try {
      await api.post('/api/auth/logout');
    } catch (e) {
      console.warn('Backend logout failed (non-blocking):', e);
    }
    
    // Force navigate to login and clear history
    window.location.replace('/login');
    
  } catch (error) {
    console.error('Logout error:', error);
    // Force redirect even on error
    window.location.replace('/login');
  }
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

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const res = await api.post('/api/auth/change-password', { currentPassword, newPassword });
  return res.data;
}

export function isFirstLogin(): boolean {
  try {
    const user = getUser();
    console.log('🔍 isFirstLogin check:');
    console.log('  - User object:', user);
    console.log('  - IsFirstLogin value:', user?.IsFirstLogin);
    console.log('  - IsFirstLogin === 1:', user?.IsFirstLogin === 1);
    console.log('  - IsFirstLogin === true:', user?.IsFirstLogin === true);
    console.log('  - IsFirstLogin == 1 (loose):', user?.IsFirstLogin == 1);
    
    // Check both number 1 and boolean true, also handle string "1"
    const result = user?.IsFirstLogin === 1 || 
                   user?.IsFirstLogin === true || 
                   user?.IsFirstLogin === '1';
    
    console.log('  - Final result:', result);
    return result;
  } catch (error) {
    console.error('❌ Error in isFirstLogin:', error);
    return false;
  }
}