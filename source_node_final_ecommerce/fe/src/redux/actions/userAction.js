import axios from "axios";
import { API_DOMAIN } from "../../constants/apiDomain";
import { login } from "../reducers/authSlice";

// Lấy profile
export const fetchProfile = () => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    
    const res = await axios.get(`${API_DOMAIN}/api/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(login({ user: res.data, token }));
  } catch (err) {
    // handle error
  }
};

// Cập nhật thông tin cá nhân
export const updateProfile = (data) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.put(`${API_DOMAIN}/api/users/me`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    dispatch(login({ user: res.data, token }));
  } catch (err) {
    // handle error
  }
};

// Đổi mật khẩu
export const changePassword = (data) => async (dispatch) => {
  try {
    const token = localStorage.getItem("token");
    await axios.patch(`${API_DOMAIN}/api/users/me/change-password`, data, {
      headers: { Authorization: `Bearer ${token}` },
    });
    // Có thể thông báo thành công
  } catch (err) {
    // handle error
  }
};

// Địa chỉ
export const addAddress = (data) => async (dispatch) => {
  const token = localStorage.getItem("token");
  await axios.post(`${API_DOMAIN}/api/users/me/address`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  dispatch(fetchProfile());
};
export const updateAddress = (addr, data) => async (dispatch) => {
  const token = localStorage.getItem("token");
  await axios.put(`${API_DOMAIN}/api/users/me/address/${addr._id}`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
  dispatch(fetchProfile());
};
export const deleteAddress = (addr) => async (dispatch) => {
  const token = localStorage.getItem("token");
  await axios.delete(`${API_DOMAIN}/api/users/me/address/${addr._id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  dispatch(fetchProfile());
};
