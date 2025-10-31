import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_DOMAIN } from '../../constants/apiDomain';
import axios from 'axios';

export const getAllBrands = createAsyncThunk(
  'brands/all',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_DOMAIN}/api/brands`, {
        params: queryParams,
      });
      if (res.data.success) {
        return {
          brands: res.data.data,
          meta: res.data.meta,
          message: res.data.message,
        };
      }
      return rejectWithValue({ message: res.data.message });
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Get All Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

export const getBrandById = createAsyncThunk(
  'brands/getById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.get(`${API_DOMAIN}/api/brands/${id}/detail`); 
      if (res.data.success) return res.data.data;
      
      return rejectWithValue({
        message: res.data.message,
        errors: res.data.errors,
      });
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Get Brand Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

export const addBrand = createAsyncThunk(
  'brands/add',
  async (brandData, { rejectWithValue }) => {
    try {
      const res = await axios.post(`${API_DOMAIN}/api/brands`, brandData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data.success) return {
        data: res.data.data,
        message: res.data.message,
      };
      return rejectWithValue({
        message: res.data.message,
        errors: res.data.errors,
      });
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Add Brand Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

export const editBrand = createAsyncThunk(
  'brands/edit',
  async ({ id, brandData }, { rejectWithValue }) => {
    try {
      const res = await axios.put(
        `${API_DOMAIN}/api/brands/${id}/edit`,
        brandData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
      if (res.data.success) return {
        data: res.data.data,
        message: res.data.message,
      };
      return rejectWithValue({
        message: res.data.message,
        errors: res.data.errors,
      });
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Edit Brand Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

export const changeBrandStatus = createAsyncThunk(
  'brands/changeStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const res = await axios.patch(
        `${API_DOMAIN}/api/brands/${id}/change-status`,
        { status }
      );
      if (res.data.success) return res.data.data;
      return rejectWithValue({
        message: res.data.message,
        errors: res.data.errors,
      });
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Change Status Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);


// set deleted = true
export const deleteBrand = createAsyncThunk(
  'brands/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await axios.delete(`${API_DOMAIN}/api/brands/${id}`);
      if (res.data.success) return {
        data: id,
        message: res.data.message,
      };
      return rejectWithValue({ message: res.data.message });
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Delete Brand Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

const initState = {
  brands: [],
  loading: false,
  message: '',
  errors: null,
  currentBrand: null,
  meta: null,
};

const brandSlice = createSlice({
  name: 'brands',
  initialState: initState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllBrands.fulfilled, (state, action) => {
        state.brands = action.payload.brands;
        state.meta = action.payload.meta;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(getBrandById.fulfilled, (state, action) => {
        state.currentBrand = action.payload;
        state.loading = false;
      })
      .addCase(addBrand.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.brands.push(action.payload.data);
        }
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(editBrand.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.brands.findIndex(
          (cat) => cat._id === updated._id
        );
        if (index !== -1) state.brands[index] = updated;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(deleteBrand.fulfilled, (state, action) => {
        state.brands = state.brands.filter(
          (brand) => brand._id !== action.payload.data
        );
        state.message = action.payload.message;
        state.loading = false;
      })
      // 🔥 Gom matcher xử lý pending/rejected chung
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
          state.errors = null;
          state.message = '';
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.errors = action.payload?.errors || null;
          state.message =
            action.payload?.message || action.payload || 'Lỗi không xác định';
        }
      );
  },
});
 
export default brandSlice.reducer;
