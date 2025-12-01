import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

// Tạo thanh toán VNPay
export const createVNPayPayment = createAsyncThunk(
  'payment/createVNPay',
  async ({ order_id, bank_code }, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/payment/vnpay/create', {
        order_id,
        bank_code
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi tạo thanh toán VNPay');
    }
  }
);

// Kiểm tra trạng thái thanh toán
export const getPaymentStatus = createAsyncThunk(
  'payment/getStatus',
  async (payment_id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/payment/${payment_id}/status`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi lấy trạng thái thanh toán');
    }
  }
);

// Query thanh toán từ VNPay
export const queryPaymentStatus = createAsyncThunk(
  'payment/queryStatus',
  async (order_id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/payment/query/${order_id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Lỗi query thanh toán');
    }
  }
);

const initialState = {
  currentPayment: null,
  loading: false,
  error: null,
  vnpayUrl: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearVNPayUrl: (state) => {
      state.vnpayUrl = null;
    },
    clearCurrentPayment: (state) => {
      state.currentPayment = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Tạo VNPay payment
      .addCase(createVNPayPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createVNPayPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.data;
        state.vnpayUrl = action.payload.data.payment_url;
      })
      .addCase(createVNPayPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Get payment status
      .addCase(getPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPayment = action.payload.data;
      })
      .addCase(getPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
      // Query payment status
      .addCase(queryPaymentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(queryPaymentStatus.fulfilled, (state, action) => {
        state.loading = false;
        // Cập nhật payment status từ query result
        if (state.currentPayment) {
          state.currentPayment.status = action.payload.data.payment_status;
        }
      })
      .addCase(queryPaymentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError, clearVNPayUrl, clearCurrentPayment } = paymentSlice.actions;
export default paymentSlice.reducer;