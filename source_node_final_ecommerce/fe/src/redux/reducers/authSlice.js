import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: {
    username: "thuyen070",
    full_name: "Tran Minh Thuyen",
    role: "ADMIN",
  },
  token: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },
});

export const { login, logout } = authSlice.actions;
export default authSlice.reducer;
