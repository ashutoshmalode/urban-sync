import axios from "axios";
import { store } from "../app/store";
import { logout } from "../features/auth/authSlice";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = store.getState().auth.token || localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";

    const isAuthEndpoint =
      url.includes("/api/auth/otp-login") ||
      url.includes("/api/auth/login") ||
      url.includes("/api/auth/send-otp") ||
      url.includes("/api/auth/verify-otp");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      // Log which URL caused the 401
      console.error("401 on:", url);
      store.dispatch(logout());
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("loginIdentifier");
      localStorage.removeItem("flatNumber");
      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
