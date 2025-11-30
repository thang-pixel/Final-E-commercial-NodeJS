import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

// Tạo đơn hàng
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/orders', orderData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tạo đơn hàng');
    }
  }
);

// Lấy danh sách đơn hàng
export const getMyOrders = createAsyncThunk(
  'orders/getMyOrders',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/orders', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy danh sách đơn hàng');
    }
  }
);

// Lấy chi tiết đơn hàng
export const getOrderDetail = createAsyncThunk(
  'orders/getDetail',
  async (orderId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy chi tiết đơn hàng');
    }
  }
);

// Hủy đơn hàng
export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async ({ orderId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/orders/${orderId}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi hủy đơn hàng');
    }
  }
);

const initialState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
  meta: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  },
  orderCreated: null, // Đơn hàng vừa tạo thành công
};

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
    clearOrderCreated: (state) => {
      state.orderCreated = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Tạo đơn hàng
      .addCase(createOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.orderCreated = action.payload.data;
        // Thêm đơn hàng mới vào đầu danh sách
        state.orders.unshift(action.payload.data.order);
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Lấy danh sách đơn hàng
      .addCase(getMyOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;
        state.meta = action.payload.meta;
      })
      .addCase(getMyOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Lấy chi tiết đơn hàng
      .addCase(getOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.currentOrder = action.payload.data;
      })
      .addCase(getOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Hủy đơn hàng
      .addCase(cancelOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật trong danh sách
        const index = state.orders.findIndex(order => order._id === action.payload.data._id);
        if (index !== -1) {
          state.orders[index] = action.payload.data;
        }
        // Cập nhật chi tiết nếu đang xem
        if (state.currentOrder && state.currentOrder._id === action.payload.data._id) {
          state.currentOrder = action.payload.data;
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearCurrentOrder, clearOrderCreated } = orderSlice.actions;
export default orderSlice.reducer;