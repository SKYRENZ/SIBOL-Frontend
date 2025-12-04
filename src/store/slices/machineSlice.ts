import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import * as machineService from '../../services/machineService';
import type { Machine, Area, MachineStatus } from '../../services/machineService';

interface MachineState {
  machines: Machine[];
  areas: Area[];
  machineStatuses: MachineStatus[];
  selectedMachine: Machine | null;
  loading: boolean;
  error: string | null;
  searchTerm: string;
  currentPage: number;
  pageSize: number;
}

const initialState: MachineState = {
  machines: [],
  areas: [],
  machineStatuses: [],
  selectedMachine: null,
  loading: false,
  error: null,
  searchTerm: '',
  currentPage: 1,
  pageSize: 10,
};

// Async thunks
export const fetchMachines = createAsyncThunk(
  'machine/fetchMachines',
  async (_, { rejectWithValue }) => {
    try {
      const data = await machineService.getAllMachines();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch machines');
    }
  }
);

export const fetchAreas = createAsyncThunk(
  'machine/fetchAreas',
  async (_, { rejectWithValue }) => {
    try {
      const data = await machineService.getAreas();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch areas');
    }
  }
);

export const fetchMachineStatuses = createAsyncThunk(
  'machine/fetchStatuses',
  async (_, { rejectWithValue }) => {
    try {
      const data = await machineService.getMachineStatuses();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch statuses');
    }
  }
);

export const fetchAllMachineData = createAsyncThunk(
  'machine/fetchAllData',
  async (_, { rejectWithValue }) => {
    try {
      const [machines, areas, statuses] = await Promise.all([
        machineService.getAllMachines(),
        machineService.getAreas(),
        machineService.getMachineStatuses()
      ]);
      return { machines, areas, statuses };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch machine data');
    }
  }
);

export const createMachine = createAsyncThunk(
  'machine/createMachine',
  async (areaId: number, { rejectWithValue }) => {
    try {
      const data = await machineService.createMachine(areaId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to create machine');
    }
  }
);

export const updateMachine = createAsyncThunk(
  'machine/updateMachine',
  async (
    { machineId, updates }: { 
      machineId: number; 
      updates: { name?: string; areaId?: number; status?: number } 
    },
    { rejectWithValue }
  ) => {
    try {
      const data = await machineService.updateMachine(machineId, updates);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to update machine');
    }
  }
);

const machineSlice = createSlice({
  name: 'machine',
  initialState,
  reducers: {
    setSelectedMachine: (state, action: PayloadAction<Machine | null>) => {
      state.selectedMachine = action.payload;
    },
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.currentPage = 1;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setPageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch all machine data
    builder
      .addCase(fetchAllMachineData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllMachineData.fulfilled, (state, action) => {
        state.loading = false;
        state.machines = action.payload.machines;
        state.areas = action.payload.areas;
        state.machineStatuses = action.payload.statuses;
      })
      .addCase(fetchAllMachineData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch machines only
    builder
      .addCase(fetchMachines.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.loading = false;
        state.machines = action.payload;
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Fetch areas
    builder.addCase(fetchAreas.fulfilled, (state, action) => {
      state.areas = action.payload;
    });

    // Fetch statuses
    builder.addCase(fetchMachineStatuses.fulfilled, (state, action) => {
      state.machineStatuses = action.payload;
    });

    // Create machine
    builder
      .addCase(createMachine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMachine.fulfilled, (state, action) => {
        state.loading = false;
        state.machines.push(action.payload);
      })
      .addCase(createMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update machine
    builder
      .addCase(updateMachine.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMachine.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.machines.findIndex(m => m.machine_id === action.payload.machine_id);
        if (index !== -1) {
          state.machines[index] = action.payload;
        }
      })
      .addCase(updateMachine.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSelectedMachine,
  setSearchTerm,
  setCurrentPage,
  setPageSize,
  clearError,
} = machineSlice.actions;

export default machineSlice.reducer;