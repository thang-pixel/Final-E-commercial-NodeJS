import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios'; 

export const getAllCategory = createAsyncThunk('categories/getAll', async (queryParams = {}, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/categories`, { params: queryParams });
    if (res.data.success) {
      return {
        data: res.data.data,
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

// cate root
export const getAllRootCategory = createAsyncThunk('categories/getAllRoot', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/categories/root`);
    if (res.data.success) return res.data.data;
    return rejectWithValue({ message: res.data.message });
  } catch (error) {
    return rejectWithValue({
      message: error.response?.data?.message || 'Get Root Categories Failed',
      errors: error.response?.data?.errors || null,
    });
  }
});

export const getCategoryById = createAsyncThunk('categories/getById', async (id, { rejectWithValue }) => {
  try {
    const res = await api.get(`/api/categories/${id}/show`);
    if (res.data.success) return res.data.data;
    return rejectWithValue({ message: res.data.message, errors: res.data.errors });
  } catch (error) {
    return rejectWithValue({
      message: error.response?.data?.message || 'Get Category Failed',
      errors: error.response?.data?.errors || null,
    });
  }
});

export const addCategory = createAsyncThunk('categories/add', async (categoryData, { rejectWithValue }) => {
  try {
    const res = await api.post(`/api/categories`, categoryData, {
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

export const editCategory = createAsyncThunk('categories/edit', async ({ id, categoryData }, { rejectWithValue }) => {
  try {
    const res = await api.put(`/api/categories/edit/${id}`, categoryData);
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
    const res = await api.delete(`/api/categories/${id}`);
    if (res.data.success) return { data: id, message: res.data.message };
    return rejectWithValue({ message: res.data.message });
  } catch (error) {
    console.log(error);
    return rejectWithValue({
      message: error.response?.data?.message || 'Delete Category Failed',
      errors: error.response?.data?.errors || null,
    });
  }
});

const categorySlice = createSlice({
  name: 'categories',
  initialState: {
    rootCategories: [],
    treeCategories: [],
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
      .addCase(getAllCategory.fulfilled, (state, action) => {
        state.categories = action.payload.data;
        state.meta = action.payload.meta;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(getAllRootCategory.fulfilled, (state, action) => {
        state.rootCategories = action.payload;
        state.loading = false;
      })
      .addCase(getCategoryById.fulfilled, (state, action) => {
        state.currentCategory = action.payload;
        state.loading = false;
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        if (action.payload?.data) {
          state.categories.push(action.payload.data);
        }
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(editCategory.fulfilled, (state, action) => {
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
