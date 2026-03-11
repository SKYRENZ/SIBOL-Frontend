import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as superAdminService from '../../services/superAdminService';
import { Account, Role, Module, Barangay } from '../../types/adminTypes';
import { RootState } from '../store';

interface SuperAdminState {
  accounts: Account[];
  roles: Role[];
  modules: Module[];
  barangays: Barangay[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: SuperAdminState = {
  accounts: [],
  roles: [],
  modules: [],
  barangays: [],
  status: 'idle',
  error: null,
};

export const fetchSuperAdminData = createAsyncThunk('superadmin/fetchData', async () => {
  const [accounts, roles, modules, barangays] = await Promise.all([
    superAdminService.fetchAdmins(),
    superAdminService.fetchUserRoles(),
    superAdminService.fetchModules(),
    superAdminService.fetchBarangays(),
  ]);
  return { accounts, roles, modules, barangays };
});

export const createAdminAccount = createAsyncThunk(
  'superadmin/createAdminAccount',
  async (accountData: Partial<Account>) => {
    const newAccount = await superAdminService.createAdmin(accountData);
    return newAccount;
  }
);

export const updateAdminAccount = createAsyncThunk(
  'superadmin/updateAdminAccount',
  async ({ accountId, updates }: { accountId: number; updates: Partial<Account> }) => {
    const updatedAccount = await superAdminService.updateAdmin(accountId, updates);
    return updatedAccount;
  }
);

export const toggleAdminAccountActive = createAsyncThunk(
  'superadmin/toggleAdminAccountActive',
  async ({ accountId, isActive }: { accountId: number; isActive: boolean }) => {
    const updatedAccount = await superAdminService.toggleAdminActive(accountId, isActive);
    return updatedAccount;
  }
);

const superAdminSlice = createSlice({
  name: 'superadmin',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSuperAdminData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSuperAdminData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.accounts = action.payload.accounts;
        state.roles = action.payload.roles;
        state.modules = action.payload.modules;
        state.barangays = action.payload.barangays;
      })
      .addCase(fetchSuperAdminData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to fetch super admin data';
      })
      .addCase(createAdminAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        state.accounts.push(action.payload);
      })
      .addCase(updateAdminAccount.fulfilled, (state, action: PayloadAction<Account>) => {
        const index = state.accounts.findIndex(acc => acc.Account_id === action.payload.Account_id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      })
      .addCase(toggleAdminAccountActive.fulfilled, (state, action: PayloadAction<Account>) => {
        const index = state.accounts.findIndex(acc => acc.Account_id === action.payload.Account_id);
        if (index !== -1) {
          state.accounts[index] = action.payload;
        }
      });
  },
});

export const selectSuperAdminAccounts = (state: RootState) => state.superadmin.accounts;
export const selectSuperAdminStatus = (state: RootState) => state.superadmin.status;
export const selectSuperAdminError = (state: RootState) => state.superadmin.error;

export default superAdminSlice.reducer;
