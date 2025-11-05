import axios from "axios";
import { API_DOMAIN } from "../../constants/apiDomain";
import { login,logout } from "../reducers/authSlice";

export const loginUser = (email, password) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_DOMAIN}/api/auth/login`, {
      email,
      password
    });
    const { user, token } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user)); // Thêm dòng này
    dispatch(login({ user, token }));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Login failed" };
  }
};

export const registerUser = (data) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_DOMAIN}/api/auth/register`, data);
    const { user, token } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user)); // Thêm dòng này
    dispatch(login({ user, token }));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Register failed" };
  }
};

export const logoutUser = () => async (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatch(logout());
};