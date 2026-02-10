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

  isLoading: boolean; // keep for login/register/etc
  isCheckingAuth: boolean; // ✅ new: only for cookie verify on app start
  hasCheckedAuth: boolean; // ✅ new: prevents guard redirect before verify completes

  error: string | null;
  isFirstLogin: boolean;
  successMessage: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,

  isLoading: false,
  isCheckingAuth: false,
  hasCheckedAuth: false,

  error: null,
  isFirstLogin: false,
  successMessage: null,
};

// ✅ Existing thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ identifier, password }: { identifier: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authService.login(identifier, password);
      return data;
    } catch (error: any) {
      const errorMessage = 'Invalid username/email or password';
      return rejectWithValue(errorMessage);
    }
  }
);

export const verifyToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      // authService.verifyToken() should return the User or null
      const user = await authService.verifyToken();
      if (!user) return rejectWithValue('Token verification failed');
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

// ✅ CHANGE: type the thunk return + rejectValue
export const register = createAsyncThunk<
  authService.RegisterResponse,
  any,
  { rejectValue: string }
>(
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

type ApiMessageResponse = { success?: boolean; message?: string; [k: string]: any };

// ✅ Resend verification thunk (typed)
export const resendVerification = createAsyncThunk<
  ApiMessageResponse,
  string,
  { rejectValue: string }
>(
  'auth/resendVerification',
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/resend-verification', { email });
      return res.data as ApiMessageResponse;
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

// ✅ Verify email thunk (typed)
export const verifyEmail = createAsyncThunk<
  ApiMessageResponse,
  string,
  { rejectValue: string }
>(
  'auth/verifyEmail',
  async (token: string, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/auth/verify-email/${token}`);
      return res.data as ApiMessageResponse;
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

// ✅ Forgot password thunk (typed)
export const forgotPassword = createAsyncThunk<
  ApiMessageResponse,
  string,
  { rejectValue: string }
>(
  'auth/forgotPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/forgot-password', { email });
      return res.data as ApiMessageResponse;
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

// ✅ Verify reset code thunk (typed)
export const verifyResetCode = createAsyncThunk<
  ApiMessageResponse,
  { email: string; code: string },
  { rejectValue: string }
>(
  'auth/verifyResetCode',
  async ({ email, code }, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/verify-reset-code', { email, code });
      return res.data as ApiMessageResponse;
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

// ✅ Reset password thunk (typed)
export const resetPassword = createAsyncThunk<
  ApiMessageResponse,
  { email: string; code: string; newPassword: string },
  { rejectValue: string }
>(
  'auth/resetPassword',
  async ({ email, code, newPassword }, { rejectWithValue }) => {
    try {
      const res = await api.post('/api/auth/reset-password', { email, code, newPassword });
      return res.data as ApiMessageResponse;
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

type QueueInfo = {
  position: number;
  totalPending: number;
  estimatedWaitTime: string;
};

// ✅ Replace your previous QueuePositionResponse/getQueuePosition with this:
export const getQueuePosition = createAsyncThunk<
  QueueInfo,
  string,
  { rejectValue: string }
>(
  'auth/getQueuePosition',
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await api.get('/api/auth/queue-position', {
        params: { email },
      });

      const data: any = res.data;

      if (data?.success === false) {
        return rejectWithValue(data?.error || data?.message || 'Failed to get queue position');
      }

      // supports either {position,totalPending,estimatedWaitTime} or {queueInfo:{...}}
      const q = data?.queueInfo ?? data;

      const position = Number(q?.position);
      const totalPending = Number(q?.totalPending);
      const estimatedWaitTime = String(q?.estimatedWaitTime ?? '');

      if (!Number.isFinite(position) || !Number.isFinite(totalPending) || !estimatedWaitTime) {
        return rejectWithValue('Invalid queue position response from server');
      }

      return { position, totalPending, estimatedWaitTime };
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
      state.isFirstLogin = action.payload ? action.payload.IsFirstLogin === 1 : false;
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
        // DO NOT write to localStorage
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

      const user = action.payload.user || null;

      state.user = user;
      state.isAuthenticated = !!user; // ✅ was always true
      state.isFirstLogin = user ? user.IsFirstLogin === 1 : false;

      // ✅ after a successful login response, treat auth as checked
      state.hasCheckedAuth = true;
      state.isCheckingAuth = false;

      state.error = user ? null : 'Login succeeded but no user returned';
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = false; // ✅ be explicit
      state.user = null;
      state.error = action.payload as string;
    });

    // Verify Token
    builder.addCase(verifyToken.pending, (state) => {
      state.isCheckingAuth = true;
    });
    builder.addCase(verifyToken.fulfilled, (state, action) => {
      state.isCheckingAuth = false;
      state.hasCheckedAuth = true;

      state.user = action.payload.user || null;
      state.isAuthenticated = true;
      state.isFirstLogin = action.payload.user?.IsFirstLogin === 1;
    });
    builder.addCase(verifyToken.rejected, (state) => {
      state.isCheckingAuth = false;
      state.hasCheckedAuth = true;

      state.isAuthenticated = false;
      state.user = null;
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