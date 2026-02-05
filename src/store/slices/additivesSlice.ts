import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchJson } from '../../services/apiClient';

export interface AdditiveRow {
  id: number;
  machine_id: number;
  additive_input: string;
  stage: string;
  value: number;
  units: string;
  date: string;
  time: string;
  person_in_charge?: string;
  machine_name?: string | null;
}

export const fetchAdditives = createAsyncThunk<AdditiveRow[], number | void>(
  'additives/fetch',
  async (machine_id) => {
    const url = machine_id ? `/api/additives?machine_id=${machine_id}` : '/api/additives';
    return fetchJson<AdditiveRow[]>(url);
  }
);

const slice = createSlice({
  name: 'additives',
  initialState: {
    items: [] as AdditiveRow[],
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdditives.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdditives.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchAdditives.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message ?? 'Failed to load';
      });
  },
});

export default slice.reducer;