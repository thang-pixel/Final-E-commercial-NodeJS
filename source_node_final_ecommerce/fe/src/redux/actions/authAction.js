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
    
    // Kiểm tra status trước khi lưu
    if (user.status === 'inactive') {
      return { 
        success: false, 
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
        user: user
      };
    }
    
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    dispatch(login({ user, token }));
    return { success: true, user: user };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Login failed" };
  }
};

export const socialLoginUser = (provider, token) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_DOMAIN}/api/auth/social`, { provider, token });
    const { user, token: authToken } = res.data;
    console.log('Inactive user tried social login1:', user);
    // Kiểm tra status trước khi lưu
    if (user.status === 'inactive') {
      console.log('Inactive user tried social login:', user);
      return { 
        success: false, 
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.',
        user: user
      };
    }
    
    localStorage.setItem("token", authToken);
    localStorage.setItem("user", JSON.stringify(user));
    dispatch(login({ user, token: authToken }));
    console.log('User logged in via social login:', user);
    return { success: true, user: user };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Social login failed" };
  }
};

export const registerUser = (data) => async (dispatch) => {
  try {
    const res = await axios.post(`${API_DOMAIN}/api/auth/register`, data);
    
    // Kiểm tra response structure
    if (res.data.success) {
      const { user, token } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      dispatch(login({ user, token }));
      return { 
        success: true, 
        message: res.data.message 
      };
    } else {
      return { 
        success: false, 
        message: res.data.message || "Register failed" 
      };
    }
  } catch (err) {
    console.error('Register error:', err);
    return { 
      success: false, 
      message: err.response?.data?.message || "Register failed" 
    };
  }
};



export const guestLoginUser = () => async (dispatch) => {
  try {
    const res = await axios.post(`${API_DOMAIN}/api/auth/guest`);
    const { user, token } = res.data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    dispatch(login({ user, token }));
    return { success: true };
  } catch (err) {
    return { success: false, message: err.response?.data?.message || "Guest login failed" };
  }
};

export const logoutUser = () => async (dispatch) => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  dispatch(logout());
};