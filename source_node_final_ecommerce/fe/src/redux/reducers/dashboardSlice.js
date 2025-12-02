import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

// Simple Dashboard
export const getSimpleDashboard = createAsyncThunk(
  'dashboard/getSimple',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/dashboard/simple');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải dashboard');
    }
  }
);

// Advanced Dashboard
export const getAdvancedDashboard = createAsyncThunk(
  'dashboard/getAdvanced',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/dashboard/advanced', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải dashboard nâng cao');
    }
  }
);

// Quick Stats
export const getQuickStats = createAsyncThunk(
  'dashboard/getQuickStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/dashboard/stats');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tải thống kê');
    }
  }
);

const initialState = {
  simpleDashboard: null,
  advancedDashboard: null,
  quickStats: null,
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Simple Dashboard
      .addCase(getSimpleDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getSimpleDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.simpleDashboard = action.payload.data;
      })
      .addCase(getSimpleDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Advanced Dashboard
      .addCase(getAdvancedDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAdvancedDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.advancedDashboard = action.payload.data;
      })
      .addCase(getAdvancedDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Quick Stats
      .addCase(getQuickStats.fulfilled, (state, action) => {
        state.quickStats = action.payload.data;
      });
  }
});

export const { clearError } = dashboardSlice.actions;
export default dashboardSlice.reducer;