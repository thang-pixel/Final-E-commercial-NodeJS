import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../../api/axios";  // <-- thay đúng đường dẫn của bạn

export const fetchHomeData = createAsyncThunk(
  "home/fetchHomeData",
  async (_, { rejectWithValue }) => {
    try {
      const [newRes, bestRes, phoneRes, desktopRes, laptopRes] =
        await Promise.all([
          api.get("/api/products?sort=createdAt_desc&limit=8"),
          api.get("/api/products?sort=best_sellers&limit=8"),
          api.get("/api/products?category=11&limit=8"),
          api.get("/api/products?category=14&limit=8"),
          api.get("/api/products?category=15&limit=8"),
        ]);

      return {
        newProducts: newRes.data.data,
        bestSellers: bestRes.data.data,
        categories: {
          11: phoneRes.data.data,
          14: desktopRes.data.data,
          15: laptopRes.data.data,
        },
      };
    } catch (err) {
      return rejectWithValue(err.response?.data || { message: "Lỗi load homepage" });
    }
  }
);

const homeSlice = createSlice({
  name: "home",
  initialState: {
    newProducts: [],
    bestSellers: [],
    categories: {},
    loaded: false,
    loading: false,
    error: null,
  },
  reducers: {
    resetHome: (state) => {
      state.loaded = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHomeData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchHomeData.fulfilled, (state, action) => {
        state.loading = false;
        state.loaded = true;
        state.newProducts = action.payload.newProducts;
        state.bestSellers = action.payload.bestSellers;
        state.categories = action.payload.categories;
      })
      .addCase(fetchHomeData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Lỗi load homepage";
      });
  },
});

export const { resetHome } = homeSlice.actions;
export default homeSlice.reducer;
