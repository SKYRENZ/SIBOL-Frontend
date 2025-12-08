import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';
import api from '../../services/apiClient';

interface User {
  Account_id?: number;
  Username?: string;
  Roles?: number;
  roleId?: number;
  role?: number;
  IsFirstLogin?: number;
  [key: string]: any;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isFirstLogin: boolean;
  successMessage: string | null; // ✅ ADD: For success notifications
}

const initialState: AuthState = {
  user: authService.getUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
  isFirstLogin: authService.isFirstLogin(),
  successMessage: null,
};

// ✅ Existing thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authService.login(username, password);
      return data;
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Invalid username or password';
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const isValid = await authService.verifyToken();
      if (!isValid) {
        return rejectWithValue('Token verification failed');
      }
      const user = authService.getUser();
      return { user };
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Token verification failed');
    }
  }
);

export const changePassword = createAsyncThunk(
  'auth/changePassword',
  async ({ currentPassword, newPassword }: { currentPassword: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const data = await authService.changePassword(currentPassword, newPassword);
      return data;
    } catch (error: any) {
      return rejectWithValue(error?.message || 'Password change failed');
    }
  }
);

// ✅ NEW: Registration thunk
export const register = createAsyncThunk(
  'auth/register',
  async (payload: any, { rejectWithValue }) => {
    try {
      const data = await authService.register(payload);
      return data;
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ NEW: Resend verification thunk
export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/resend-verification', { email });
      return res.data;
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to resend verification';
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ NEW: Verify email thunk
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/auth/verify-email/${token}`);
      return res.data;
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Email verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ NEW: Forgot password thunk
export const forgotPassword = createAsyncThunk(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      return res.data;
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to send reset code';
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ NEW: Verify reset code thunk
export const verifyResetCode = createAsyncThunk(
  'auth/verifyResetCode',
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/verify-reset-code', { email, code });
      return res.data;
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Invalid or expired code';
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ NEW: Reset password thunk
export const resetPassword = createAsyncThunk(
  'auth/resetPassword',
  async ({ email, code, newPassword }: { email: string; code: string; newPassword: string }, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/reset-password', { email, code, newPassword });
      return res.data;
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to reset password';
      return rejectWithValue(errorMessage);
    }
  }
);

// ✅ NEW: Get queue position thunk
export const getQueuePosition = createAsyncThunk(
  'auth/getQueuePosition',
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/auth/queue-position?email=${encodeURIComponent(email)}`);
      return res.data;
    } catch (error: any) {
      const errorMessage = 
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        'Failed to get queue position';
      return rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      if (action.payload) {
        state.isFirstLogin = action.payload.IsFirstLogin === 1;
        localStorage.setItem('user', JSON.stringify(action.payload));
      } else {
        localStorage.removeItem('user');
      }
    },
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isFirstLogin = false;
      state.error = null;
      state.successMessage = null;
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.successMessage = null;
    },
    updateFirstLogin: (state, action: PayloadAction<boolean>) => {
      state.isFirstLogin = action.payload;
      if (state.user) {
        state.user.IsFirstLogin = action.payload ? 1 : 0;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },
  },
  extraReducers: (builder) => {
    // Login
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user || null;
      state.isAuthenticated = true;
      state.isFirstLogin = action.payload.user?.IsFirstLogin === 1;
      state.error = null;
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Verify Token
    builder.addCase(verifyToken.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(verifyToken.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user || null;
      state.isAuthenticated = true;
      state.isFirstLogin = action.payload.user?.IsFirstLogin === 1;
    });
    builder.addCase(verifyToken.rejected, (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('user');
    });

    // Change Password
    builder.addCase(changePassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(changePassword.fulfilled, (state) => {
      state.isLoading = false;
      state.isFirstLogin = false;
      state.successMessage = 'Password changed successfully';
      if (state.user) {
        state.user.IsFirstLogin = 0;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Register
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(register.fulfilled, (state) => {
      state.isLoading = false;
      state.successMessage = 'Registration successful';
      state.error = null;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Resend Verification
    builder.addCase(resendVerification.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(resendVerification.fulfilled, (state, action) => {
      state.isLoading = false;
      state.successMessage = action.payload?.message || 'Verification email sent';
    });
    builder.addCase(resendVerification.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Verify Email
    builder.addCase(verifyEmail.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyEmail.fulfilled, (state, action) => {
      state.isLoading = false;
      state.successMessage = action.payload?.message || 'Email verified successfully';
    });
    builder.addCase(verifyEmail.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Forgot Password
    builder.addCase(forgotPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(forgotPassword.fulfilled, (state, action) => {
      state.isLoading = false;
      state.successMessage = action.payload?.message || 'Reset code sent to your email';
    });
    builder.addCase(forgotPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Verify Reset Code
    builder.addCase(verifyResetCode.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyResetCode.fulfilled, (state, action) => {
      state.isLoading = false;
      state.successMessage = action.payload?.message || 'Code verified';
    });
    builder.addCase(verifyResetCode.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Reset Password
    builder.addCase(resetPassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.successMessage = null;
    });
    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.isLoading = false;
      state.successMessage = action.payload?.message || 'Password reset successfully';
    });
    builder.addCase(resetPassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Get Queue Position
    builder.addCase(getQueuePosition.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(getQueuePosition.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(getQueuePosition.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setUser, logout, clearError, clearSuccess, updateFirstLogin } = authSlice.actions;
export default authSlice.reducer;