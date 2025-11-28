import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'; 
import { api } from '../../api/axios';
// import api from 'api';

// get all products
export const getAllProducts = createAsyncThunk(
  'products/all',
  async (queryParams = {}, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/products`, { params: queryParams });
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
      return rejectWithValue({
        message: error.response?.data?.message || 'Get All Products Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
)


// get product by id
export const getProductById = createAsyncThunk(
  'products/id',
  async (productId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/products/${productId}/detail`);
      if (response.data.success) {
        return {
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        return rejectWithValue({ message: response.data.message, errors: response.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Get Product Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
)

// get product by slug
export const getProductBySlug = createAsyncThunk(
  'products/slug',
  async (slug, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/products/${slug}`);
      if (response.data.success) {
        return {
          data: response.data.data,
          message: response.data.message,
        };
      } else {
        return rejectWithValue({ message: response.data.message, errors: response.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Get Product Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
)

// add product
export const addProduct = createAsyncThunk(
  'products/add',
  async (productData, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/products`, productData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        return {
          data: res.data.data,
          message: res.data.message,
        };
      } else {
        return rejectWithValue({ message: res.data.message, errors: res.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Add Product Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
)

// edit product
export const editProduct = createAsyncThunk(
  'products/edit',
  async ({ productId, productData }, { rejectWithValue }) => {
    try {
      console.log('👉 Edit payload:', productData);
      // return; 
      const res = await api.put(`/api/products/${productId}`,
         productData,        
      );

      if (res.data.success) {
        return {
          data: res.data.data,
          message: res.data.message,
        };
      } else {
        return rejectWithValue({ message: res.data.message, errors: res.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Edit Product Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
)

// change-status
export const changeProductStatus = createAsyncThunk(
  'products/changeStatus',
  async ({ productId, status }, { rejectWithValue }) => {
    try {
      const res = await api.patch(
        `/api/products/${productId}/change-status`,
        { status }
      );

      if (res.data.success) {
        return {
          data: res.data.data,
          message: res.data.message,
        };
      } else {
        return rejectWithValue({ message: res.data.message, errors: res.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Change Product Status Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
)

// soft delete product
export const softDeleteProduct = createAsyncThunk(
  'products/softDelete',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/api/products/${productId}/soft`);

      if (res.data.success) {
        return {
          data: res.data.data,
          message: res.data.message,
        };
      } else {
        return rejectWithValue({ message: res.data.message, errors: res.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Soft Delete Product Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
)

// force delete product
export const forceDeleteProduct = createAsyncThunk(
  'products/forceDelete',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/api/products/${productId}/force-delete`);
      if (res.data.success) {
        return {
          data: productId,
          message: res.data.message,
        };
      } else {
        return rejectWithValue({ message: res.data.message, errors: res.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Force Delete Product Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

// restore product
export const restoreProduct = createAsyncThunk(
  'products/restore',
  async (productId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/api/products/${productId}/restore`);

      if (res.data.success) {
        return {
          data: res.data.data,
          message: res.data.message,
        };
      } else {
        return rejectWithValue({ message: res.data.message, errors: res.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Restore Product Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

// product voi variants
// add variant
export const addProductVariant = createAsyncThunk(
  'products/addVariant',
  async ({ productId, ...variantData }, { rejectWithValue }) => { 
    try {
      const res = await api.post(
        `/api/product-variants/products/${productId}/variants`,  
        variantData
      );
      if (res.data.success) {
        return {
          data: res.data.data,
          message: res.data.message,
        };
      } else {
        return rejectWithValue({ message: res.data.message, errors: res.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Add Product Variant Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

// update variant status
export const updateVariantStatus = createAsyncThunk(
  'products/updateVariantStatus',
  async ({ variantId, productId, status }, { rejectWithValue }) => {  
    try {
      const res = await api.patch(
        `/api/product-variants/products/${productId}/variants/${variantId}/status`,
        { status }
      );
      if (res.data.success) {
        return {
          data: res.data.data,
          message: res.data.message,
        };
      } else {
        return rejectWithValue({ message: res.data.message, errors: res.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Update Variant Status Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

// update variant
export const updateVariant = createAsyncThunk(
  'products/updateVariant',
  async ({ variantId, productId, ...data }, { rejectWithValue }) => { 
    try {
      const res = await api.put(
        `/api/product-variants/products/${productId}/variants/${variantId}`,
        data
      );
      if (res.data.success) {
        return {
          data: res.data.data,
          message: res.data.message,
        };
      } else {
        return rejectWithValue({ message: res.data.message, errors: res.data.errors });
      }
    } catch (error) {
      console.log('Error updating variant:', error);
      return rejectWithValue({
        message: error.response?.data?.message || 'Update Product Variant Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);

// delete variant
export const deleteVariant = createAsyncThunk(
  'products/deleteVariant',
  async ({ variantId, productId }, { rejectWithValue }) => { 
    try {
      const res = await api.delete(`/api/product-variants/products/${productId}/variants/${variantId}`);
      if (res.data.success) {
        return {
          data: variantId,
          message: res.data.message,
        };
      } else {
        return rejectWithValue({ message: res.data.message, errors: res.data.errors });
      }
    } catch (error) {
      return rejectWithValue({
        message: error.response?.data?.message || 'Delete Product Variant Failed',
        errors: error.response?.data?.errors || null,
      });
    }
  }
);


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
  reducers: { 
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
  },
  extraReducers: (builder) => {
    builder
          .addCase(getAllProducts.fulfilled, (state, action) => {
            state.products = action.payload.data;
            state.meta = action.payload.meta;
            state.message = action.payload.message;
            state.loading = false;
          })
          .addCase(getProductById.fulfilled, (state, action) => {
            state.currentProduct = action.payload.data;
            state.loading = false;
          })
          .addCase(getProductBySlug.fulfilled, (state, action) => {
            state.currentProduct = action.payload.data;
            state.loading = false;
          })
          .addCase(addProduct.fulfilled, (state, action) => {
            if (action.payload?.data) {
              state.products.push(action.payload.data);
            }
            state.currentProduct = action.payload.data;
            state.message = action.payload.message;
            state.loading = false;
          })
          .addCase(editProduct.fulfilled, (state, action) => {
            const updated = action.payload.data;
            const index = state.products.findIndex(
              (item) => item._id === updated._id
            );
            if (index !== -1) state.products[index] = updated;
            state.message = action.payload.message;
            state.loading = false;
          })
          .addCase(changeProductStatus.fulfilled, (state, action) => {
            const updated = action.payload.data;
            const index = state.products.findIndex(
              (item) => item._id === updated._id
            );
            if (index !== -1) state.products[index] = updated;
            state.message = action.payload.message;
            state.loading = false;
          })
          .addCase(softDeleteProduct.fulfilled, (state, action) => {
            state.products = state.products.filter(
              (item) => item._id !== action.payload.data
            );
            state.message = action.payload.message;
            state.loading = false;
          })
          .addCase(forceDeleteProduct.fulfilled, (state, action) => {
            state.products = state.products.filter(
              (item) => item._id !== action.payload.data
            );
            state.message = action.payload.message;
            state.loading = false;
          })
          .addCase(restoreProduct.fulfilled, (state, action) => {
            state.products.push(action.payload.data);
            state.currentProduct = action.payload.data;
            state.message = action.payload.message;
            state.loading = false;
          })
          .addCase(updateVariant.fulfilled, (state, action) => {
            const updatedVariant = action.payload.data;
            if (state.currentProduct && state.currentProduct.variants) {
              const variantIndex = state.currentProduct.variants.findIndex(
                (variant) => variant._id === updatedVariant._id
              );
              if (variantIndex !== -1) {
                state.currentProduct.variants[variantIndex] = updatedVariant;
              }
            }
            state.message = action.payload.message;
            state.loading = false;
          })
          // 🔥 Gom matcher xử lý pending/rejected chung
          .addMatcher(
            (action) => action.type.endsWith('/pending'),
            (state) => {
              state.loading = true;
              state.errors = null;
              state.message = '';
            }
          )
          .addMatcher(
            (action) => action.type.endsWith('/rejected'),
            (state, action) => {
              state.loading = false;
              state.errors = action.payload?.errors || null;
              state.message =
                action.payload?.message || action.payload || 'Lỗi không xác định';
            }
          ); 

  }
});

export default productSlice.reducer;