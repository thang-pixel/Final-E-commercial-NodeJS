import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice.js';
import categoryReducer from './reducers/categorySlice.js';
import brandReducer from './reducers/brandSlice.js';
import productReducer from './reducers/productSlice.js';
import cartReducer from './reducers/cartSlice.js';
import orderReducer from './reducers/orderSlice.js';
import userReducer from './reducers/userSlice.js';
import paymentReducer from './reducers/paymentSlice.js';
import homeReducer from './reducers/homeSlice.js';

const store = configureStore({
  reducer: {
    home: homeReducer,
    auth: authReducer,
    categories: categoryReducer,
    brands: brandReducer,
    products: productReducer,
    carts: cartReducer,
    orders: orderReducer,
    user: userReducer,
    payment: paymentReducer,
  },
});

export default store;