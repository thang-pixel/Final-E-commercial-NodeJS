import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { API_DOMAIN } from '../../constants/apiDomain';
import axios from 'axios';

// get all products
export const getAllProducts = createAsyncThunk(
  'products/all',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_DOMAIN}/products`, { params: queryParams });
      if (response.data.success){
        return {
          data: response.data.data,
          meta: response.data.meta,
          message: response.data.message,
        };
      } else {
        return rejectWithValue({ message: response.data.message } );
      }
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
)

// export 

// get product by id

// get product by slug

// add product

// edit product

// change-status

// soft delete product

// force delete product

// restore product


const initState = {
  products: [],
  loading: false,
  message: '',
  errors: null,
  currentProduct: null,
  meta: null,
}


const productSlice = createSlice({
  name: 'products',
  initialState: initState,
  reducers: {},
  extraReducers: (builder) => {
    // get all products


  }
});
