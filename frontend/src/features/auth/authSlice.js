import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  token: localStorage.getItem("token") || null,
  role: localStorage.getItem("role") || null,
  loginIdentifier: localStorage.getItem("loginIdentifier") || null,
  flatNumber: localStorage.getItem("flatNumber") || null,
  isAuthenticated: !!localStorage.getItem("token"),
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { token, role, loginIdentifier, flatNumber } = action.payload;
      state.token = token;
      state.role = role;
      state.loginIdentifier = loginIdentifier;
      state.flatNumber = flatNumber || null;
      state.isAuthenticated = true;
      localStorage.setItem("token", token);
      localStorage.setItem("role", role);
      localStorage.setItem("loginIdentifier", loginIdentifier);
      if (flatNumber) localStorage.setItem("flatNumber", flatNumber);
    },
    logout: (state) => {
      state.token = null;
      state.role = null;
      state.loginIdentifier = null;
      state.flatNumber = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("loginIdentifier");
      localStorage.removeItem("flatNumber");
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectRole = (state) => state.auth.role;
export const selectToken = (state) => state.auth.token;
