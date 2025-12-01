import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice.js';
import categoryReducer from './reducers/categorySlice.js';
import brandReducer from './reducers/brandSlice.js';
import productReducer from './reducers/productSlice.js';
import cartReducer from './reducers/cartSlice.js';
import homeReducer from './reducers/homeSlice.js';

 
const store = configureStore({
  reducer: {
    home: homeReducer,
    auth: authReducer,
    categories: categoryReducer,
    brands: brandReducer,
    products: productReducer,
    carts: cartReducer,
  },
});

export default store;