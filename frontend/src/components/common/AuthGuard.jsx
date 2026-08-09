import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../features/auth/authSlice";

const AuthGuard = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (!token) return;

    // Check token expiry every 60 seconds
    const interval = setInterval(() => {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        const expiry = payload.exp * 1000;
        if (Date.now() >= expiry) {
          dispatch(logout());
          window.location.href = "/";
        }
      } catch {
        dispatch(logout());
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [token, dispatch]);

  return null;
};

export default AuthGuard;
