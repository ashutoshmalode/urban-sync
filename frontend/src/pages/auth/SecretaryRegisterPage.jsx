import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axiosInstance from "../../api/axiosInstance";

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif" },
};

const SecretaryRegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    mobileNumber: "",
    flatNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "mobileNumber" && (!/^\d*$/.test(value) || value.length > 10))
      return;
    if (name === "accountNumber" && !/^\d*$/.test(value)) return;
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setError("");
  };

  const validateForm = () => {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^[a-zA-Z\s]+$/;
    const pwRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,15}$/;
    if (!form.firstName || !nameRegex.test(form.firstName))
      e.firstName = "Only letters and spaces";
    if (!form.lastName || !nameRegex.test(form.lastName))
      e.lastName = "Only letters and spaces";
    if (!emailRegex.test(form.email)) e.email = "Enter a valid email address";
    if (!pwRegex.test(form.password))
      e.password =
        "8-15 chars with uppercase, lowercase, number, special character";
    if (!/^\d{10}$/.test(form.mobileNumber))
      e.mobileNumber = "Must be exactly 10 digits";
    if (!form.flatNumber) e.flatNumber = "Required";
    if (!form.bankName) e.bankName = "Required";
    if (!form.accountNumber) e.accountNumber = "Required";
    if (!form.ifscCode) e.ifscCode = "Required";
    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      await axiosInstance.post("/api/secretary/register", form);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  if (success)
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f0f9ff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2,
        }}
      >
        <Container maxWidth="xs">
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              p: 4,
              textAlign: "center",
              border: "1px solid #e0f2fe",
              boxShadow: "0 4px 20px rgba(8,145,178,0.08)",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 56, color: "#059669", mb: 2 }} />
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "#1e293b",
                mb: 1,
              }}
            >
              Secretary Registered!
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.85rem",
                color: "#64748b",
                mb: 3,
              }}
            >
              Account created successfully. You can now login.
            </Typography>
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/secretary/login")}
              sx={{
                borderRadius: 2,
                bgcolor: "#0891b2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                "&:hover": { bgcolor: "#0e7490" },
              }}
            >
              Go to Login
            </Button>
          </Paper>
        </Container>
      </Box>
    );

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
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #e0f2fe",
            boxShadow: "0 4px 20px rgba(8,145,178,0.08)",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #0891b2 0%, #0e7490 100%)",
              py: 3,
              px: 3,
              textAlign: "center",
            }}
          >
            <Avatar
              sx={{
                width: 48,
                height: 48,
                mx: "auto",
                mb: 1,
                bgcolor: "rgba(255,255,255,0.2)",
              }}
            >
              <AdminPanelSettingsIcon sx={{ color: "white", fontSize: 24 }} />
            </Avatar>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "1.1rem",
                color: "white",
              }}
            >
              Secretary Registration
            </Typography>
            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontSize: "0.78rem",
                color: "rgba(255,255,255,0.8)",
                mt: 0.3,
              }}
            >
              Create the society administrator account
            </Typography>
          </Box>

          <Box sx={{ p: 3, display: "flex", flexDirection: "column", gap: 2 }}>
            {error && (
              <Alert
                severity="error"
                onClose={() => setError("")}
                sx={{
                  borderRadius: 2,
                  fontFamily: "Inter, sans-serif",
                  py: 0.5,
                }}
              >
                {error}
              </Alert>
            )}

            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                color: "#0891b2",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Personal Details
            </Typography>

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <TextField
                label="First Name *"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                size="small"
                error={!!errors.firstName}
                helperText={errors.firstName}
                sx={fieldStyle}
              />
              <TextField
                label="Last Name *"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                size="small"
                error={!!errors.lastName}
                helperText={errors.lastName}
                sx={fieldStyle}
              />
            </Box>

            <TextField
              label="Email Address *"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              size="small"
              fullWidth
              error={!!errors.email}
              helperText={errors.email}
              sx={fieldStyle}
            />

            <TextField
              label="Password *"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              size="small"
              fullWidth
              error={!!errors.password}
              helperText={
                errors.password ||
                "8-15 chars: uppercase, lowercase, number, special character"
              }
              sx={fieldStyle}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => setShowPassword(!showPassword)}
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

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <TextField
                label="Mobile Number *"
                name="mobileNumber"
                value={form.mobileNumber}
                onChange={handleChange}
                size="small"
                inputProps={{ maxLength: 10 }}
                error={!!errors.mobileNumber}
                helperText={errors.mobileNumber}
                sx={fieldStyle}
              />
              <TextField
                label="Flat Number *"
                name="flatNumber"
                value={form.flatNumber}
                onChange={handleChange}
                size="small"
                placeholder="e.g. A-101"
                error={!!errors.flatNumber}
                helperText={errors.flatNumber}
                sx={fieldStyle}
              />
            </Box>

            <Divider sx={{ borderColor: "#e0f2fe" }} />

            <Typography
              sx={{
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.72rem",
                color: "#0891b2",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
              }}
            >
              Bank Details
            </Typography>

            <TextField
              label="Bank Name *"
              name="bankName"
              value={form.bankName}
              onChange={handleChange}
              size="small"
              fullWidth
              error={!!errors.bankName}
              helperText={errors.bankName}
              sx={fieldStyle}
            />

            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <TextField
                label="Account Number *"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                size="small"
                error={!!errors.accountNumber}
                helperText={errors.accountNumber}
                sx={fieldStyle}
              />
              <TextField
                label="IFSC Code *"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                size="small"
                error={!!errors.ifscCode}
                helperText={errors.ifscCode}
                sx={fieldStyle}
              />
            </Box>

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={loading}
              startIcon={
                loading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AdminPanelSettingsIcon fontSize="small" />
                )
              }
              sx={{
                py: 1.2,
                borderRadius: 2,
                bgcolor: "#0891b2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                fontSize: "0.9rem",
                mt: 0.5,
                boxShadow: "0 2px 8px rgba(8,145,178,0.25)",
                "&:hover": { bgcolor: "#0e7490" },
              }}
            >
              {loading ? "Registering..." : "Register as Secretary"}
            </Button>

            <Box sx={{ textAlign: "center" }}>
              <Button
                size="small"
                startIcon={<ArrowBackIcon fontSize="small" />}
                onClick={() => navigate("/")}
                sx={{
                  color: "#0891b2",
                  fontFamily: "Inter, sans-serif",
                  textTransform: "none",
                }}
              >
                Back to Home
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default SecretaryRegisterPage;
