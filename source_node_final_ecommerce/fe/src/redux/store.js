import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice.js';
import categoryReducer from './reducers/categorySlice.js';
import brandReducer from './reducers/brandSlice.js';
import productReducer from './reducers/productSlice.js';
import cartReducer from './reducers/cartSlice.js';

 
const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    brands: brandReducer,
    products: productReducer,
    carts: cartReducer,
  },
});

export default store;