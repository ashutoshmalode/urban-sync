import axios from "axios";
import { store } from "../app/store";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    // Try Redux store first, then localStorage as fallback
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
    // Only auto-logout on 401 for protected routes
    // NOT for login/register endpoints
    const url = error.config?.url || "";
    const isAuthEndpoint =
      url.includes("/api/auth/login") ||
      url.includes("/api/secretary/register") ||
      url.includes("/api/secretary/is-registered") ||
      url.includes("/api/registration/resident");

    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("loginIdentifier");
      window.location.href = "/";
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
