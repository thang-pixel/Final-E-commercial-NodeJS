import axios from "axios";
import qs from "qs";
import { message } from "antd";   
import { API_DOMAIN } from "../constants/apiDomain";

const api = axios.create({
  baseURL: API_DOMAIN || "http://localhost:8000",
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
    // => sort=name_asc&sort=createdAt_desc
  }, 
  withCredentials: true, // để cookie refresh/CSRF tự đi kèm khi bạn dùng /token/refresh
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) 
    cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

let redirectTimer = null;
const AUTH_PATHS = ["/api/auth/login", "/api/auth/refresh", "/api/auth/register"];

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const { response, config } = err || {};
    const status = response?.status;
    const url = config?.url || "";

    // Bỏ qua chính các request auth để tránh vòng lặp
    if (AUTH_PATHS.some((p) => url?.includes(p))) {
      return Promise.reject(err);
    }

    // Chỉ xử lý một lần cho request này
    if (config?._authHandled) return Promise.reject(err);
    if (status === 401 || status === 403) config._authHandled = true;

    // 403: vào trang Forbidden (không cần đợi)
    if (status === 403) {
      if (redirectTimer) clearTimeout(redirectTimer);
      // tuỳ route của bạn: '/forbidden' hoặc '/error/403'
      window.location.replace("/forbidden");
      return Promise.reject(err);
    }

    // 401: xoá token và về trang login sau 2s
    if (status === 401) {
      if (redirectTimer) clearTimeout(redirectTimer);
      localStorage.removeItem("token");
      // nếu đã ở trang login thì thôi
      if (!window.location.pathname.startsWith("/login")) {
        redirectTimer = setTimeout(() => {
          window.location.assign("/login?reason=auth");
        }, 2000);
      }
    }

    return Promise.reject(err);
  }
);

// api error helper: bóc tách lỗi axios
const parseAxiosError = (err) => {
  const resp = err?.response;
  return {
    success: resp?.success,
    data: resp?.data,
    message:
      resp?.data?.message ||
      resp?.data?.detail ||
      err?.message ||
      "Có lỗi xảy ra. Vui lòng thử lại.",
  };
}

export { api, parseAxiosError };