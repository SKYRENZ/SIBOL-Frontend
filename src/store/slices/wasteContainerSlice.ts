import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as wasteContainerService from '../../services/wasteContainerService';
import type { WasteContainer, AreaLog, CreateContainerRequest } from '../../services/wasteContainerService';

interface WasteContainerState {
  containers: WasteContainer[];
  selectedContainer: WasteContainer | null;
  logs: AreaLog[];
  loading: boolean;
  logsLoading: boolean;
  error: string | null;
  searchTerm: string;
  currentPage: number;
  pageSize: number;
}

const initialState: WasteContainerState = {
  containers: [],
  selectedContainer: null,
  logs: [],
  loading: false,
  logsLoading: false,
  error: null,
  searchTerm: '',
  currentPage: 1,
  pageSize: 10,
};

// Async thunks
export const fetchContainers = createAsyncThunk(
  'wasteContainer/fetchContainers',
  async (_, { rejectWithValue }) => {
    try {
      const data = await wasteContainerService.getWasteContainers();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch containers');
    }
  }
);

export const createContainer = createAsyncThunk(
  'wasteContainer/createContainer',
  async (payload: CreateContainerRequest & { latitude?: number; longitude?: number }, { rejectWithValue }) => {
    try {
      const data = await wasteContainerService.createWasteContainer(payload);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create container');
    }
  }
);

export const fetchAreaLogs = createAsyncThunk(
  'wasteContainer/fetchAreaLogs',
  async (areaId: number, { rejectWithValue }) => {
    try {
      const data = await wasteContainerService.getAreaLogs(areaId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch area logs');
    }
  }
);

const wasteContainerSlice = createSlice({
  name: 'wasteContainer',
  initialState,
  reducers: {
    setSelectedContainer: (state, action: PayloadAction<WasteContainer | null>) => {
      state.selectedContainer = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1; // Reset to first page on search
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1; // Reset to first page on page size change
    },
    clearLogs: (state) => {
      state.logs = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch containers
    builder
      .addCase(fetchContainers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContainers.fulfilled, (state, action) => {
        state.loading = false;
        state.containers = action.payload;
      })
      .addCase(fetchContainers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create container
    builder
      .addCase(createContainer.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createContainer.fulfilled, (state, action) => {
        state.loading = false;
        state.containers.push(action.payload);
      })
      .addCase(createContainer.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch area logs
    builder
      .addCase(fetchAreaLogs.pending, (state) => {
        state.logsLoading = true;
        state.error = null;
      })
      .addCase(fetchAreaLogs.fulfilled, (state, action) => {
        state.logsLoading = false;
        state.logs = action.payload;
      })
      .addCase(fetchAreaLogs.rejected, (state, action) => {
        state.logsLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedContainer,
  setSearchTerm,
  setCurrentPage,
  setPageSize,
  clearLogs,
  clearError,
} = wasteContainerSlice.actions;

export default wasteContainerSlice.reducer;