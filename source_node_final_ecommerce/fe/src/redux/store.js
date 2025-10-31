import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authSlice.js';
import categoryReducer from './reducers/categorySlice.js';
import brandReducer from './reducers/brandSlice.js';


const store = configureStore({
  reducer: {
    auth: authReducer,
    categories: categoryReducer,
    brands: brandReducer,
  },
});

export default store;