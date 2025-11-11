import axios from "axios";
import qs from "qs";
import { API_DOMAIN } from "../constants/apiDomain";

export const api = axios.create({
  baseURL: API_DOMAIN || "http://localhost:8000",
  paramsSerializer: {
    serialize: (params) => qs.stringify(params, { arrayFormat: "repeat" }),
    // => sort=name_asc&sort=createdAt_desc
  },
});

api.interceptors.request.use((cfg) => {
  const token = localStorage.getItem("token");
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});
