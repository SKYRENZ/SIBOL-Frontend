import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as adminService from '../../services/adminService';
import { Account, Role, Module, Barangay } from '../../types/adminTypes';
import { RootState } from '../store';

// Define the shape of the admin state
interface AdminState {
  accounts: Account[];
  pendingAccounts: Account[];
  roles: Role[];
  modules: Module[];
  barangays: Barangay[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

// Define the initial state
const initialState: AdminState = {
  accounts: [],
  pendingAccounts: [],
  roles: [],
  modules: [],
  barangays: [],
  status: 'idle',
  error: null,
};

// Async thunk for fetching all primary admin data
export const fetchAdminData = createAsyncThunk('admin/fetchData', async () => {
  // Fetch all data in parallel for efficiency
  const [accounts, pending, roles, modules, barangays] = await Promise.all([
    adminService.fetchAccounts(),
    adminService.fetchPendingAccounts(),
    adminService.fetchUserRoles(),
    adminService.fetchModules(),
    adminService.fetchBarangays(),
  ]);
  return { accounts, pending, roles, modules, barangays };
});

// Async thunk for approving a pending account
export const approvePendingAccount = createAsyncThunk(
  'admin/approveAccount',
  async (pendingId: number) => {
    await adminService.approvePending(pendingId);
    return pendingId; // Return the ID to identify which account to remove from the list
  }
);

// Async thunk for rejecting a pending account
export const rejectPendingAccount = createAsyncThunk(
  'admin/rejectAccount',
  async ({ pendingId, reason }: { pendingId: number; reason?: string }) => {
    await adminService.rejectPending(pendingId, reason);
    return pendingId; // Return the ID for removal
  }
);

// Async thunk for creating an account
export const createAccount = createAsyncThunk(
  'admin/createAccount',
  async (accountData: Partial<Account>) => {
    const newAccount = await adminService.createAccount(accountData);
    return newAccount;
  }
);

// Async thunk for updating an account
export const updateAccount = createAsyncThunk(
  'admin/updateAccount',
  async ({ accountId, updates }: { accountId: number; updates: Partial<Account> }) => {
    const updatedAccount = await adminService.updateAccount(accountId, updates);
    return updatedAccount;
  }
);

// Async thunk for toggling account status
export const toggleAccountActive = createAsyncThunk(
  'admin/toggleAccountActive',
  async ({ accountId, isActive }: { accountId: number; isActive: boolean }) => {
    const updatedAccount = await adminService.toggleAccountActive(accountId, isActive);
    return updatedAccount;
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Handle fetching all data
      .addCase(fetchAdminData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchAdminData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accounts = action.payload.accounts;
        state.pendingAccounts = action.payload.pending;
        state.roles = action.payload.roles;
        state.modules = action.payload.modules;
        state.barangays = action.payload.barangays;
      })
      .addCase(fetchAdminData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch admin data';
      })
      // Handle approving an account
      .addCase(approvePendingAccount.fulfilled, (state, action) => {
        // Remove the approved account from the pending list
        state.pendingAccounts = state.pendingAccounts.filter(
          (acc) => acc.Pending_id !== action.payload
        );
        // We should refetch the main accounts list to see the new user,
        // or optimistically add them if the API returns the new user data.
      })
      // Handle rejecting an account
      .addCase(rejectPendingAccount.fulfilled, (state, action) => {
        state.pendingAccounts = state.pendingAccounts.filter(
          (acc) => acc.Pending_id !== action.payload
        );
      })
      // Handle creating an account
      .addCase(createAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        state.accounts.push(action.payload); // Add the new account to the list
      })
      // Handle updating an account
      .addCase(updateAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        const index = state.accounts.findIndex(acc => acc.Account_id === action.payload.Account_id);
        if (index !== -1) {
          state.accounts[index] = action.payload; // Replace with the updated account
        }
      })
      // Handle toggling active status
      .addCase(toggleAccountActive.fulfilled, (state, action: PayloadAction<Account>) => {
        const index = state.accounts.findIndex(acc => acc.Account_id === action.payload.Account_id);
        if (index !== -1) {
          state.accounts[index] = action.payload; // Replace with the updated account
        }
      });
  },
});

// Selectors to pull data from the store
export const selectAdminAccounts = (state: RootState) => state.admin.accounts;
export const selectPendingAccounts = (state: RootState) => state.admin.pendingAccounts;
export const selectAdminStatus = (state: RootState) => state.admin.status;
export const selectAdminError = (state: RootState) => state.admin.error;
export const selectAdminRoles = (state: RootState) => state.admin.roles;

export default adminSlice.reducer;