import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

// Lấy thông tin profile
export const getMyProfile = createAsyncThunk(
  'user/getMyProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/users/me');
      console.log('API response for getMyProfile:', response.data);
      return response.data.data; // Lấy data từ response
    } catch (error) {
      console.error('Error in getMyProfile:', error);
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy thông tin cá nhân');
    }
  }
);

// Cập nhật profile
export const updateMyProfile = createAsyncThunk(
  'user/updateMyProfile',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/users/me', userData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật thông tin');
    }
  }
);

// Đổi mật khẩu
export const changeMyPassword = createAsyncThunk(
  'user/changeMyPassword',
  async (passwordData, { rejectWithValue }) => {
    try {
      const response = await api.patch('/api/users/me/change-password', passwordData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi đổi mật khẩu');
    }
  }
);

// Thêm địa chỉ
export const addAddress = createAsyncThunk(
  'user/addAddress',
  async (addressData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/users/me/address', addressData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi thêm địa chỉ');
    }
  }
);

// Cập nhật địa chỉ
export const updateAddress = createAsyncThunk(
  'user/updateAddress',
  async ({ addressId, addressData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/api/users/me/address/${addressId}`, addressData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi cập nhật địa chỉ');
    }
  }
);

// Xóa địa chỉ
export const deleteAddress = createAsyncThunk(
  'user/deleteAddress',
  async (addressId, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/users/me/address/${addressId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi xóa địa chỉ');
    }
  }
);

const initialState = {
  profile: null,
  addresses: [],
  loading: false,
  error: null,
  success: null
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = null;
    },
    clearProfile: (state) => {
      state.profile = null;
      state.addresses = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Lấy profile
      .addCase(getMyProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.addresses = action.payload?.addresses || [];
        
        console.log('Profile saved to Redux:', action.payload);
        console.log('Addresses saved to Redux:', state.addresses);
      })
      .addCase(getMyProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        console.error('getMyProfile rejected:', action.payload);
      })
      
      // Cập nhật profile
      .addCase(updateMyProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.addresses = action.payload.addresses || [];
        state.success = 'Cập nhật thông tin thành công';
      })
      
      // Đổi mật khẩu
      .addCase(changeMyPassword.fulfilled, (state, action) => {
        state.success = 'Đổi mật khẩu thành công';
      })
      
      // Thêm địa chỉ
      .addCase(addAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
        state.addresses = action.payload.addresses || [];
        state.success = 'Thêm địa chỉ thành công';
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Cập nhật địa chỉ
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.addresses = action.payload.addresses || [];
        state.success = 'Cập nhật địa chỉ thành công';
      })
      
      // Xóa địa chỉ
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.profile = action.payload;
        state.addresses = action.payload.addresses || [];
        state.success = 'Xóa địa chỉ thành công';
      });
  }
});

export const { clearError, clearSuccess, clearProfile } = userSlice.actions;
export default userSlice.reducer;