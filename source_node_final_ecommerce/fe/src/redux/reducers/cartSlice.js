import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'; 
import { api } from '../../api/axios';


/**
 * carts = [
 * {
 * product_id, variant_id, quantity, price, image_url, name, sku, attributes
 * }
 * ]
 */

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
}
const initState = {
  carts: loadCartLocal() || [],
  loading: false,
  message: '',
  errors: null,
}


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
    addToCart: (state, action) => { 
      const { product_id, variant_id } = action.payload;
      
      const existingItemIndex = state.carts.findIndex(
        (item) => item.product_id === product_id && item.variant_id === variant_id
      );
      if (existingItemIndex !== -1) {
        // If item exists, update quantity
        state.carts[existingItemIndex].quantity += action.payload.quantity;
      } else {
        // If item does not exist, add new item
        state.carts.push(action.payload);
      }
      localStorage.setItem('carts', JSON.stringify(state.carts));
    },
    updateQuantity: (state, action) => {
      const { product_id, variant_id, quantity } = action.payload;
      const itemIndex = state.carts.findIndex(
        (item) => item.product_id === product_id && item.variant_id === variant_id
      );
      if (quantity === 0) {
        state.carts = state.carts.filter(
          (item) => !(item.product_id === product_id && item.variant_id === variant_id)
        );
        localStorage.setItem('carts', JSON.stringify(state.carts));
      } else if (itemIndex !== -1) {
        state.carts[itemIndex].quantity = quantity;
      }
      localStorage.setItem('carts', JSON.stringify(state.carts));
    },
    removeFromCart: (state, action) => {
      const { product_id, variant_id } = action.payload;
      state.carts = state.carts.filter(
        (item) => !(item.product_id === product_id && item.variant_id === variant_id)
      );
      localStorage.setItem('carts', JSON.stringify(state.carts));
    }
  },
  extraReducers: (builder) => {
  }

})

export const { clearCartState, addToCart, updateQuantity, removeFromCart } = cartSlice.actions;

export default cartSlice.reducer;