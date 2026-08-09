import axios from "axios";
import { store } from "../app/store";
import { logout } from "../features/auth/authSlice";
import toast from "react-hot-toast";

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
      url.includes("/api/auth/verify-otp") ||
      url.includes("/api/secretary/forgot-password");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      const message = error.response?.data?.message || "";
      const isSessionExpired =
        message.includes("Session Expired") ||
        message.includes("session has expired");

      store.dispatch(logout());
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("loginIdentifier");
      localStorage.removeItem("flatNumber");

      if (isSessionExpired) {
        // Small delay so toast shows after navigation
        setTimeout(() => {
          toast.error("Session expired — you were logged in elsewhere", {
            duration: 5000,
            icon: "🔐",
          });
        }, 300);
      }

      window.location.href = "/";
    }

    return Promise.reject(error);
  },
);

export default axiosInstance;
