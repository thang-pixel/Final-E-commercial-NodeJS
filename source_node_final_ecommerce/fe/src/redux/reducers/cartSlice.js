import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '../../api/axios';

/**
 * carts = [
 * {
 * product_id, variant_id, quantity, price, image_url, name, sku, attributes
 * }
 * ]
 */
// load cart from server
export const fetchCartUser = createAsyncThunk(
  'cart/fetchCart',
  async (userId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/api/carts/${userId}`);
      if (res.data) {
        return {
          data: res.data.data.items,
          message: res.data.message,
        };
      }
      return rejectWithValue({
        message: res.data.message,
        errors: res.data.errors,
      });
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Cart Api Error',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

export const addToCartUser = createAsyncThunk(
  'cart/addToCart',
  async ({ userId, body }, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/carts/${userId}/add`, body);
      if (res.data) {
        return {
          data: res.data.data.items,
          message: res.data.message,
        };
      }
      return rejectWithValue({
        message: res.data.message,
        errors: res.data.errors,
      });
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Cart Api Error',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

export const updateCartItemUser = createAsyncThunk(
  'cart/updateCartItem',
  async (
    { user_id, product_id, variant_id, quantity },
    { rejectWithValue }
  ) => {
    try {
      console.log('Updating cart item: ', {
        user_id,
        product_id,
        variant_id,
        quantity,
      });
      const res = await api.put(`/api/carts/${user_id}/update`, {
        product_id,
        variant_id,
        quantity,
      });
      if (res.data) {
        return {
          data: res.data.data.items,
          message: res.data.message,
        };
      }
      return rejectWithValue({
        message: res.data.message,
        errors: res.data.errors,
      });
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Cart Api Error',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

export const removeItemCartUser = createAsyncThunk(
  'cart/removeItemFromCart',
  async ({ user_id, product_id, variant_id }, { rejectWithValue }) => {
    try {
      console.log('Removing item from cart: ', {
        user_id,
        product_id,
        variant_id,
      });
      const res = await api.delete(`/api/carts/${user_id}/remove`, {
        data: {
          product_id,
          variant_id,
        },
      });
      if (res.data) {
        return {
          data: res.data.data.items,
          message: res.data.message,
        };
      }
      return rejectWithValue({
        message: res.data.message,
        errors: res.data.errors,
      });
    } catch (error) {
      console.error('Error removing item from cart: ', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'Cart Api Error',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

export const clearCartUser = createAsyncThunk(
  'cart/clearCart',
  async (user_id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/api/carts/${user_id}/clear`);
      if (res.data) {
        return {
          data: res.data.data.items,
          message: res.data.message,
        };
      }
      return rejectWithValue({
        message: res.data.message,
        errors: res.data.errors,
      });
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Cart Api Error',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

const loadCartLocal = () => {
  const cartData = localStorage.getItem('carts');
  if (cartData) {
    try {
      return JSON.parse(cartData);
    } catch (error) {
      console.error('Error parsing cart data from localStorage:', error);
      return [];
    }
  }
  return [];
};

const initState = {
  carts: loadCartLocal() || [],
  loading: false,
  message: '',
  errors: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: initState,
  reducers: {
    clearCartState: (state) => {
      localStorage.removeItem('carts');
      state.carts = [];
      state.loading = false;
      state.message = '';
      state.errors = null;
    },

    clearCart: (state) => {
      localStorage.removeItem('carts');
      state.carts = [];
    },

    addToCart: (state, action) => {
      const { product_id, variant_id } = action.payload;

      const existingItemIndex = state.carts.findIndex(
        (item) =>
          item.product_id === product_id && item.variant_id === variant_id
      );
      if (existingItemIndex !== -1) {
        state.carts[existingItemIndex].quantity += action.payload.quantity;
      } else {
        state.carts.push(action.payload);
      }
      localStorage.setItem('carts', JSON.stringify(state.carts));
    },
    updateQuantity: (state, action) => {
      const { product_id, variant_id, quantity } = action.payload;
      const itemIndex = state.carts.findIndex(
        (item) =>
          item.product_id === product_id && item.variant_id === variant_id
      );
      if (quantity === 0) {
        state.carts = state.carts.filter(
          (item) =>
            !(item.product_id === product_id && item.variant_id === variant_id)
        );
        localStorage.setItem('carts', JSON.stringify(state.carts));
      } else if (itemIndex !== -1) {
        state.carts[itemIndex].quantity = quantity;
        localStorage.setItem('carts', JSON.stringify(state.carts));
      }
    },
    removeFromCart: (state, action) => {
      const { product_id, variant_id } = action.payload;
      state.carts = state.carts.filter(
        (item) =>
          !(item.product_id === product_id && item.variant_id === variant_id)
      );
      localStorage.setItem('carts', JSON.stringify(state.carts));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCartUser.fulfilled, (state, action) => {
        state.carts = action.payload.data;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(addToCartUser.fulfilled, (state, action) => {
        state.carts = action.payload.data;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(updateCartItemUser.fulfilled, (state, action) => {
        state.carts = action.payload.data;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(removeItemCartUser.fulfilled, (state, action) => {
        state.carts = action.payload.data;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addCase(clearCartUser.fulfilled, (state, action) => {
        state.carts = action.payload.data;
        state.message = action.payload.message;
        state.loading = false;
      })
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          state.loading = true;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          state.loading = false;
          state.errors = action.payload || action.error.message;
        }
      );
  },
});

export const {
  clearCartState,
  clearCart,
  addToCart,
  updateQuantity,
  removeFromCart,
} = cartSlice.actions;

export default cartSlice.reducer;
