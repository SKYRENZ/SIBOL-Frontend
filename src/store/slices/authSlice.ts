import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as authService from '../../services/authService';

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
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isFirstLogin: boolean;
}

const initialState: AuthState = {
  user: authService.getUser(),
  token: localStorage.getItem('token'),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
  isFirstLogin: authService.isFirstLogin(),
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await authService.login(username, password);
      return data;
    } catch (error: any) {
      // ✅ Better error extraction
      const errorMessage = 
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.data?.error ||
        error?.data?.message ||
        error?.message ||
        'Invalid username or password';
      
      console.error('Login error:', errorMessage);
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
      state.token = null;
      state.isAuthenticated = false;
      state.isFirstLogin = false;
      state.error = null;
      authService.logout();
    },
    clearError: (state) => {
      state.error = null;
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
    });

    // Change Password
    builder.addCase(changePassword.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(changePassword.fulfilled, (state) => {
      state.isLoading = false;
      state.isFirstLogin = false;
      if (state.user) {
        state.user.IsFirstLogin = 0;
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    });
    builder.addCase(changePassword.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { setUser, logout, clearError, updateFirstLogin } = authSlice.actions;
export default authSlice.reducer;