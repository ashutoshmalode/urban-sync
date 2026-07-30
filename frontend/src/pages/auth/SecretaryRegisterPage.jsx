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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from "@mui/material";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import axiosInstance from "../../api/axiosInstance";

const wings = ["A", "B", "C", "D", "E"];

const fieldStyle = {
  "& .MuiOutlinedInput-root": {
    borderRadius: 2,
    fontFamily: "Inter, sans-serif",
    "&.Mui-focused fieldset": { borderColor: "#0891b2" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#0891b2" },
  "& .MuiInputLabel-root": { fontFamily: "Inter, sans-serif" },
};

// Password strength checker
const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*#?&]/.test(password)) score++;

  if (score <= 2)
    return {
      score,
      label: "Weak",
      color: "#dc2626",
      bg: "#fee2e2",
      progress: 33,
    };
  if (score <= 3)
    return {
      score,
      label: "Medium",
      color: "#d97706",
      bg: "#fef3c7",
      progress: 66,
    };
  return {
    score,
    label: "Strong",
    color: "#059669",
    bg: "#dcfce7",
    progress: 100,
  };
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
    wingName: "",
    flatNumber: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
  });
  const [errors, setErrors] = useState({});

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // First name, Last name, Bank name — only letters and spaces
    if (["firstName", "lastName", "bankName"].includes(name)) {
      if (value && !/^[a-zA-Z\s]*$/.test(value)) return;
    }

    // Mobile — only digits, max 10
    if (name === "mobileNumber") {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }

    // Account number — only digits
    if (name === "accountNumber") {
      if (!/^\d*$/.test(value)) return;
    }

    // IFSC — only alphanumeric, no special chars, max 11
    if (name === "ifscCode") {
      if (!/^[a-zA-Z0-9]*$/.test(value) || value.length > 11) return;
    }

    // Flat number — only digits, max 4
    if (name === "flatNumber") {
      if (!/^\d*$/.test(value) || value.length > 4) return;
    }

    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: "" });
    setError("");
  };

  const validateForm = () => {
    const e = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const pwRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,15}$/;

    if (!form.firstName.trim()) e.firstName = "Required";
    if (!form.lastName.trim()) e.lastName = "Required";
    if (!emailRegex.test(form.email)) e.email = "Enter a valid email address";
    if (!pwRegex.test(form.password))
      e.password =
        "8-15 chars: uppercase, lowercase, number, special character";
    if (!/^\d{10}$/.test(form.mobileNumber))
      e.mobileNumber = "Must be exactly 10 digits";
    if (!form.wingName) e.wingName = "Please select a wing";

    // Flat number validation — 3 or 4 digits, not all zeros
    const flatNum = form.flatNumber;
    if (!flatNum || flatNum.length < 3) {
      e.flatNumber = "Must be 3 or 4 digits";
    } else if (/^0+$/.test(flatNum)) {
      e.flatNumber = "Invalid flat number";
    }

    if (!form.bankName.trim()) e.bankName = "Required";
    if (!form.accountNumber) e.accountNumber = "Required";
    if (!form.ifscCode.trim()) e.ifscCode = "Required";

    setErrors(e);
    return Object.values(e).every((v) => !v);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      // Combine wing + flat number for backend
      const payload = {
        ...form,
        flatNumber: `${form.wingName}-${form.flatNumber}`,
      };
      delete payload.wingName;
      await axiosInstance.post("/api/secretary/register", payload);
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ─────────────────────────────────────────────
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
              Society administrator account created successfully.
            </Typography>
            {/* Fix: Go to Landing Page, not login */}
            <Button
              variant="contained"
              fullWidth
              onClick={() => navigate("/")}
              sx={{
                borderRadius: 2,
                bgcolor: "#0891b2",
                fontFamily: "Inter, sans-serif",
                fontWeight: 600,
                "&:hover": { bgcolor: "#0e7490" },
              }}
            >
              Go to Home
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
          {/* Header */}
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

            {/* Personal Details */}
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
                helperText={errors.firstName || "Letters only"}
                sx={fieldStyle}
              />
              <TextField
                label="Last Name *"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                size="small"
                error={!!errors.lastName}
                helperText={errors.lastName || "Letters only"}
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

            {/* Password with strength indicator */}
            <Box>
              <TextField
                label="Password *"
                name="password"
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={handleChange}
                size="small"
                fullWidth
                error={!!errors.password}
                helperText={errors.password}
                sx={fieldStyle}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          {/* Password strength badge */}
                          {form.password && (
                            <Box
                              sx={{
                                px: 1,
                                py: 0.2,
                                borderRadius: 1,
                                bgcolor: passwordStrength.bg,
                                border: `1px solid ${passwordStrength.color}20`,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontFamily: "Inter, sans-serif",
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  color: passwordStrength.color,
                                }}
                              >
                                {passwordStrength.label}
                              </Typography>
                            </Box>
                          )}
                          <IconButton
                            size="small"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <VisibilityOff sx={{ fontSize: 18 }} />
                            ) : (
                              <Visibility sx={{ fontSize: 18 }} />
                            )}
                          </IconButton>
                        </Box>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {/* Password strength bar */}
              {form.password && (
                <Box sx={{ mt: 0.8 }}>
                  <LinearProgress
                    variant="determinate"
                    value={passwordStrength.progress}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: "#f1f5f9",
                      "& .MuiLinearProgress-bar": {
                        bgcolor: passwordStrength.color,
                        borderRadius: 2,
                      },
                    }}
                  />
                  <Typography
                    sx={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: "0.68rem",
                      color: "#94a3b8",
                      mt: 0.3,
                    }}
                  >
                    8-15 chars • uppercase • lowercase • number • special
                    character (@$!%*#?&)
                  </Typography>
                </Box>
              )}
            </Box>

            <TextField
              label="Mobile Number *"
              name="mobileNumber"
              value={form.mobileNumber}
              onChange={handleChange}
              size="small"
              fullWidth
              inputprops={{ maxLength: 10 }}
              error={!!errors.mobileNumber}
              helperText={errors.mobileNumber}
              sx={fieldStyle}
            />

            {/* Wing + Flat Number */}
            <Box
              sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}
            >
              <FormControl
                size="small"
                error={!!errors.wingName}
                sx={fieldStyle}
              >
                <InputLabel sx={{ fontFamily: "Inter, sans-serif" }}>
                  Wing *
                </InputLabel>
                <Select
                  name="wingName"
                  value={form.wingName}
                  onChange={handleChange}
                  label="Wing *"
                  sx={{ fontFamily: "Inter, sans-serif" }}
                >
                  {wings.map((w) => (
                    <MenuItem
                      key={w}
                      value={w}
                      sx={{ fontFamily: "Inter, sans-serif" }}
                    >
                      Wing {w}
                    </MenuItem>
                  ))}
                </Select>
                {errors.wingName && (
                  <Typography
                    sx={{
                      color: "#d32f2f",
                      fontSize: "0.72rem",
                      mt: 0.5,
                      ml: 1.5,
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    {errors.wingName}
                  </Typography>
                )}
              </FormControl>

              <TextField
                label="Flat Number *"
                name="flatNumber"
                value={form.flatNumber}
                onChange={handleChange}
                size="small"
                inputprops={{ maxLength: 4 }}
                error={!!errors.flatNumber}
                helperText={errors.flatNumber || "3-4 digits e.g. 101"}
                sx={fieldStyle}
              />
            </Box>

            {/* Preview flat number */}
            {form.wingName && form.flatNumber && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "#f0f9ff",
                  borderRadius: 1.5,
                  px: 1.5,
                  py: 0.8,
                  border: "1px solid #e0f2fe",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.75rem",
                    color: "#64748b",
                  }}
                >
                  Flat will be saved as:
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#0891b2",
                  }}
                >
                  {form.wingName}-{form.flatNumber}
                </Typography>
              </Box>
            )}

            <Divider sx={{ borderColor: "#e0f2fe" }} />

            {/* Bank Details */}
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
              helperText={errors.bankName || "Letters only"}
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
                helperText={errors.ifscCode || "Alphanumeric only"}
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
