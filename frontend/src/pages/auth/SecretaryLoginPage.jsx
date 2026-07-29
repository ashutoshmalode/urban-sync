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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.loginIdentifier)) {
      setError("Please enter a valid email address");
      return;
    }
    setLoading(true);
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
      setError(err.response?.data?.message || "Login failed");
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
        p: { xs: 2, sm: 3 },
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
              py: 3,
              textAlign: "center",
            }}
          >
            <ApartmentIcon sx={{ fontSize: 32, color: "white", mb: 0.5 }} />
            <Typography variant="subtitle1" fontWeight={700} color="white">
              Secretary Login
            </Typography>
            <Typography
              variant="caption"
              sx={{ color: "rgba(255,255,255,0.85)" }}
            >
              UrbanSync Society Management
            </Typography>
          </Box>

          {/* Form */}
          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{ borderRadius: 1.5, py: 0.5 }}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&.Mui-focused fieldset": { borderColor: "#0891b2" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
              }}
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
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 1.5,
                  "&.Mui-focused fieldset": { borderColor: "#0891b2" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      size="small"
                    >
                      {showPassword ? (
                        <VisibilityOff fontSize="small" />
                      ) : (
                        <Visibility fontSize="small" />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              variant="contained"
              fullWidth
              onClick={handleLogin}
              disabled={loading || !form.loginIdentifier || !form.password}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <LoginIcon fontSize="small" />
                )
              }
              sx={{
                py: 1,
                borderRadius: 1.5,
                bgcolor: "#0891b2",
                fontWeight: 700,
                fontSize: "0.875rem",
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
                variant="caption"
                onClick={() => navigate("/")}
                sx={{
                  color: "#0891b2",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 0.3,
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <ArrowBackIcon sx={{ fontSize: 14 }} />
                Back to Home
              </Link>
            </Box>
          </Box>

          {/* Footer */}
          <Box
            sx={{
              bgcolor: "#f8fafc",
              px: 3,
              py: 1.5,
              textAlign: "center",
              borderTop: "1px solid #e0f2fe",
            }}
          >
            <Typography
              variant="caption"
              color="text.secondary"
              fontSize="0.65rem"
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
