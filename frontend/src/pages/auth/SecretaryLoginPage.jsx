import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
} from "@mui/material";
import ApartmentIcon from "@mui/icons-material/Apartment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LoginIcon from "@mui/icons-material/Login";
import { setCredentials } from "../../features/auth/authSlice";
import axiosInstance from "../../api/axiosInstance";

const fs = (isMobile) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 1.5,
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.82rem" : "0.875rem",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root": {
    fontFamily: "Inter, sans-serif",
    fontSize: isMobile ? "0.82rem" : "0.875rem",
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
});

const SecretaryLoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ loginIdentifier: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleLogin = async () => {
    if (!form.loginIdentifier || !form.password) {
      setError("Please fill in all fields");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.loginIdentifier)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await axiosInstance.post("/api/auth/login", form);
      dispatch(
        setCredentials({
          token: res.data.token,
          role: res.data.role,
          loginIdentifier: res.data.loginIdentifier,
        }),
      );
      navigate("/secretary/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f0f9ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 1.5, sm: 3 },
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #e0f2fe",
            boxShadow: "0 4px 20px rgba(8,145,178,0.08)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
              py: { xs: 2, sm: 3 },
              textAlign: "center",
            }}
          >
            <ApartmentIcon
              sx={{ fontSize: { xs: 28, sm: 32 }, color: "white", mb: 0.3 }}
            />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "0.95rem", sm: "1.05rem" },
                color: "white",
              }}
            >
              Secretary Login
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: { xs: "0.65rem", sm: "0.75rem" },
                color: "rgba(255,255,255,0.85)",
              }}
            >
              UrbanSync Society Management
            </Typography>
          </Box>

          {/* Form */}
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              display: "flex",
              flexDirection: "column",
              gap: { xs: 1.5, sm: 2 },
            }}
          >
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  borderRadius: 1.5,
                  py: 0.4,
                  fontSize: { xs: "0.75rem", sm: "0.82rem" },
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {error}
              </Alert>
            )}

            <TextField
              label="Email Address"
              name="loginIdentifier"
              type="email"
              value={form.loginIdentifier}
              onChange={handleChange}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              fullWidth
              size="small"
              sx={fs(true)}
            />

            <TextField
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              onKeyPress={(e) => e.key === "Enter" && handleLogin()}
              fullWidth
              size="small"
              sx={fs(true)}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        size="small"
                      >
                        {showPassword ? (
                          <VisibilityOff sx={{ fontSize: 16 }} />
                        ) : (
                          <Visibility sx={{ fontSize: 16 }} />
                        )}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Box sx={{ textAlign: "right", mt: -0.5 }}>
              <Typography
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.7rem", sm: "0.75rem" },
                  color: "#0891b2",
                  cursor: "pointer",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                Forgot Password?
              </Typography>
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={loading || !form.loginIdentifier || !form.password}
              startIcon={
                loading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <LoginIcon sx={{ fontSize: "16px !important" }} />
                )
              }
              sx={{
                py: { xs: 0.8, sm: 1 },
                borderRadius: 1.5,
                bgcolor: "#0891b2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: { xs: "0.82rem", sm: "0.875rem" },
                boxShadow: "0 2px 6px rgba(8,145,178,0.25)",
                "&:hover": { bgcolor: "#0e7490" },
                "&.Mui-disabled": { bgcolor: "#bae6fd", color: "white" },
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Link
                component="button"
                onClick={() => navigate("/")}
                sx={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: { xs: "0.72rem", sm: "0.78rem" },
                  color: "#0891b2",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.3,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 13 }} /> Back to Home
              </Link>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              bgcolor: "#f8fafc",
              px: 3,
              py: { xs: 1, sm: 1.5 },
              textAlign: "center",
              borderTop: "1px solid #e0f2fe",
            }}
          >
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.6rem",
                color: "#94a3b8",
              }}
            >
              © 2026 UrbanSync — CDAC Final Project
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SecretaryLoginPage;
