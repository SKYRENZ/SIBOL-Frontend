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

// ✅ ADD THIS (fixes: Cannot find name 'RegisterResponse')
export type RegisterResponse = {
  success: boolean;
  message?: string;
  username?: string;
  email?: string;
  user?: User;
  [key: string]: any;
};

let cachedUser: User | null = null; // <-- in-memory cache

// ✅ ADD: allow other parts of the app to sync the cached user after profile updates
export function setCachedUser(user: User | null) {
  cachedUser = user;
}

export function updateCachedUser(patch: Partial<User>) {
  cachedUser = cachedUser ? { ...cachedUser, ...patch } : ({ ...patch } as User);
  return cachedUser;
}

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  // ✅ Send identifier (email or username). Also include username for backward compatibility.
  const res = await api.post('/api/auth/login', {
    identifier,
    username: identifier,
    email: identifier,
    password,
  });

  const data = res.data as any;
  
  // do NOT persist to localStorage — use in-memory cache
  if (data.user) {
    cachedUser = data.user;
  }
  
  return data;
}

export async function register(payload: any): Promise<RegisterResponse> {
  const res = await api.post('/api/auth/register', payload);
  return res.data as RegisterResponse;
}

function looksLikeUser(x: any): x is User {
  return !!x && typeof x === 'object' && (Number.isFinite(Number(x.Account_id)) || Number.isFinite(Number(x.id)));
}

export async function verifyToken(): Promise<User | null> {
  try {
    // ✅ remove Cache-Control header (it triggers CORS preflight)
    const response = await api.get('/api/auth/verify');

    const data: any = response.data;

    const candidate =
      data?.user ??
      data?.account ??
      data?.me ??
      data?.data?.user ??
      data?.data ??
      data;

    if (looksLikeUser(candidate)) {
      cachedUser = candidate;
      return candidate;
    }

    cachedUser = null;
    return null;
  } catch {
    cachedUser = null;
    return null;
  }
}

export function logout(): void {
  localStorage.removeItem('user');
  sessionStorage.clear();
  
  cachedUser = null; // ✅ ensure in-memory auth resets too
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