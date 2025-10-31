import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { API_DOMAIN } from '../../constants/apiDomain';

export const getAll = createAsyncThunk('categories/getAll', async (queryParams = {}, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_DOMAIN}/api/categories`, { params: queryParams });
    if (res.data.success) {
      return {
        categories: res.data.data,
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
});

export const getCategoryById = createAsyncThunk('categories/getById', async (id, { rejectWithValue }) => {
  try {
    const res = await axios.get(`${API_DOMAIN}/api/categories/${id}/show`);
    if (res.data.success) return res.data.data;
    return rejectWithValue({ message: res.data.message, errors: res.data.errors });
  } catch (error) {
    return rejectWithValue({
      message: error.response?.data?.message || 'Get Category Failed',
      errors: error.response?.data?.errors || null,
    });
  }
});

export const add = createAsyncThunk('categories/add', async (categoryData, { rejectWithValue }) => {
  try {
    const res = await axios.post(`${API_DOMAIN}/api/categories`, categoryData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    if (res.data.success)
      return { data: res.data.data, message: res.data.message };
    return rejectWithValue({ message: res.data.message });
  } catch (error) {
    return rejectWithValue({
      message: error.response?.data?.message || 'Add Category Failed',
      errors: error.response?.data?.errors || null,
    });
  }
});

export const edit = createAsyncThunk('categories/edit', async ({ id, categoryData }, { rejectWithValue }) => {
  try {
    const res = await axios.put(`${API_DOMAIN}/api/categories/edit/${id}`, categoryData);
    if (res.data.success)
      return { data: res.data.data, message: res.data.message };
    return rejectWithValue({ message: res.data.message });
  } catch (error) {
    return rejectWithValue({
      message: error.response?.data?.message || 'Edit Category Failed',
      errors: error.response?.data?.errors || null,
    });
  }
});

export const deleteCategory = createAsyncThunk('categories/delete', async (id, { rejectWithValue }) => {
  try {
    const res = await axios.delete(`${API_DOMAIN}/api/categories/${id}`);
    if (res.data.success) return { data: id, message: res.data.message };
    return rejectWithValue({ message: res.data.message });
  } catch (error) {
    return rejectWithValue({
      message: error.response?.data?.message || 'Delete Category Failed',
      errors: error.response?.data?.errors || null,
    });
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    currentCategory: null,
    meta: null,
    loading: false,
    message: '',
    errors: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAll.fulfilled, (state, action) => {
        state.categories = action.payload.categories;
        state.meta = action.payload.meta;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
        state.loading = false;
      })
      .addCase(add.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.categories.push(action.payload.data);
        }
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(edit.fulfilled, (state, action) => {
        const updated = action.payload.data;
        const index = state.categories.findIndex(cat => cat._id === updated._id);
        if (index !== -1) state.categories[index] = updated;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        const deletedId = action.payload.data;
        state.categories = state.categories.filter(cat => cat._id !== deletedId);
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
          state.message = action.payload?.message || action.payload || 'Lỗi không xác định';
        }
      );
  },
});

export default categorySlice.reducer;
